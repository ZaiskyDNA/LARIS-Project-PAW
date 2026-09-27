const sukses = (res, statusCode = 200, pesan = 'Sukses', data = null, meta = null) => {
  const responseObj = {
    sukses: true,
    pesan,
  };
  if (data !== null) {
    responseObj.data = data;
  }
  if (meta !== null) {
    responseObj.meta = meta;
  }
  return res.status(statusCode).json(responseObj);
};

const gagal = (res, statusCode = 400, pesan = 'Gagal', kodeGalat = 'VALIDASI_GAGAL', galat = null) => {
  const responseObj = {
    sukses: false,
    pesan,
    kodeGalat,
  };
  if (galat !== null) {
    responseObj.galat = galat;
  }
  return res.status(statusCode).json(responseObj);
};

module.exports = {
  sukses,
  gagal,
};
