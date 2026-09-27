require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../model/User');
const Produk = require('../model/Produk');
const Transaksi = require('../model/Transaksi');
const MutasiStok = require('../model/MutasiStok');
const Pengaturan = require('../model/Pengaturan');
const { hashPassword } = require('../utilitas/hashKataSandi');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/laris';
    await mongoose.connect(mongoUri);
    console.log('Terhubung ke MongoDB untuk seeding...');

    await User.deleteMany({});
    await Produk.deleteMany({});
    await Transaksi.deleteMany({});
    await MutasiStok.deleteMany({});
    await Pengaturan.deleteMany({});

    const ownerPassword = await hashPassword('password123');
    const kasirPassword = await hashPassword('password123');

    const owner = await User.create({
      nama: 'Pak Hasan (Pemilik)',
      email: 'owner@laris.com',
      password: ownerPassword,
      role: 'pemilik',
    });

    const kasir = await User.create({
      nama: 'Rani (Kasir)',
      email: 'kasir@laris.com',
      password: kasirPassword,
      role: 'kasir',
    });

    await Pengaturan.create({
      namaToko: 'Toko Kelontong Berkah',
      alamat: 'Jl. Malioboro No. 45, Yogyakarta',
      stokMinimumDefault: 5,
      mataUang: 'IDR',
    });

    const sampleProducts = [
      { nama: 'Indomie Goreng Original', kategori: 'Makanan', harga: 3100, stok: 50, stokMinimum: 10, satuan: 'pcs', barcode: '8998866200011' },
      { nama: 'Indomie Kuah Ayam Bawang', kategori: 'Makanan', harga: 3000, stok: 40, stokMinimum: 10, satuan: 'pcs', barcode: '8998866200028' },
      { nama: 'Indomie Kuah Soto Medan', kategori: 'Makanan', harga: 3000, stok: 3, stokMinimum: 5, satuan: 'pcs', barcode: '8998866200035' },
      { nama: 'Beras Premium 5kg', kategori: 'Sembako', harga: 72000, stok: 15, stokMinimum: 3, satuan: 'karung', barcode: '8998866200042' },
      { nama: 'Miyako Minyak Goreng 2L', kategori: 'Sembako', harga: 35000, stok: 20, stokMinimum: 5, satuan: 'pouch', barcode: '8998866200059' },
      { nama: 'Gula Pasir Gulaku 1kg', kategori: 'Sembako', harga: 17500, stok: 25, stokMinimum: 5, satuan: 'kg', barcode: '8998866200066' },
      { nama: 'Telur Ayam Negeri 1kg', kategori: 'Sembako', harga: 28000, stok: 10, stokMinimum: 5, satuan: 'kg', barcode: '8998866200073' },
      { nama: 'Teh Pucuk Harum 350ml', kategori: 'Minuman', harga: 3500, stok: 48, stokMinimum: 12, satuan: 'botol', barcode: '8998866200080' },
      { nama: 'Aqua Air Mineral 600ml', kategori: 'Minuman', harga: 3000, stok: 60, stokMinimum: 12, satuan: 'botol', barcode: '8998866200097' },
      { nama: 'Coca Cola 390ml', kategori: 'Minuman', harga: 5500, stok: 2, stokMinimum: 5, satuan: 'botol', barcode: '8998866200103' },
      { nama: 'Sabun Cuci Piring Mama Lemon 780ml', kategori: 'Rumah Tangga', harga: 14000, stok: 18, stokMinimum: 4, satuan: 'pouch', barcode: '8998866200110' },
      { nama: 'Deterjen Rinso Anti Noda 770g', kategori: 'Rumah Tangga', harga: 23500, stok: 12, stokMinimum: 3, satuan: 'pcs', barcode: '8998866200127' },
      { nama: 'Pepsodent Pasta Gigi 190g', kategori: 'Kebutuhan Diri', harga: 12500, stok: 0, stokMinimum: 5, satuan: 'pcs', barcode: '8998866200134' },
      { nama: 'Shampoo Lifebuoy 170ml', kategori: 'Kebutuhan Diri', harga: 19500, stok: 14, stokMinimum: 4, satuan: 'botol', barcode: '8998866200141' },
      { nama: 'Kopi Kapal Api Special Mix 10s', kategori: 'Minuman', harga: 14500, stok: 30, stokMinimum: 5, satuan: 'renceng', barcode: '8998866200158' },
    ];

    const insertedProducts = await Produk.insertMany(sampleProducts);

    console.log('Seeding selesai!');
    console.log(`Akun Pemilik: owner@laris.com / password123`);
    console.log(`Akun Kasir: kasir@laris.com / password123`);
    console.log(`${insertedProducts.length} produk berhasil di-seed`);

    process.exit(0);
  } catch (error) {
    console.error('Error saat seeding data:', error);
    process.exit(1);
  }
};

seedData();
