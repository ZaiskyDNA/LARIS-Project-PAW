const mongoose = require('mongoose');

const pengaturanSchema = new mongoose.Schema(
  {
    namaToko: {
      type: String,
      default: 'Toko Kelontong Berkah',
    },
    alamat: {
      type: String,
      default: 'Jl. Contoh No. 123, Yogyakarta',
    },
    stokMinimumDefault: {
      type: Number,
      default: 5,
    },
    mataUang: {
      type: String,
      default: 'IDR',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Pengaturan', pengaturanSchema);
