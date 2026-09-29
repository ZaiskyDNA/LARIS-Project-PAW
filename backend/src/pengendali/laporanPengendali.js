const {
  getRingkasanDashboard,
  getOmzetHarian,
  getProdukTerlaris,
} = require('../layanan/layananLaporan');
const { eksporExcel, eksporPdf } = require('../layanan/layananEkspor');
const { sukses, gagal } = require('../utilitas/formatResponsApi');

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
    const data = await getOmzetHarian(tanggalMulai, tanggalAkhir);
    return sukses(res, 200, 'Berhasil mengambil omzet harian', data);
  } catch (error) {
    next(error);
  }
};

const produkTerlaris = async (req, res, next) => {
  try {
    const { limit = 10, tanggalMulai, tanggalAkhir } = req.query;
    const data = await getProdukTerlaris(limit, tanggalMulai, tanggalAkhir);
    return sukses(res, 200, 'Berhasil mengambil daftar produk terlaris', data);
  } catch (error) {
    next(error);
  }
};

const eksporLaporan = async (req, res, next) => {
  try {
    const { format = 'xlsx', tanggalMulai, tanggalAkhir } = req.query;

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
