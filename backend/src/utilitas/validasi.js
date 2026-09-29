const mongoose = require('mongoose');

const ALASAN_OPNAME = ['rusak', 'hilang', 'kedaluwarsa', 'salah input', 'stok masuk', 'lain-lain'];

const adalahIdValid = (id) => mongoose.Types.ObjectId.isValid(id) && String(id).length === 24;

const adalahBilanganBulat = (nilai) => typeof nilai === 'number' && Number.isInteger(nilai);

const validasiEmail = (email) =>
  typeof email === 'string' &&
  email.length <= 100 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validasiKataSandi = (password) =>
  typeof password === 'string' &&
  password.length >= 8 &&
  /[A-Za-z]/.test(password) &&
  /\d/.test(password);

const escapeRegex = (teks) => String(teks).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parsePaginasi = (halaman, perHalaman, maksPerHalaman = 100) => {
  const page = Math.max(parseInt(halaman, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(perHalaman, 10) || 20, 1), maksPerHalaman);
  return { page, limit, skip: (page - 1) * limit };
};

module.exports = {
  ALASAN_OPNAME,
  adalahIdValid,
  adalahBilanganBulat,
  validasiEmail,
  validasiKataSandi,
  escapeRegex,
  parsePaginasi,
};
