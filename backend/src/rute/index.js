const express = require('express');
const router = express.Router();

const authRute = require('./authRute');
const penggunaRute = require('./penggunaRute');
const produkRute = require('./produkRute');
const transaksiRute = require('./transaksiRute');
const laporanRute = require('./laporanRute');
const pengaturanRute = require('./pengaturanRute');

router.use('/auth', authRute);
router.use('/users', penggunaRute);
router.use('/produk', produkRute);
router.use('/transaksi', transaksiRute);
router.use('/laporan', laporanRute);
router.use('/pengaturan', pengaturanRute);

module.exports = router;
