const User = require('../model/User');
const { hashPassword } = require('../utilitas/hashKataSandi');
const { sukses, gagal } = require('../utilitas/formatResponsApi');
const { adalahIdValid, validasiEmail, validasiKataSandi } = require('../utilitas/validasi');

const PESAN_KATA_SANDI = 'Kata sandi minimal 8 karakter dan mengandung huruf serta angka';

const pemilikAktifLain = (idDikecualikan) =>
  User.countDocuments({ role: 'pemilik', isAktif: true, _id: { $ne: idDikecualikan } });

const buatKasir = async (req, res, next) => {
  try {
    const { nama, email, password, role } = req.body;

    const galat = [];
    if (typeof nama !== 'string' || nama.trim().length < 3 || nama.trim().length > 60) {
      galat.push({ field: 'nama', pesan: 'Nama minimal 3 karakter' });
    }
    if (!validasiEmail(email)) {
      galat.push({ field: 'email', pesan: 'Format email tidak valid' });
    }
    if (!validasiKataSandi(password)) {
      galat.push({ field: 'password', pesan: PESAN_KATA_SANDI });
    }
    if (role !== undefined && !['pemilik', 'kasir'].includes(role)) {
      galat.push({ field: 'role', pesan: 'Peran tidak valid' });
    }
    if (galat.length > 0) {
      return gagal(res, 400, 'Validasi gagal', 'VALIDASI_GAGAL', galat);
    }

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return gagal(res, 409, 'Email sudah terdaftar', 'DATA_DUPLIKAT');
    }

    const hashedPassword = await hashPassword(password);
    const userRole = role || 'kasir';

    const userBaru = await User.create({
      nama: nama.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: userRole,
    });

    const dataUser = {
      _id: userBaru._id,
      nama: userBaru.nama,
      email: userBaru.email,
      role: userBaru.role,
      isAktif: userBaru.isAktif,
      createdAt: userBaru.createdAt,
    };

    return sukses(res, 201, 'Akun berhasil dibuat', dataUser);
  } catch (error) {
    next(error);
  }
};

const daftarPengguna = async (req, res, next) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role) {
      filter.role = role;
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    return sukses(res, 200, 'Berhasil mengambil daftar pengguna', users);
  } catch (error) {
    next(error);
  }
};

const ubahPengguna = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nama, isAktif } = req.body;

    if (!adalahIdValid(id)) {
      return gagal(res, 404, 'Pengguna tidak ditemukan', 'TIDAK_DITEMUKAN');
    }

    const user = await User.findById(id);
    if (!user) {
      return gagal(res, 404, 'Pengguna tidak ditemukan', 'TIDAK_DITEMUKAN');
    }

    if (nama !== undefined && (typeof nama !== 'string' || nama.trim().length < 3 || nama.trim().length > 60)) {
      return gagal(res, 400, 'Validasi gagal', 'VALIDASI_GAGAL', [
        { field: 'nama', pesan: 'Nama minimal 3 karakter' },
      ]);
    }

    if (isAktif !== undefined && typeof isAktif !== 'boolean') {
      return gagal(res, 400, 'Validasi gagal', 'VALIDASI_GAGAL', [
        { field: 'isAktif', pesan: 'isAktif harus bernilai true atau false' },
      ]);
    }

    if (req.user._id.toString() === id && isAktif === false) {
      return gagal(res, 400, 'Anda tidak dapat menonaktifkan akun sendiri', 'VALIDASI_GAGAL');
    }

    if (isAktif === false && user.role === 'pemilik' && (await pemilikAktifLain(id)) === 0) {
      return gagal(res, 400, 'Sistem harus memiliki minimal satu pemilik aktif', 'VALIDASI_GAGAL');
    }

    if (nama !== undefined) user.nama = nama.trim();
    if (isAktif !== undefined) user.isAktif = isAktif;

    await user.save();

    const dataUser = {
      _id: user._id,
      nama: user.nama,
      email: user.email,
      role: user.role,
      isAktif: user.isAktif,
    };

    return sukses(res, 200, 'Berhasil memperbarui pengguna', dataUser);
  } catch (error) {
    next(error);
  }
};

const hapusPengguna = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user._id.toString() === id) {
      return gagal(res, 400, 'Pemilik tidak dapat menghapus akunnya sendiri', 'VALIDASI_GAGAL');
    }

    if (!adalahIdValid(id)) {
      return gagal(res, 404, 'Pengguna tidak ditemukan', 'TIDAK_DITEMUKAN');
    }

    const user = await User.findById(id);
    if (!user) {
      return gagal(res, 404, 'Pengguna tidak ditemukan', 'TIDAK_DITEMUKAN');
    }

    if (user.role === 'pemilik' && (await pemilikAktifLain(id)) === 0) {
      return gagal(res, 400, 'Sistem harus memiliki minimal satu pemilik aktif', 'VALIDASI_GAGAL');
    }

    user.isAktif = false;
    await user.save();

    return sukses(res, 200, 'Akun pengguna berhasil dinonaktifkan');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  buatKasir,
  daftarPengguna,
  ubahPengguna,
  hapusPengguna,
};
