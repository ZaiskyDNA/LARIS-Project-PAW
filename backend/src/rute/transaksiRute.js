const express = require('express');
const router = express.Router();
const {
  buatTransaksi,
  daftarTransaksi,
  detailTransaksi,
  bayarQris,
  webhookMidtrans,
} = require('../pengendali/transaksiPengendali');
const autentikasi = require('../middleware/autentikasi');

router.post('/webhook-midtrans', webhookMidtrans);

router.use(autentikasi);

router.post('/', buatTransaksi);
router.get('/', daftarTransaksi);
router.get('/:id', detailTransaksi);
router.post('/:id/bayar-qris', bayarQris);

module.exports = router;
