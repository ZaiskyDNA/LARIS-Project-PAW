const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const ruteUtama = require('./rute');
const penangananGalat = require('./middleware/penangananGalat');
const { tidakDitemukan } = penangananGalat;

const app = express();

// Di AWS (App Runner / ALB / CloudFront) permintaan datang lewat proxy; IP asli dibaca dari
// X-Forwarded-For agar rate limit login tidak menghitung semua pengguna sebagai satu IP
if (process.env.TRUST_PROXY) {
  const nilai = process.env.TRUST_PROXY;
  app.set('trust proxy', /^\d+$/.test(nilai) ? Number(nilai) : nilai === 'true');
}

// CORS_ORIGIN boleh berisi beberapa domain dipisah koma, mis. domain Amplify + localhost
const daftarOrigin = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

const corsOptions = {
  origin: daftarOrigin.length > 0 ? daftarOrigin : '*',
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get(['/', '/api/kesehatan'], (req, res) => {
  res.json({
    sukses: true,
    pesan: 'LARIS Backend API is running',
    versi: '2.0',
  });
});

app.use('/api', ruteUtama);

app.use(tidakDitemukan);
app.use(penangananGalat);

module.exports = app;
