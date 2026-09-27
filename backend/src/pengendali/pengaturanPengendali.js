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
