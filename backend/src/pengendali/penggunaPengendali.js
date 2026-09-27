const User = require('../model/User');
const { hashPassword } = require('../utilitas/hashKataSandi');
const { sukses, gagal } = require('../utilitas/formatResponsApi');

const buatKasir = async (req, res, next) => {
  try {
    const { nama, email, password, role } = req.body;

    if (!nama || !email || !password) {
      return gagal(res, 400, 'Nama, email, dan kata sandi wajib diisi', 'VALIDASI_GAGAL');
    }

    if (password.length < 8) {
      return gagal(res, 400, 'Kata sandi minimal 8 karakter', 'VALIDASI_GAGAL');
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return gagal(res, 409, 'Email sudah terdaftar', 'DATA_DUPLIKAT');
    }

    const hashedPassword = await hashPassword(password);
    const userRole = role || 'kasir';

    const userBaru = await User.create({
      nama,
      email: email.toLowerCase(),
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

    const user = await User.findById(id);
    if (!user) {
      return gagal(res, 404, 'Pengguna tidak ditemukan', 'TIDAK_DITEMUKAN');
    }

    if (req.user._id.toString() === id && isAktif === false) {
      return gagal(res, 400, 'Anda tidak dapat menonaktifkan akun sendiri', 'VALIDASI_GAGAL');
    }

    if (nama !== undefined) user.nama = nama;
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

    const user = await User.findById(id);
    if (!user) {
      return gagal(res, 404, 'Pengguna tidak ditemukan', 'TIDAK_DITEMUKAN');
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
