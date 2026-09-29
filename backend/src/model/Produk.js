const mongoose = require('mongoose');

const produkSchema = new mongoose.Schema(
  {
    nama: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    kategori: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
    },
    harga: {
      type: Number,
      required: true,
      min: 0,
    },
    stok: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    stokMinimum: {
      type: Number,
      default: 5,
      min: 0,
    },
    satuan: {
      type: String,
      default: 'pcs',
      trim: true,
    },
    barcode: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
    },
    isAktif: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

produkSchema.virtual('statusStok').get(function () {
  if (this.stok === 0) return 'habis';
  if (this.stok <= this.stokMinimum) return 'menipis';
  return 'aman';
});

produkSchema.index({ nama: 'text' });
produkSchema.index({ kategori: 1, isAktif: 1 });

module.exports = mongoose.model('Produk', produkSchema);
