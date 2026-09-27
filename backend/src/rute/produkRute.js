const express = require('express');
const router = express.Router();
const {
  daftarProduk,
  detailProduk,
  produkStokMenipis,
  produkBarcode,
  tambahProduk,
  ubahProduk,
  hapusProduk,
  stokOpname,
  riwayatMutasi,
} = require('../pengendali/produkPengendali');
const autentikasi = require('../middleware/autentikasi');
const otorisasi = require('../middleware/otorisasi');

router.use(autentikasi);

router.get('/', daftarProduk);
router.get('/stok-menipis', otorisasi('pemilik'), produkStokMenipis);
router.get('/low-stock', otorisasi('pemilik'), produkStokMenipis);
router.get('/barcode/:kode', produkBarcode);
router.get('/:id', detailProduk);

router.post('/', otorisasi('pemilik'), tambahProduk);
router.put('/:id', otorisasi('pemilik'), ubahProduk);
router.delete('/:id', otorisasi('pemilik'), hapusProduk);

router.post('/:id/opname', otorisasi('pemilik'), stokOpname);
router.get('/:id/mutasi', otorisasi('pemilik'), riwayatMutasi);

module.exports = router;
