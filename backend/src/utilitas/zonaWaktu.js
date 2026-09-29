const ZONA_WAKTU = 'Asia/Jakarta';
const OFFSET = '+07:00';
const MAKS_RENTANG_HARI = 365;
const FORMAT_TANGGAL = /^\d{4}-\d{2}-\d{2}$/;

const tanggalHariIni = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_WAKTU,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

const tanggalValid = (str) => {
  if (!FORMAT_TANGGAL.test(str)) return false;
  const d = new Date(`${str}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === str;
};

const getRentangTanggalUTC = (tanggalMulaiStr, tanggalAkhirStr) => {
  const hariIni = tanggalHariIni();
  const mulai = new Date(`${tanggalMulaiStr || hariIni}T00:00:00${OFFSET}`);
  const akhir = new Date(`${tanggalAkhirStr || hariIni}T23:59:59.999${OFFSET}`);
  return { mulai, akhir };
};

const validasiRentangTanggal = (tanggalMulai, tanggalAkhir) => {
  if (tanggalMulai && !tanggalValid(tanggalMulai)) return 'Rentang tanggal tidak valid';
  if (tanggalAkhir && !tanggalValid(tanggalAkhir)) return 'Rentang tanggal tidak valid';
  if (tanggalMulai || tanggalAkhir) {
    const { mulai, akhir } = getRentangTanggalUTC(tanggalMulai, tanggalAkhir);
    if (mulai > akhir) return 'Rentang tanggal tidak valid';
    const hari = (akhir - mulai) / (24 * 60 * 60 * 1000);
    if (hari > MAKS_RENTANG_HARI) return 'Rentang tanggal tidak valid';
  }
  return null;
};

module.exports = {
  tanggalHariIni,
  getRentangTanggalUTC,
  validasiRentangTanggal,
};
