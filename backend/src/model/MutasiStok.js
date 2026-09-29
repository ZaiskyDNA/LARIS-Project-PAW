const mongoose = require('mongoose');

const mutasiStokSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produk',
      required: true,
    },
    namaProduk: {
      type: String,
      required: true,
    },
    tipe: {
      type: String,
      enum: ['masuk', 'keluar', 'koreksi'],
      required: true,
    },
    jumlah: {
      type: Number,
      required: true,
    },
    stokSebelum: {
      type: Number,
      required: true,
    },
    stokSesudah: {
      type: Number,
      required: true,
    },
    alasan: {
      type: String,
      default: 'lain-lain',
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

mutasiStokSchema.index({ productId: 1, createdAt: -1 });

module.exports = mongoose.model('MutasiStok', mutasiStokSchema);
