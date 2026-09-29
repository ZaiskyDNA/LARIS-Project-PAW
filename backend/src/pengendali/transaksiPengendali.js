const crypto = require('crypto');
const mongoose = require('mongoose');
const Transaksi = require('../model/Transaksi');
const MutasiStok = require('../model/MutasiStok');
const Produk = require('../model/Produk');
const {
  prosesPenguranganStokTransaksi,
  pulihkanStok,
} = require('../layanan/layananStok');
const { buatNomorTransaksi } = require('../utilitas/nomorTransaksi');
const { snap } = require('../konfigurasi/midtrans');
const { sukses, gagal } = require('../utilitas/formatResponsApi');
const { getRentangTanggalUTC, validasiRentangTanggal } = require('../utilitas/zonaWaktu');
const { adalahIdValid, adalahBilanganBulat, parsePaginasi } = require('../utilitas/validasi');

const normalisasiItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return { galat: 'Keranjang masih kosong' };
  }

  const gabungan = new Map();
  for (const item of items) {
    if (!item || !adalahIdValid(item.productId)) {
      return { galat: 'Produk tidak ditemukan', field: 'items[].productId' };
    }
    if (!adalahBilanganBulat(item.qty) || item.qty < 1) {
      return { galat: 'Kuantitas harus bilangan bulat minimal 1', field: 'items[].qty' };
    }
    const kunci = String(item.productId);
    gabungan.set(kunci, (gabungan.get(kunci) || 0) + item.qty);
  }

  return { items: [...gabungan].map(([productId, qty]) => ({ productId, qty })) };
};

const buatTransaksi = async (req, res, next) => {
  try {
    const { items, metodeBayar, nominalBayar } = req.body;

    const hasil = normalisasiItems(items);
    if (hasil.galat) {
      return gagal(res, 400, hasil.galat, 'VALIDASI_GAGAL', hasil.field ? [{ field: hasil.field, pesan: hasil.galat }] : null);
    }

    if (!['tunai', 'qris'].includes(metodeBayar)) {
      return gagal(res, 400, 'Metode bayar tidak valid', 'VALIDASI_GAGAL');
    }

    const processedItems = [];
    let grandTotal = 0;

    for (const item of hasil.items) {
      const produk = await Produk.findOne({ _id: item.productId, isAktif: true });
      if (!produk) {
        return gagal(res, 404, 'Produk tidak ditemukan', 'TIDAK_DITEMUKAN');
      }

      if (produk.stok === 0) {
        return gagal(res, 400, `Stok ${produk.nama} habis`, 'STOK_TIDAK_CUKUP');
      }

      if (produk.stok < item.qty) {
        return gagal(
          res,
          400,
          `Stok ${produk.nama} tidak mencukupi (tersisa ${produk.stok})`,
          'STOK_TIDAK_CUKUP'
        );
      }

      const subtotal = produk.harga * item.qty;
      grandTotal += subtotal;

      processedItems.push({
        productId: produk._id,
        nama: produk.nama,
        hargaSaat: produk.harga,
        qty: item.qty,
        subtotal,
      });
    }

    let kembalian = 0;
    if (metodeBayar === 'tunai') {
      if (typeof nominalBayar !== 'number' || Number.isNaN(nominalBayar) || nominalBayar < grandTotal) {
        return gagal(res, 400, 'Nominal pembayaran kurang dari total', 'VALIDASI_GAGAL', [
          { field: 'nominalBayar', pesan: 'Nominal pembayaran kurang dari total' },
        ]);
      }
      kembalian = nominalBayar - grandTotal;
    }

    const transaksiId = new mongoose.Types.ObjectId();

    if (metodeBayar === 'tunai') {
      await prosesPenguranganStokTransaksi(processedItems, req.user._id, transaksiId);
    }

    let transaksiBaru;
    try {
      for (let percobaan = 1; !transaksiBaru; percobaan++) {
        try {
          transaksiBaru = await Transaksi.create({
            _id: transaksiId,
            nomorTransaksi: await buatNomorTransaksi(),
            kasirId: req.user._id,
            namaKasir: req.user.nama,
            items: processedItems,
            total: grandTotal,
            metodeBayar,
            statusBayar: metodeBayar === 'tunai' ? 'berhasil' : 'menunggu',
            nominalBayar: metodeBayar === 'tunai' ? nominalBayar : grandTotal,
            kembalian,
          });
        } catch (error) {
          const bentrokNomor = error.code === 11000 && error.keyPattern && error.keyPattern.nomorTransaksi;
          if (!bentrokNomor || percobaan >= 5) throw error;
        }
      }
    } catch (error) {
      if (metodeBayar === 'tunai') {
        await pulihkanStok(processedItems);
        await MutasiStok.deleteMany({ refId: transaksiId });
      }
      throw error;
    }

    return sukses(res, 201, 'Transaksi berhasil disimpan', transaksiBaru);
  } catch (error) {
    if (error.kodeGalat === 'STOK_TIDAK_CUKUP') {
      return gagal(res, 400, error.message, 'STOK_TIDAK_CUKUP');
    }
    next(error);
  }
};

