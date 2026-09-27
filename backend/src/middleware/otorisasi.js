const { gagal } = require('../utilitas/formatResponsApi');

const otorisasi = (...peranDiizinkan) => {
  return (req, res, next) => {
    if (!req.user || !peranDiizinkan.includes(req.user.role)) {
      return gagal(res, 403, 'Akses ditolak: Anda tidak memiliki wewenang', 'AKSES_DITOLAK');
    }
    next();
  };
};

module.exports = otorisasi;
