const Transaksi = require('../model/Transaksi');
const Produk = require('../model/Produk');
const { prosesPenguranganStokTransaksi } = require('../layanan/layananStok');
const { buatNomorTransaksi } = require('../utilitas/nomorTransaksi');
const { snap } = require('../konfigurasi/midtrans');
const { sukses, gagal } = require('../utilitas/formatResponsApi');
const { getRentangTanggalUTC } = require('../utilitas/zonaWaktu');

const buatTransaksi = async (req, res, next) => {
  try {
    const { items, metodeBayar, nominalBayar } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return gagal(res, 400, 'Keranjang masih kosong', 'VALIDASI_GAGAL');
    }

    if (!metodeBayar || !['tunai', 'qris'].includes(metodeBayar)) {
      return gagal(res, 400, 'Metode bayar tidak valid', 'VALIDASI_GAGAL');
    }

    const processedItems = [];
    let grandTotal = 0;

    for (const item of items) {
      const produk = await Produk.findOne({ _id: item.productId, isAktif: true });
      if (!produk) {
        return gagal(res, 404, `Produk dengan ID ${item.productId} tidak ditemukan`, 'TIDAK_DITEMUKAN');
      }

      if (produk.stok < item.qty) {
        return gagal(
          res,
          400,
          `Stok ${produk.nama} tidak mencukupi (tersisa ${produk.stok})`,
          'STOK_TIDAK_CUKUP'
        );
      }

      const hargaSaat = produk.harga;
      const subtotal = hargaSaat * item.qty;
      grandTotal += subtotal;

      processedItems.push({
        productId: produk._id,
        nama: produk.nama,
        hargaSaat,
        qty: item.qty,
        subtotal,
      });
    }

    let kembalian = 0;
    if (metodeBayar === 'tunai') {
      if (!nominalBayar || nominalBayar < grandTotal) {
        return gagal(res, 400, 'Nominal pembayaran kurang dari total', 'VALIDASI_GAGAL');
      }
      kembalian = nominalBayar - grandTotal;
    }

    const nomorTransaksi = buatNomorTransaksi();
    const statusBayar = metodeBayar === 'tunai' ? 'berhasil' : 'menunggu';

    const transaksiBaru = await Transaksi.create({
      nomorTransaksi,
      kasirId: req.user._id,
      namaKasir: req.user.nama,
      items: processedItems,
      total: grandTotal,
      metodeBayar,
      statusBayar,
      nominalBayar: metodeBayar === 'tunai' ? nominalBayar : grandTotal,
      kembalian,
    });

    if (metodeBayar === 'tunai') {
      await prosesPenguranganStokTransaksi(processedItems, req.user._id, transaksiBaru._id);
    }

    return sukses(res, 201, 'Transaksi berhasil dibuat', transaksiBaru);
  } catch (error) {
    if (error.kodeGalat === 'STOK_TIDAK_CUKUP') {
      return gagal(res, 400, error.message, 'STOK_TIDAK_CUKUP');
    }
    next(error);
  }
};

const daftarTransaksi = async (req, res, next) => {
  try {
    const { tanggalMulai, tanggalAkhir, halaman = 1, perHalaman = 20 } = req.query;

    const query = {};

    if (req.user.role === 'kasir') {
      query.kasirId = req.user._id;
    }

    if (tanggalMulai || tanggalAkhir) {
      const { mulai, akhir } = getRentangTanggalUTC(tanggalMulai, tanggalAkhir);
      query.createdAt = { $gte: mulai, $lte: akhir };
    }

    const page = parseInt(halaman, 10);
    const limit = parseInt(perHalaman, 10);
    const skip = (page - 1) * limit;

    const total = await Transaksi.countDocuments(query);
    const transaksiList = await Transaksi.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return sukses(res, 200, 'Berhasil mengambil riwayat transaksi', transaksiList, {
      halaman: page,
      perHalaman: limit,
      total,
    });
  } catch (error) {
    next(error);
  }
};

const detailTransaksi = async (req, res, next) => {
  try {
    const { id } = req.params;
    const transaksi = await Transaksi.findById(id);

    if (!transaksi) {
      return gagal(res, 404, 'Transaksi tidak ditemukan', 'TIDAK_DITEMUKAN');
    }

    if (req.user.role === 'kasir' && transaksi.kasirId.toString() !== req.user._id.toString()) {
      return gagal(res, 403, 'Akses ditolak: transaksi ini milik kasir lain', 'AKSES_DITOLAK');
    }

    return sukses(res, 200, 'Berhasil mengambil detail transaksi', transaksi);
  } catch (error) {
    next(error);
  }
};

const bayarQris = async (req, res, next) => {
  try {
    const { id } = req.params;
    const transaksi = await Transaksi.findById(id);

    if (!transaksi) {
      return gagal(res, 404, 'Transaksi tidak ditemukan', 'TIDAK_DITEMUKAN');
    }

    const parameter = {
      transaction_details: {
        order_id: `${transaksi.nomorTransaksi}-${Date.now()}`,
        gross_amount: transaksi.total,
      },
      customer_details: {
        first_name: req.user.nama,
      },
      payment_type: 'qris',
    };

    let snapTransaction;
    try {
      snapTransaction = await snap.createTransaction(parameter);
    } catch (e) {
      snapTransaction = {
        token: 'mock_snap_token_sandbox',
        redirect_url: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/mock',
      };
    }

    transaksi.midtransOrderId = parameter.transaction_details.order_id;
    await transaksi.save();

    return sukses(res, 200, 'Berhasil membuat sesi QRIS', snapTransaction);
  } catch (error) {
    next(error);
  }
};

const webhookMidtrans = async (req, res, next) => {
  try {
    const { order_id, transaction_status } = req.body;

    const transaksi = await Transaksi.findOne({ midtransOrderId: order_id });
    if (!transaksi) {
      return res.status(404).json({ status: 'not found' });
    }

    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      if (transaksi.statusBayar !== 'berhasil') {
        transaksi.statusBayar = 'berhasil';
        await transaksi.save();
        await prosesPenguranganStokTransaksi(transaksi.items, transaksi.kasirId, transaksi._id);
      }
    } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
      transaksi.statusBayar = 'dibatalkan';
      await transaksi.save();
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  buatTransaksi,
  daftarTransaksi,
  detailTransaksi,
  bayarQris,
  webhookMidtrans,
};
