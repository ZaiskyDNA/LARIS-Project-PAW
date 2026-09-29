const Transaksi = require('../model/Transaksi');
const Produk = require('../model/Produk');
const { cache } = require('../konfigurasi/cache');
const { getRentangTanggalUTC } = require('../utilitas/zonaWaktu');

const getRingkasanDashboard = async () => {
  const cacheKey = 'laporan:ringkasan';
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const { mulai, akhir } = getRentangTanggalUTC();

  const aggTotal = await Transaksi.aggregate([
    {
      $match: {
        createdAt: { $gte: mulai, $lte: akhir },
        statusBayar: 'berhasil',
      },
    },
    {
      $group: {
        _id: null,
        totalOmzet: { $sum: '$total' },
        jumlahTransaksi: { $sum: 1 },
        rataRataTransaksi: { $avg: '$total' },
      },
    },
  ]);

  const ringkasanHariIni = aggTotal[0] || {
    totalOmzet: 0,
    jumlahTransaksi: 0,
    rataRataTransaksi: 0,
  };

  const produkSemua = await Produk.find({ isAktif: true });
  const stokMenipisCount = produkSemua.filter((p) => p.stok <= p.stokMinimum).length;

  const data = {
    omzetHariIni: ringkasanHariIni.totalOmzet,
    jumlahTransaksiHariIni: ringkasanHariIni.jumlahTransaksi,
    rataRataNilaiTransaksi: Math.round(ringkasanHariIni.rataRataTransaksi),
    jumlahProdukStokMenipis: stokMenipisCount,
  };

  cache.set(cacheKey, data);
  return data;
};

const getOmzetHarian = async (tanggalMulaiStr, tanggalAkhirStr) => {
  const cacheKey = `laporan:omzet:${tanggalMulaiStr || 'default'}:${tanggalAkhirStr || 'default'}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const { mulai, akhir } = getRentangTanggalUTC(tanggalMulaiStr, tanggalAkhirStr);

  const hasilAgg = await Transaksi.aggregate([
    {
      $match: {
        createdAt: { $gte: mulai, $lte: akhir },
        statusBayar: 'berhasil',
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$createdAt',
            timezone: '+07:00',
          },
        },
        totalOmzet: { $sum: '$total' },
        jumlahTransaksi: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const data = hasilAgg.map((item) => ({
    tanggal: item._id,
    totalOmzet: item.totalOmzet,
    jumlahTransaksi: item.jumlahTransaksi,
  }));

  cache.set(cacheKey, data);
  return data;
};

const getProdukTerlaris = async (limit = 10, tanggalMulaiStr, tanggalAkhirStr) => {
  const cacheKey = `laporan:terlaris:${limit}:${tanggalMulaiStr || 'default'}:${tanggalAkhirStr || 'default'}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const { mulai, akhir } = getRentangTanggalUTC(tanggalMulaiStr, tanggalAkhirStr);

  const hasilAgg = await Transaksi.aggregate([
    {
      $match: {
        createdAt: { $gte: mulai, $lte: akhir },
        statusBayar: 'berhasil',
      },
    },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.productId',
        namaProduk: { $first: '$items.nama' },
        totalKuantitasTerjual: { $sum: '$items.qty' },
        totalOmzet: { $sum: '$items.subtotal' },
      },
    },
    { $sort: { totalKuantitasTerjual: -1 } },
    { $limit: Number(limit) },
  ]);

  const data = hasilAgg.map((item) => ({
    productId: item._id,
    namaProduk: item.namaProduk,
    totalTerjual: item.totalKuantitasTerjual,
    totalOmzet: item.totalOmzet,
  }));

  cache.set(cacheKey, data);
  return data;
};

module.exports = {
  getRingkasanDashboard,
  getOmzetHarian,
  getProdukTerlaris,
};