const daftarTransaksi = async (req, res, next) => {
  try {
    const { tanggalMulai, tanggalAkhir, halaman, perHalaman } = req.query;

    const galatTanggal = validasiRentangTanggal(tanggalMulai, tanggalAkhir);
    if (galatTanggal) {
      return gagal(res, 400, galatTanggal, 'VALIDASI_GAGAL');
    }

    const query = {};

    if (req.user.role === 'kasir') {
      query.kasirId = req.user._id;
    }

    if (tanggalMulai || tanggalAkhir) {
      const { mulai, akhir } = getRentangTanggalUTC(tanggalMulai, tanggalAkhir);
      query.createdAt = { $gte: mulai, $lte: akhir };
    }

    const { page, limit, skip } = parsePaginasi(halaman, perHalaman);

    const total = await Transaksi.countDocuments(query);
    const transaksiList = await Transaksi.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return sukses(res, 200, 'Berhasil mengambil riwayat transaksi', transaksiList, {
      halaman: page,
      perHalaman: limit,
      total,
      totalHalaman: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

const detailTransaksi = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!adalahIdValid(id)) {
      return gagal(res, 404, 'Transaksi tidak ditemukan', 'TIDAK_DITEMUKAN');
    }

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
    if (!adalahIdValid(id)) {
      return gagal(res, 404, 'Transaksi tidak ditemukan', 'TIDAK_DITEMUKAN');
    }

    const transaksi = await Transaksi.findById(id);

    if (!transaksi) {
      return gagal(res, 404, 'Transaksi tidak ditemukan', 'TIDAK_DITEMUKAN');
    }

    if (req.user.role === 'kasir' && transaksi.kasirId.toString() !== req.user._id.toString()) {
      return gagal(res, 403, 'Akses ditolak: transaksi ini milik kasir lain', 'AKSES_DITOLAK');
    }

    if (transaksi.metodeBayar !== 'qris' || transaksi.statusBayar !== 'menunggu') {
      return gagal(res, 400, 'Transaksi ini tidak menunggu pembayaran QRIS', 'VALIDASI_GAGAL');
    }

    const parameter = {
      transaction_details: {
        order_id: `${transaksi.nomorTransaksi}-${Date.now()}`,
        gross_amount: transaksi.total,
      },
      customer_details: {
        first_name: req.user.nama,
      },
      enabled_payments: ['gopay', 'qris'],
    };

    let sesi;
    let pesan = 'Berhasil membuat sesi QRIS';
    try {
      sesi = await snap.createTransaction(parameter);
    } catch (e) {
      sesi = { token: 'mock_snap_token_sandbox', redirect_url: null, mock: true };
      pesan = 'Gateway Midtrans tidak tersedia, sesi QRIS tiruan dibuat (sandbox)';
    }

    transaksi.midtransOrderId = parameter.transaction_details.order_id;
    await transaksi.save();

    return sukses(res, 200, pesan, { ...sesi, midtransOrderId: transaksi.midtransOrderId });
  } catch (error) {
    next(error);
  }
};

const tandaTanganValid = ({ order_id, status_code, gross_amount, signature_key }) => {
  if (!order_id || !status_code || !gross_amount || !signature_key) return false;
  const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-placeholder';
  const harapan = crypto
    .createHash('sha512')
    .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
    .digest('hex');
  return harapan === signature_key;
};

const webhookMidtrans = async (req, res, next) => {
  try {
    if (!tandaTanganValid(req.body)) {
      return gagal(res, 401, 'Tanda tangan notifikasi tidak valid', 'TIDAK_TERAUTENTIKASI');
    }

    const { order_id, transaction_status } = req.body;

    const transaksi = await Transaksi.findOne({ midtransOrderId: order_id });
    if (!transaksi) {
      return gagal(res, 404, 'Transaksi tidak ditemukan', 'TIDAK_DITEMUKAN');
    }

    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      if (transaksi.statusBayar === 'menunggu') {
        try {
          await prosesPenguranganStokTransaksi(transaksi.items, transaksi.kasirId, transaksi._id);
        } catch (error) {
          if (error.kodeGalat === 'STOK_TIDAK_CUKUP') {
            transaksi.statusBayar = 'gagal';
            await transaksi.save();
            return gagal(res, 422, error.message, 'PEMBAYARAN_GAGAL');
          }
          throw error;
        }
        transaksi.statusBayar = 'berhasil';
        await transaksi.save();
      }
    } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
      if (transaksi.statusBayar === 'menunggu') {
        transaksi.statusBayar = 'dibatalkan';
        await transaksi.save();
      }
    }

    return sukses(res, 200, 'Notifikasi diproses');
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
