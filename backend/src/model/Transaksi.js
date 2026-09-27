const mongoose = require('mongoose');

const itemTransaksiSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produk',
      required: true,
    },
    nama: {
      type: String,
      required: true,
    },
    hargaSaat: {
      type: Number,
      required: true,
    },
    qty: {
      type: Number,
      required: true,
      min: 1,
    },
    subtotal: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const transaksiSchema = new mongoose.Schema(
  {
    nomorTransaksi: {
      type: String,
      required: true,
      unique: true,
    },
    kasirId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    namaKasir: {
      type: String,
      required: true,
    },
    items: {
      type: [itemTransaksiSchema],
      required: true,
      validate: [
        function (val) {
          return val.length > 0;
        },
        'Keranjang masih kosong',
      ],
    },
    total: {
      type: Number,
      required: true,
    },
    metodeBayar: {
      type: String,
      enum: ['tunai', 'qris'],
      required: true,
    },
    statusBayar: {
      type: String,
      enum: ['berhasil', 'menunggu', 'gagal', 'dibatalkan'],
      default: 'berhasil',
    },
    nominalBayar: {
      type: Number,
    },
    kembalian: {
      type: Number,
      default: 0,
    },
    midtransOrderId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

transaksiSchema.index({ createdAt: -1 });
transaksiSchema.index({ kasirId: 1, createdAt: -1 });

module.exports = mongoose.model('Transaksi', transaksiSchema);
