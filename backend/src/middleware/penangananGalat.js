const { gagal } = require('../utilitas/formatResponsApi');

const tidakDitemukan = (req, res) =>
  gagal(res, 404, `Rute ${req.method} ${req.originalUrl} tidak ditemukan`, 'TIDAK_DITEMUKAN');

const penangananGalat = (err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return gagal(res, 400, 'Format JSON tidak valid', 'VALIDASI_GAGAL');
  }

  if (err.name === 'CastError') {
    return gagal(res, 400, `Nilai ${err.path} tidak valid`, 'VALIDASI_GAGAL');
  }

  if (process.env.NODE_ENV !== 'test') {
    console.error(err);
  }

  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let pesan = err.message || 'Terjadi kesalahan internal pada server';
  let kodeGalat = 'GALAT_SERVER';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    pesan = 'Validasi gagal';
    kodeGalat = 'VALIDASI_GAGAL';
    const galatList = Object.values(err.errors).map((e) => ({
      field: e.path,
      pesan: e.message,
    }));
    return gagal(res, statusCode, pesan, kodeGalat, galatList);
  }

  if (err.code === 11000) {
    statusCode = 409;
    pesan = 'Data duplikat terdeteksi';
    kodeGalat = 'DATA_DUPLIKAT';
    return gagal(res, statusCode, pesan, kodeGalat);
  }

  if (process.env.NODE_ENV === 'production') {
    pesan = 'Terjadi kesalahan internal pada server';
  }

  return gagal(res, statusCode, pesan, kodeGalat);
};

module.exports = penangananGalat;
module.exports.tidakDitemukan = tidakDitemukan;
