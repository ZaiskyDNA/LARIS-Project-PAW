const express = require('express');
const router = express.Router();
const {
  buatKasir,
  daftarPengguna,
  ubahPengguna,
  hapusPengguna,
} = require('../pengendali/penggunaPengendali');
const autentikasi = require('../middleware/autentikasi');
const otorisasi = require('../middleware/otorisasi');

router.use(autentikasi);
router.use(otorisasi('pemilik'));

router.post('/', buatKasir);
router.get('/', daftarPengguna);
router.patch('/:id', ubahPengguna);
router.put('/:id', ubahPengguna);
router.delete('/:id', hapusPengguna);

module.exports = router;
