/**
 * Seed data demo LARIS: akun, pengaturan, 35 produk, dan riwayat 30 hari
 * (transaksi, stok masuk, stok opname) yang konsisten dengan uji rekonsiliasi (PRD 15.4).
 * Jalankan: npm run seed. PERINGATAN: menghapus seluruh data di basis data tujuan.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../model/User');
const Produk = require('../model/Produk');
const Transaksi = require('../model/Transaksi');
const MutasiStok = require('../model/MutasiStok');
const Pengaturan = require('../model/Pengaturan');
const { hashPassword } = require('../utilitas/hashKataSandi');
const { tanggalHariIni } = require('../utilitas/zonaWaktu');
const KATALOG = require('./dataProduk');

const JUMLAH_HARI = 30;
const HARI_KENAIKAN_HARGA = JUMLAH_HARI - 12;
const HARI_PRODUK_DIHAPUS = 15;
const HARI_SARI_NONAKTIF = 12;
const HARI_TANPA_RESTOCK = JUMLAH_HARI - 4; // produk "akhir" tidak direstock 4 hari terakhir
const SANDI_DEMO = 'password123';
const MENIT = 60 * 1000;

// Generator acak berbenih agar data demo selalu sama setiap kali seed dijalankan
let benih = 20261116;
const acak = () => {
  benih = (benih + 0x6d2b79f5) | 0;
  let t = Math.imul(benih ^ (benih >>> 15), 1 | benih);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const antara = (min, maks) => min + Math.floor(acak() * (maks - min + 1));
const pilih = (daftar) => daftar[Math.floor(acak() * daftar.length)];
const pilihBerbobot = (daftar, bobot) => {
  let sisa = acak() * daftar.reduce((jumlah, item) => jumlah + bobot(item), 0);
  return daftar.find((item) => (sisa -= bobot(item)) < 0) || daftar[daftar.length - 1];
};

// Tengah malam Asia/Jakarta untuk hari ke-i (0 = paling lama, JUMLAH_HARI - 1 = hari ini)
const hariIni = tanggalHariIni();
const awalHari = (i) => new Date(new Date(`${hariIni}T00:00:00+07:00`).getTime() - (JUMLAH_HARI - 1 - i) * 24 * 60 * MENIT);
const pada = (i, jam, menit = 0) => new Date(awalHari(i).getTime() + (jam * 60 + menit) * MENIT);
const kodeTanggal = (i) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(awalHari(i)).replace(/-/g, '');

const bulatkanBayar = (total) => {
  const pecahan = pilih([0, 0, 5000, 10000, 20000, 50000, 100000]);
  if (pecahan === 0) return total;
  const bayar = Math.ceil(total / pecahan) * pecahan;
  return bayar === total ? bayar + pecahan : bayar;
};

const buatData = (akun) => {
  const sekarang = Date.now();
  const produk = KATALOG.map((p, i) => ({
    ...p,
    _id: new mongoose.Types.ObjectId(),
    barcode: `89988662${String(10010 + i * 7).padStart(5, '0')}`,
    stok: 0,
    aktif: true,
  }));
  const transaksi = [];
  const mutasi = [];

  const catatMutasi = (p, tipe, jumlah, alasan, waktu, userId, tambahan = {}) => {
    const stokSebelum = p.stok;
    p.stok = tipe === 'masuk' ? p.stok + jumlah : p.stok - jumlah;
    mutasi.push({
      _id: new mongoose.Types.ObjectId(),
      productId: p._id,
      namaProduk: p.nama,
      tipe,
      jumlah,
      stokSebelum,
      stokSesudah: p.stok,
      alasan,
      userId,
      createdAt: waktu,
      updatedAt: waktu,
      __v: 0,
      ...tambahan,
    });
  };

  // Stok awal masuk sebagai mutasi pertama agar rantai mutasi utuh sejak hari pertama
  produk.forEach((p) => catatMutasi(p, 'masuk', p.stokAwal, 'stok masuk', pada(0, 6, 30), akun.pemilik._id));

  for (let hari = 0; hari < JUMLAH_HARI; hari++) {
    const hariTerakhir = hari === JUMLAH_HARI - 1;
    const batasWaktu = hariTerakhir ? sekarang : Infinity;
    // awalHari = 17:00 UTC hari sebelumnya, jadi hari kalender Jakarta = hari UTC + 1
    const hariDalamPekan = (awalHari(hari).getUTCDay() + 1) % 7;
    const akhirPekan = hariDalamPekan === 0 || hariDalamPekan === 6;
    const harga = (p) => (p.hargaLama && hari < HARI_KENAIKAN_HARGA ? p.hargaLama : p.harga);

    if (hari === HARI_PRODUK_DIHAPUS) produk.filter((p) => p.dihapus).forEach((p) => (p.aktif = false));

    // 06:45 (sebelum toko buka) — pemilik merestock produk yang mendekati batas minimum
    if (hari > 0 && pada(hari, 6, 55) < batasWaktu) {
      produk
        .filter((p) => p.aktif && p.stok <= p.stokMinimum * 1.5 && !(p.akhir && hari >= HARI_TANPA_RESTOCK))
        .forEach((p) => catatMutasi(p, 'masuk', p.stokAwal - p.stok, 'stok masuk', pada(hari, 6, 45 + antara(0, 10)), akun.pemilik._id));
    }

    // 07:00–21:00 — transaksi pelanggan
    const jumlahTransaksi = akhirPekan ? antara(30, 42) : antara(22, 34);
    const waktuTransaksi = Array.from({ length: jumlahTransaksi }, () => pada(hari, 7, antara(0, 14 * 60 - 1)))
      .filter((waktu) => waktu < batasWaktu)
      .sort((a, b) => a - b);

    waktuTransaksi.forEach((waktu, urutan) => {
      const jam = (waktu - awalHari(hari)) / (60 * MENIT);
      const sariBertugas = hari < HARI_SARI_NONAKTIF && hari % 3 === 0;
      let kasir = jam < 14 ? (sariBertugas ? akun.sari : akun.rani) : akun.dimas;
      if (acak() < 0.06) kasir = akun.pemilik;

      const items = [];
      const jumlahBaris = pilihBerbobot([1, 2, 3, 4, 5], (n) => [5, 4, 3, 2, 1][n - 1]);
      for (let b = 0; b < jumlahBaris; b++) {
        const tersedia = produk.filter((p) => p.aktif && p.stok > 0 && !items.some((it) => it.p === p));
        if (tersedia.length === 0) break;
        const p = pilihBerbobot(tersedia, (x) => x.laku);
        items.push({ p, qty: Math.min(antara(1, p.qtyMaks), p.stok) });
      }
      if (items.length === 0) return;

      const baris = items.map(({ p, qty }) => ({ productId: p._id, nama: p.nama, hargaSaat: harga(p), qty, subtotal: harga(p) * qty }));
      const total = baris.reduce((jumlah, item) => jumlah + item.subtotal, 0);
      const qris = acak() < 0.3;
      const nasibQris = qris ? pilihBerbobot(['berhasil', 'kedaluwarsa', 'dibatalkan', 'gagal'], (s) => ({ berhasil: 90, kedaluwarsa: 4, dibatalkan: 5, gagal: 1 })[s]) : 'berhasil';
      const nomorTransaksi = `TRX-${kodeTanggal(hari)}-${String(urutan + 1).padStart(4, '0')}`;
      const _id = new mongoose.Types.ObjectId();
      const nominalBayar = qris ? total : bulatkanBayar(total);

      transaksi.push({
        _id,
        nomorTransaksi,
        kasirId: kasir._id,
        namaKasir: kasir.nama,
        items: baris,
        total,
        metodeBayar: qris ? 'qris' : 'tunai',
        statusBayar: nasibQris,
        nominalBayar,
        kembalian: nominalBayar - total,
        ...(qris && { midtransOrderId: `${nomorTransaksi}-${waktu.getTime()}` }),
        createdAt: waktu,
        updatedAt: new Date(waktu.getTime() + (qris ? antara(1, 5) * MENIT : 0)),
        __v: 0,
      });

      // Stok hanya berkurang untuk pembayaran yang berhasil (BR-12)
      if (nasibQris === 'berhasil') items.forEach(({ p, qty }) => catatMutasi(p, 'keluar', qty, 'penjualan', waktu, kasir._id, { refId: _id }));
    });

    // 21:30 — stok opname sesekali: barang rusak/hilang/kedaluwarsa atau salah hitung
    if (!hariTerakhir && hari % 4 === 2) {
      const p = pilih(produk.filter((x) => x.aktif && x.stok > 3 && !x.akhir));
      const [alasan, catatan, selisih] = pilih([
        ['rusak', 'Kemasan sobek saat bongkar muat', -antara(1, 2)],
        ['hilang', 'Selisih hitung rak depan', -1],
        ['kedaluwarsa', 'Lewat tanggal kedaluwarsa', -antara(1, 3)],
        ['salah input', 'Koreksi hitungan stok masuk', antara(1, 2)],
      ]);
      catatMutasi(p, selisih > 0 ? 'masuk' : 'koreksi', Math.abs(selisih), alasan, pada(hari, 21, 30), akun.pemilik._id, { catatan });
    }

    // Malam sebelum hari ini — kondisi akhir demo: beberapa produk menipis & habis
    if (hari === JUMLAH_HARI - 2) {
      produk.filter((p) => p.akhir && p.aktif).forEach((p) => {
        const target = p.akhir === 'habis' ? 0 : p.stokMinimum;
        if (target === p.stok) return;
        if (target > p.stok) {
          catatMutasi(p, 'masuk', target - p.stok, 'stok masuk', pada(hari, 21, 45), akun.pemilik._id, { catatan: 'Restock sebagian, stok pemasok terbatas' });
          return;
        }
        const [alasan, catatan] = p.akhir === 'habis' ? ['kedaluwarsa', 'Ditarik dari rak, lewat tanggal'] : ['hilang', 'Hasil hitung fisik akhir pekan'];
        catatMutasi(p, 'koreksi', p.stok - target, alasan, pada(hari, 21, 45), akun.pemilik._id, { catatan });
      });
    }
  }

  return { produk, transaksi, mutasi };
};

const seedData = async () => {
  if (process.env.NODE_ENV === 'production' && process.env.SEED_IZINKAN !== 'ya') {
    console.error('Seed dibatalkan: NODE_ENV=production. Isi SEED_IZINKAN=ya bila memang ingin menghapus & mengisi ulang data.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/laris');
    console.log('Terhubung ke MongoDB untuk seeding...');
    await Promise.all([User, Produk, Transaksi, MutasiStok, Pengaturan].map((model) => model.init()));
    await Promise.all([User, Produk, Transaksi, MutasiStok, Pengaturan].map((model) => model.deleteMany({})));

    const sandi = await hashPassword(SANDI_DEMO);
    const awal = pada(0, 6, 0);
    const buatAkun = (nama, email, role, isAktif = true) => ({
      _id: new mongoose.Types.ObjectId(), nama, email, password: sandi, role, isAktif, createdAt: awal, updatedAt: awal, __v: 0,
    });
    const akun = {
      pemilik: buatAkun('Pak Hasan', 'owner@laris.com', 'pemilik'),
      rani: buatAkun('Rani Putri', 'kasir@laris.com', 'kasir'),
      dimas: buatAkun('Dimas Pratama', 'dimas@laris.com', 'kasir'),
      sari: buatAkun('Sari Wulan', 'sari@laris.com', 'kasir', false),
    };
    await User.collection.insertMany(Object.values(akun));

    await Pengaturan.create({
      namaToko: 'Toko Kelontong Berkah',
      alamat: 'Jl. Kaliurang Km 5, Sleman, Yogyakarta',
      telepon: '0812-3456-7890',
      stokMinimumDefault: 5,
      mataUang: 'IDR',
    });

    const { produk, transaksi, mutasi } = buatData(akun);
    await Produk.collection.insertMany(
      produk.map((p) => ({
        _id: p._id, nama: p.nama, kategori: p.kategori, harga: p.harga, stok: p.stok, stokMinimum: p.stokMinimum,
        satuan: p.satuan, barcode: p.barcode, isAktif: p.aktif, createdAt: awal, updatedAt: new Date(), __v: 0,
      }))
    );
    if (transaksi.length > 0) await Transaksi.collection.insertMany(transaksi);
    await MutasiStok.collection.insertMany(mutasi);

    const berhasil = transaksi.filter((t) => t.statusBayar === 'berhasil');
    const status = (p) => (p.stok === 0 ? 'habis' : p.stok <= p.stokMinimum ? 'menipis' : 'aman');
    const aktif = produk.filter((p) => p.aktif);
    console.log('Seeding selesai!');
    console.log(`Akun: owner@laris.com (pemilik), kasir@laris.com & dimas@laris.com (kasir), sari@laris.com (nonaktif) — sandi ${SANDI_DEMO}`);
    console.log(`${aktif.length} produk aktif + ${produk.length - aktif.length} nonaktif · menipis ${aktif.filter((p) => status(p) === 'menipis').length} · habis ${aktif.filter((p) => status(p) === 'habis').length}`);
    console.log(`${transaksi.length} transaksi dalam ${JUMLAH_HARI} hari (${berhasil.length} berhasil, omzet Rp${berhasil.reduce((a, t) => a + t.total, 0).toLocaleString('id-ID')})`);
    console.log(`${mutasi.length} mutasi stok`);
    process.exit(0);
  } catch (error) {
    console.error('Error saat seeding data:', error);
    process.exit(1);
  }
};

seedData();
