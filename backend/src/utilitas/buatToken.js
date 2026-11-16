const jwt = require('jsonwebtoken');

// JWT_SECRET wajib diisi; tidak ada nilai cadangan di dalam kode (NFR-04)
const ambilSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET belum diatur pada variabel lingkungan');
  return secret;
};

const generateToken = (payload) => {
  const secret = ambilSecret();
  const expiresIn = process.env.JWT_EXPIRES_IN || '8h';
  return jwt.sign(payload, secret, { expiresIn });
};

const verifyToken = (token) => {
  return jwt.verify(token, ambilSecret());
};

module.exports = {
  generateToken,
  verifyToken,
};
