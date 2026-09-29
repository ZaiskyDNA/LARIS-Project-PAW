const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { login, getProfile, logout } = require('../pengendali/authPengendali');
const autentikasi = require('../middleware/autentikasi');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.LOGIN_RATE_LIMIT, 10) || 20,
  message: {
    sukses: false,
    pesan: 'Terlalu banyak percobaan login, silakan coba lagi nanti',
    kodeGalat: 'TERLALU_BANYAK_PERMINTAAN',
  },
});

router.post('/login', loginLimiter, login);
router.get('/profil', autentikasi, getProfile);
router.get('/me', autentikasi, getProfile);
router.post('/logout', autentikasi, logout);

module.exports = router;
