const Pengaturan = require('../model/Pengaturan');
const { sukses, gagal } = require('../utilitas/formatResponsApi');

const bacaPengaturan = async (req, res, next) => {
  try {
    let pengaturan = await Pengaturan.findOne();
    if (!pengaturan) {
      pengaturan = await Pengaturan.create({});
    }
    return sukses(res, 200, 'Berhasil mengambil pengaturan toko', pengaturan);
  } catch (error) {
    next(error);
  }
};

const ubahPengaturan = async (req, res, next) => {
  try {
    const { namaToko, alamat, stokMinimumDefault, mataUang } = req.body;

    const galat = [];
    if (namaToko !== undefined && (typeof namaToko !== 'string' || namaToko.trim().length < 2 || namaToko.length > 100)) {
      galat.push({ field: 'namaToko', pesan: 'Nama toko harus 2-100 karakter' });
    }
    if (alamat !== undefined && (typeof alamat !== 'string' || alamat.length > 200)) {
      galat.push({ field: 'alamat', pesan: 'Alamat maksimal 200 karakter' });
    }
    if (
      stokMinimumDefault !== undefined &&
      (!Number.isInteger(stokMinimumDefault) || stokMinimumDefault < 0 || stokMinimumDefault > 10000)
    ) {
      galat.push({ field: 'stokMinimumDefault', pesan: 'Stok minimum tidak valid' });
    }
    if (galat.length > 0) {
      return gagal(res, 400, 'Validasi gagal', 'VALIDASI_GAGAL', galat);
    }

    let pengaturan = await Pengaturan.findOne();
    if (!pengaturan) {
      pengaturan = new Pengaturan({});
    }

    if (namaToko !== undefined) pengaturan.namaToko = namaToko;
    if (alamat !== undefined) pengaturan.alamat = alamat;
    if (stokMinimumDefault !== undefined) pengaturan.stokMinimumDefault = stokMinimumDefault;
    if (mataUang !== undefined) pengaturan.mataUang = mataUang;

    await pengaturan.save();
    return sukses(res, 200, 'Berhasil memperbarui pengaturan toko', pengaturan);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bacaPengaturan,
  ubahPengaturan,
};
