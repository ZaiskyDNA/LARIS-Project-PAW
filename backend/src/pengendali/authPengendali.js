const User = require('../model/User');
const { comparePassword } = require('../utilitas/hashKataSandi');
const { generateToken } = require('../utilitas/buatToken');
const { sukses, gagal } = require('../utilitas/formatResponsApi');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      return gagal(res, 400, 'Email dan kata sandi wajib diisi', 'VALIDASI_GAGAL');
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');

    if (!user || !user.isAktif) {
      return gagal(res, 401, 'Email atau kata sandi salah', 'KREDENSIAL_SALAH');
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return gagal(res, 401, 'Email atau kata sandi salah', 'KREDENSIAL_SALAH');
    }

    const token = generateToken({ id: user._id, role: user.role });

    const dataUser = {
      _id: user._id,
      nama: user.nama,
      email: user.email,
      role: user.role,
      isAktif: user.isAktif,
      createdAt: user.createdAt,
    };

    return sukses(res, 200, 'Login berhasil', { token, user: dataUser });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const dataUser = {
      _id: req.user._id,
      nama: req.user.nama,
      email: req.user.email,
      role: req.user.role,
      isAktif: req.user.isAktif,
      createdAt: req.user.createdAt,
    };
    return sukses(res, 200, 'Berhasil mengambil data profil', dataUser);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    return sukses(res, 200, 'Logout berhasil');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getProfile,
  logout,
};
