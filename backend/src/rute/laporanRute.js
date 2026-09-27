const express = require('express');
const router = express.Router();
const {
  ringkasan,
  omzetHarian,
  produkTerlaris,
  eksporLaporan,
} = require('../pengendali/laporanPengendali');
const autentikasi = require('../middleware/autentikasi');
const otorisasi = require('../middleware/otorisasi');

router.use(autentikasi);
router.use(otorisasi('pemilik'));

router.get('/ringkasan', ringkasan);
router.get('/dashboard', ringkasan);
router.get('/omzet-harian', omzetHarian);
router.get('/produk-terlaris', produkTerlaris);
router.get('/ekspor', eksporLaporan);

module.exports = router;
