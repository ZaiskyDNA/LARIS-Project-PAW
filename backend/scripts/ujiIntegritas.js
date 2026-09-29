require('dotenv').config();
const mongoose = require('mongoose');
const Produk = require('../src/model/Produk');
const Transaksi = require('../src/model/Transaksi');
const MutasiStok = require('../src/model/MutasiStok');

const BASE = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}/api`;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/laris';

const panggil = async (method, path, token, body) => {
  const t0 = process.hrtime.bigint();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  return { status: res.status, json: await res.json().catch(() => null), ms };
};

const login = async (email) => {
  const r = await panggil('POST', '/auth/login', null, { email, password: 'password123' });
  return r.json.data.token;
};

const hasil = [];
const cek = (nama, lulus, detail) => {
  hasil.push(lulus);
  console.log(`${lulus ? 'LULUS' : 'GAGAL'}  ${nama}${detail ? `  -> ${detail}` : ''}`);
};

const rata2 = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

(async () => {
  await mongoose.connect(MONGO_URI);
  const tokenPemilik = await login('owner@laris.com');
  const tokenKasir = await login('kasir@laris.com');

  // ---------- 1. Konkurensi ----------
  console.log('\n== 1. Uji konkurensi: 12 kasir membeli 1 unit dari stok 5 secara bersamaan ==');
  const buat = await panggil('POST', '/produk', tokenPemilik, {
    nama: `Uji Konkurensi ${Date.now()}`,
    kategori: 'Uji',
    harga: 1000,
    stok: 5,
  });
  const produkId = buat.json.data._id;
  const serbu = await Promise.all(
    Array.from({ length: 12 }, () =>
      panggil('POST', '/transaksi', tokenKasir, {
        items: [{ productId: produkId, qty: 1 }],
        metodeBayar: 'tunai',
        nominalBayar: 1000,
      })
    )
  );
  const berhasil = serbu.filter((r) => r.status === 201).length;
  const ditolak = serbu.filter((r) => r.status === 400 && r.json.kodeGalat === 'STOK_TIDAK_CUKUP').length;
  const produkAkhir = await Produk.findById(produkId);
  const trxTersimpan = await Transaksi.countDocuments({ 'items.productId': produkId });
  const nomor = await Transaksi.find({ 'items.productId': produkId }).distinct('nomorTransaksi');
  cek('Tepat 5 transaksi berhasil', berhasil === 5, `berhasil=${berhasil}`);
  cek('7 sisanya ditolak STOK_TIDAK_CUKUP', ditolak === 7, `ditolak=${ditolak}`);
  cek('Stok akhir 0 (tidak pernah negatif, BR-01)', produkAkhir.stok === 0, `stok=${produkAkhir.stok}`);
  cek('Jumlah transaksi tersimpan = 5 (tidak ada transaksi yatim)', trxTersimpan === 5, `tersimpan=${trxTersimpan}`);
  cek('Nomor transaksi unik semua', new Set(nomor).size === nomor.length, `${nomor.length} nomor`);

  // ---------- 2. Rekonsiliasi ----------
  console.log('\n== 2. Rekonsiliasi stok (PRD 15.4) ==');
  const produkSemua = await Produk.find({});
  let rantaiRusak = 0;
  let stokBeda = 0;
  let penjualanBeda = 0;
  let punyaMutasi = 0;

  const terjualPerProduk = await Transaksi.aggregate([
    { $match: { statusBayar: 'berhasil' } },
    { $unwind: '$items' },
    { $group: { _id: '$items.productId', qty: { $sum: '$items.qty' } } },
  ]);
  const terjual = new Map(terjualPerProduk.map((t) => [String(t._id), t.qty]));

  for (const p of produkSemua) {
    const mutasi = await MutasiStok.find({ productId: p._id }).sort({ createdAt: 1, _id: 1 });
    if (mutasi.length === 0) continue;
    punyaMutasi++;

    for (let i = 1; i < mutasi.length; i++) {
      if (mutasi[i].stokSebelum !== mutasi[i - 1].stokSesudah) rantaiRusak++;
    }
    if (mutasi[mutasi.length - 1].stokSesudah !== p.stok) stokBeda++;

    const keluarPenjualan = mutasi
      .filter((m) => m.tipe === 'keluar' && m.alasan === 'penjualan')
      .reduce((a, m) => a + m.jumlah, 0);
    if (keluarPenjualan !== (terjual.get(String(p._id)) || 0)) penjualanBeda++;
  }
  console.log(`Produk dengan riwayat mutasi diperiksa: ${punyaMutasi} dari ${produkSemua.length}`);
  cek('Rantai mutasi berkesinambungan (stokSebelum = stokSesudah sebelumnya)', rantaiRusak === 0, `rusak=${rantaiRusak}`);
  cek('Stok produk = stokSesudah mutasi terakhir', stokBeda === 0, `selisih=${stokBeda}`);
  cek('Σ mutasi penjualan = Σ qty transaksi berhasil', penjualanBeda === 0, `selisih=${penjualanBeda}`);
  cek('Tidak ada stok negatif', produkSemua.every((p) => p.stok >= 0));

  // ---------- 3. Cache ----------
  console.log('\n== 3. Waktu respons cache laporan (produk-terlaris), 15 putaran ==');
  const dingin = [];
  const hangat = [];
  for (let i = 0; i < 15; i++) {
    // Opname mengosongkan cache laporan (FR-21), jadi panggilan berikutnya menghitung ulang
    await panggil('POST', `/produk/${produkId}/opname`, tokenPemilik, { stokFisik: i % 2, alasan: 'lain-lain' });
    dingin.push((await panggil('GET', '/laporan/produk-terlaris?limit=10', tokenPemilik)).ms);
    hangat.push((await panggil('GET', '/laporan/produk-terlaris?limit=10', tokenPemilik)).ms);
  }
  console.log(`Tanpa cache (hitung ulang) : rata-rata ${rata2(dingin).toFixed(2)} ms`);
  console.log(`Dengan cache (TTL 60 dtk)  : rata-rata ${rata2(hangat).toFixed(2)} ms`);
  cek('Panggilan ber-cache lebih cepat dari panggilan tanpa cache', rata2(hangat) < rata2(dingin));

  // ---------- 4. Invalidasi ----------
  console.log('\n== 4. Invalidasi cache saat transaksi baru ==');
  const sebelum = (await panggil('GET', '/laporan/ringkasan', tokenPemilik)).json.data.jumlahTransaksiHariIni;
  await panggil('POST', `/produk/${produkId}/opname`, tokenPemilik, { stokFisik: 3, alasan: 'stok masuk' });
  await panggil('GET', '/laporan/ringkasan', tokenPemilik);
  await panggil('POST', '/transaksi', tokenKasir, {
    items: [{ productId: produkId, qty: 1 }],
    metodeBayar: 'tunai',
    nominalBayar: 1000,
  });
  const sesudah = (await panggil('GET', '/laporan/ringkasan', tokenPemilik)).json.data.jumlahTransaksiHariIni;
  cek('Ringkasan langsung mencerminkan transaksi baru (cache dibersihkan)', sesudah === sebelum + 1, `${sebelum} -> ${sesudah}`);

  await mongoose.disconnect();
  const gagal = hasil.filter((h) => !h).length;
  console.log(`\nRingkasan: ${hasil.length - gagal} lulus, ${gagal} gagal`);
  process.exit(gagal === 0 ? 0 : 1);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
