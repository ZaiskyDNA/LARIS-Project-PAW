const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'laris_jwt_secret_key_default';
  const expiresIn = process.env.JWT_EXPIRES_IN || '8h';
  return jwt.sign(payload, secret, { expiresIn });
};

const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'laris_jwt_secret_key_default';
  return jwt.verify(token, secret);
};

module.exports = {
  generateToken,
  verifyToken,
};
