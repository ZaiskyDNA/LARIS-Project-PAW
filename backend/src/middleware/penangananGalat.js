const { gagal } = require('../utilitas/formatResponsApi');

const penangananGalat = (err, req, res, next) => {
  console.error(err);

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

  return gagal(res, statusCode, pesan, kodeGalat);
};

module.exports = penangananGalat;
