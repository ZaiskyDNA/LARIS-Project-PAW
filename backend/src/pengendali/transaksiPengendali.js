const mongoose = require('mongoose');
const Transaksi = require('../model/Transaksi');
const MutasiStok = require('../model/MutasiStok');
const Produk = require('../model/Produk');
const {
  prosesPenguranganStokTransaksi,
  pulihkanStok,
} = require('../layanan/layananStok');
const { buatNomorTransaksi } = require('../utilitas/nomorTransaksi');
const {
  PETA_STATUS,
  terapkanStatus,
  buatSesiQris,
  sinkronkanStatus,
  batalkanQris,
  simulasikanBayar,
  tandaTanganValid,
} = require('../layanan/layananPembayaran');
const { normalisasiItems } = require('../validator/transaksiValidator');
const { sukses, gagal } = require('../utilitas/formatResponsApi');
const { getRentangTanggalUTC, validasiRentangTanggal } = require('../utilitas/zonaWaktu');
const { adalahIdValid, parsePaginasi } = require('../utilitas/validasi');

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

// Memuat transaksi dan memastikan kasir hanya menyentuh transaksinya sendiri (BR-10)
const ambilTransaksiMilik = async (req, res) => {
  const { id } = req.params;
  const transaksi = adalahIdValid(id) ? await Transaksi.findById(id) : null;
  if (!transaksi) {
    gagal(res, 404, 'Transaksi tidak ditemukan', 'TIDAK_DITEMUKAN');
    return null;
  }
  if (req.user.role === 'kasir' && transaksi.kasirId.toString() !== req.user._id.toString()) {
    gagal(res, 403, 'Akses ditolak: transaksi ini milik kasir lain', 'AKSES_DITOLAK');
    return null;
  }
  return transaksi;
};

const tanganiGalatBisnis = (error, res, next) =>
  error.statusCode ? gagal(res, error.statusCode, error.message, error.kodeGalat) : next(error);

const bayarQris = async (req, res, next) => {
  try {
    const transaksi = await ambilTransaksiMilik(req, res);
    if (!transaksi) return;

    if (transaksi.metodeBayar !== 'qris' || transaksi.statusBayar !== 'menunggu') {
      return gagal(res, 400, 'Transaksi ini tidak menunggu pembayaran QRIS', 'VALIDASI_GAGAL');
    }

    const sesi = await buatSesiQris(transaksi, req.user.nama);
    const pesan = sesi.simulasi
      ? 'Gateway Midtrans belum dikonfigurasi, kode QR simulasi dibuat'
      : 'Berhasil membuat kode QRIS';
    return sukses(res, 200, pesan, sesi);
  } catch (error) {
    tanganiGalatBisnis(error, res, next);
  }
};

const cekStatusQris = async (req, res, next) => {
  try {
    const transaksi = await ambilTransaksiMilik(req, res);
    if (!transaksi) return;
    const terkini = await sinkronkanStatus(transaksi);
    return sukses(res, 200, 'Status pembayaran diperbarui', terkini);
  } catch (error) {
    tanganiGalatBisnis(error, res, next);
  }
};

const batalkanTransaksiQris = async (req, res, next) => {
  try {
    const transaksi = await ambilTransaksiMilik(req, res);
    if (!transaksi) return;
    const terkini = await batalkanQris(transaksi);
    return sukses(res, 200, 'Pembayaran QRIS dibatalkan', terkini);
  } catch (error) {
    tanganiGalatBisnis(error, res, next);
  }
};

const simulasiBayarQris = async (req, res, next) => {
  try {
    const transaksi = await ambilTransaksiMilik(req, res);
    if (!transaksi) return;
    const terkini = await simulasikanBayar(transaksi);
    return sukses(res, 200, 'Pembayaran QRIS simulasi diterima', terkini);
  } catch (error) {
    tanganiGalatBisnis(error, res, next);
  }
};

const webhookMidtrans = async (req, res, next) => {
  try {
    if (!tandaTanganValid(req.body)) {
      return gagal(res, 401, 'Tanda tangan notifikasi tidak valid', 'TIDAK_TERAUTENTIKASI');
    }

    const transaksi = await Transaksi.findOne({ midtransOrderId: req.body.order_id });
    if (!transaksi) {
      return gagal(res, 404, 'Transaksi tidak ditemukan', 'TIDAK_DITEMUKAN');
    }

    await terapkanStatus(transaksi._id, PETA_STATUS[req.body.transaction_status]);
    return sukses(res, 200, 'Notifikasi diproses');
  } catch (error) {
    tanganiGalatBisnis(error, res, next);
  }
};

module.exports = {
  buatTransaksi,
  daftarTransaksi,
  detailTransaksi,
  bayarQris,
  cekStatusQris,
  batalkanTransaksiQris,
  simulasiBayarQris,
  webhookMidtrans,
};
