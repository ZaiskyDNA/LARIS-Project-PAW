const express = require('express');
const router = express.Router();
const { bacaPengaturan, ubahPengaturan } = require('../pengendali/pengaturanPengendali');
const autentikasi = require('../middleware/autentikasi');
const otorisasi = require('../middleware/otorisasi');

router.use(autentikasi);

router.get('/', bacaPengaturan);
router.put('/', otorisasi('pemilik'), ubahPengaturan);

module.exports = router;
