const {
  getRingkasanDashboard,
  getOmzetHarian,
  getProdukTerlaris,
} = require('../layanan/layananLaporan');
const { eksporExcel, eksporPdf } = require('../layanan/layananEkspor');
const { sukses, gagal } = require('../utilitas/formatResponsApi');
const { validasiRentangTanggal } = require('../utilitas/zonaWaktu');

const tolakBilaRentangSalah = (res, tanggalMulai, tanggalAkhir) => {
  const galat = validasiRentangTanggal(tanggalMulai, tanggalAkhir);
  if (galat) {
    gagal(res, 400, galat, 'VALIDASI_GAGAL');
    return true;
  }
  return false;
};

const ringkasan = async (req, res, next) => {
  try {
    const data = await getRingkasanDashboard();
    return sukses(res, 200, 'Berhasil mengambil ringkasan dashboard', data);
  } catch (error) {
    next(error);
  }
};

const omzetHarian = async (req, res, next) => {
  try {
    const { tanggalMulai, tanggalAkhir } = req.query;
    if (tolakBilaRentangSalah(res, tanggalMulai, tanggalAkhir)) return;
    const data = await getOmzetHarian(tanggalMulai, tanggalAkhir);
    return sukses(res, 200, 'Berhasil mengambil omzet harian', data);
  } catch (error) {
    next(error);
  }
};

const produkTerlaris = async (req, res, next) => {
  try {
    const { tanggalMulai, tanggalAkhir } = req.query;
    if (tolakBilaRentangSalah(res, tanggalMulai, tanggalAkhir)) return;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const data = await getProdukTerlaris(limit, tanggalMulai, tanggalAkhir);
    return sukses(res, 200, 'Berhasil mengambil daftar produk terlaris', data);
  } catch (error) {
    next(error);
  }
};

const eksporLaporan = async (req, res, next) => {
  try {
    const { format = 'xlsx', tanggalMulai, tanggalAkhir } = req.query;

    if (!['xlsx', 'pdf'].includes(format)) {
      return gagal(res, 400, 'Format ekspor harus xlsx atau pdf', 'VALIDASI_GAGAL');
    }
    if (tolakBilaRentangSalah(res, tanggalMulai, tanggalAkhir)) return;

    if (format === 'pdf') {
      await eksporPdf(tanggalMulai, tanggalAkhir, res);
    } else {
      await eksporExcel(tanggalMulai, tanggalAkhir, res);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  ringkasan,
  omzetHarian,
  produkTerlaris,
  eksporLaporan,
};
