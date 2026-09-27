const { verifyToken } = require('../utilitas/buatToken');
const User = require('../model/User');
const { gagal } = require('../utilitas/formatResponsApi');

const autentikasi = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return gagal(res, 401, 'Token autentikasi tidak ditemukan', 'TIDAK_TERAUTENTIKASI');
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user || !user.isAktif) {
      return gagal(res, 401, 'Pengguna tidak ditemukan atau tidak aktif', 'TIDAK_TERAUTENTIKASI');
    }

    req.user = user;
    next();
  } catch (error) {
    return gagal(res, 401, 'Token tidak valid atau telah kedaluwarsa', 'TIDAK_TERAUTENTIKASI');
  }
};

module.exports = autentikasi;
