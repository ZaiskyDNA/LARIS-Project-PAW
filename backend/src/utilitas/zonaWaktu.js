const getRentangTanggalUTC = (tanggalMulaiStr, tanggalAkhirStr) => {
  let mulai;
  let akhir;

  if (tanggalMulaiStr) {
    mulai = new Date(`${tanggalMulaiStr}T00:00:00+07:00`);
  } else {
    mulai = new Date();
    mulai.setHours(0, 0, 0, 0);
  }

  if (tanggalAkhirStr) {
    akhir = new Date(`${tanggalAkhirStr}T23:59:59.999+07:00`);
  } else {
    akhir = new Date();
    akhir.setHours(23, 59, 59, 999);
  }

  return { mulai, akhir };
};

module.exports = {
  getRentangTanggalUTC,
};
