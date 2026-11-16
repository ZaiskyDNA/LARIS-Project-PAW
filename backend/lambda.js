/**
 * Titik masuk AWS Lambda (Function URL). Aplikasi Express yang sama dengan server.js
 * dibungkus serverless-http; koneksi MongoDB dipakai ulang antar-permintaan selama
 * kontainer Lambda masih hangat.
 */
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const validasiEnv = require('./src/konfigurasi/validasiEnv');

validasiEnv();
const app = require('./src/app');

// Function URL menambahkan IP pelanggan di X-Forwarded-For; percayai satu lapis proxy
// agar rate limit login menghitung per pengguna, bukan per server AWS
if (!process.env.TRUST_PROXY) app.set('trust proxy', 1);

// Berkas ekspor harus dikirim sebagai base64 agar tidak rusak oleh Lambda
const TIPE_BINER = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/octet-stream',
];

/**
 * serverless-http menandai request sudah selesai dibaca, sehingga express.json() (body-parser 2)
 * melewatkannya dan req.body kosong. Body diurai di sini sebelum masuk ke Express.
 */
const uraikanBody = (req) => {
  if (!Buffer.isBuffer(req.body)) return;
  const teks = req.body.toString('utf8');
  const tipe = req.headers['content-type'] || '';
  if (!teks) {
    req.body = {};
  } else if (/application\/json/i.test(tipe)) {
    try {
      req.body = JSON.parse(teks);
    } catch {
      req.body = {};
    }
  } else if (/application\/x-www-form-urlencoded/i.test(tipe)) {
    req.body = Object.fromEntries(new URLSearchParams(teks));
  } else {
    req.body = teks;
  }
};

const jalankanApp = serverless(app, { binary: TIPE_BINER, request: uraikanBody });

let koneksi = null;
const pastikanTerhubung = () => {
  if (!koneksi) {
    koneksi = mongoose
      .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000, maxPoolSize: 5 })
      .catch((error) => {
        koneksi = null;
        throw error;
      });
  }
  return koneksi;
};

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    await pastikanTerhubung();
  } catch (error) {
    console.error('Gagal terhubung ke MongoDB:', error.message);
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sukses: false, pesan: 'Basis data tidak dapat dihubungi', kodeGalat: 'GALAT_SERVER' }),
    };
  }
  return jalankanApp(event, context);
};
