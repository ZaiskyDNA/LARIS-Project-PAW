const express = require('express');
const router = express.Router();
const {
  buatTransaksi,
  daftarTransaksi,
  detailTransaksi,
  bayarQris,
  cekStatusQris,
  batalkanTransaksiQris,
  simulasiBayarQris,
  webhookMidtrans,
} = require('../pengendali/transaksiPengendali');
const autentikasi = require('../middleware/autentikasi');

router.post('/webhook-midtrans', webhookMidtrans);

router.use(autentikasi);

router.post('/', buatTransaksi);
router.get('/', daftarTransaksi);
router.get('/:id', detailTransaksi);
router.post('/:id/bayar-qris', bayarQris);
router.post('/:id/cek-status', cekStatusQris);
router.post('/:id/batalkan', batalkanTransaksiQris);
router.post('/:id/simulasi-bayar', simulasiBayarQris);

module.exports = router;
