const Transaksi = require('../model/Transaksi');
const { tanggalHariIni } = require('./zonaWaktu');

const buatNomorTransaksi = async () => {
  const prefix = `TRX-${tanggalHariIni().replace(/-/g, '')}-`;
  const terakhir = await Transaksi.findOne({ nomorTransaksi: new RegExp(`^${prefix}`) })
    .sort({ nomorTransaksi: -1 })
    .select('nomorTransaksi');
  const urutan = terakhir ? parseInt(terakhir.nomorTransaksi.slice(prefix.length), 10) + 1 : 1;
  return `${prefix}${String(urutan).padStart(4, '0')}`;
};

module.exports = {
  buatNomorTransaksi,
};
