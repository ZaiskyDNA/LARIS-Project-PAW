# Laporan Pengujian Backend

Alat: Postman (koleksi `backend/docs/LARIS.postman_collection.json`) dan skrip `backend/scripts/ujiIntegritas.js`.
Lingkungan: Node.js 20, MongoDB 7, data dari `npm run seed`.

Hasil: 147 request, 314 test lulus, 0 gagal. Skrip integritas: 11 pemeriksaan lulus.

## Uji otorisasi

| Endpoint | Tanpa token | Kasir | Pemilik |
|---|---|---|---|
| POST /produk | 401 | 403 | 201 |
| PUT /produk/:id | 401 | 403 | 200 |
| DELETE /produk/:id | 401 | 403 | 200 |
| GET /produk/stok-menipis | 401 | 403 | 200 |
| GET /laporan/omzet-harian | 401 | 403 | 200 |
| GET /laporan/produk-terlaris | 401 | 403 | 200 |
| POST /users | 401 | 403 | 201 |
| DELETE /users/:id | 401 | 403 | 200 |
| GET /produk | 401 | 200 | 200 |
| POST /transaksi | 401 | 201 | 201 |
| GET /transaksi | 401 | 200 (miliknya) | 200 (semua) |

## Skenario yang diuji

- kasir membuat transaksi 2 produk, stok berkurang tepat sesuai jumlah dan mutasi tercatat
- beli 100 unit dari stok 3 ditolak dengan pesan "tersisa 3", stok tidak berubah
- keranjang berisi 1 item valid dan 1 item berlebih ditolak seluruhnya
- harga diubah, transaksi lama tetap memakai harga lama
- kasir hanya melihat transaksi sendiri, transaksi pemilik menghasilkan 403
- produk yang dihapus hilang dari katalog tetapi tetap ada di produk terlaris dengan tanda "(nonaktif)"
- QRIS: stok tidak berkurang saat menunggu, berkurang setelah webhook settlement, tidak berkurang dua kali jika webhook diulang, tidak berubah jika kedaluwarsa
- ekspor xlsx dan pdf menghasilkan berkas dengan nama berisi rentang tanggal
- validasi: harga/stok negatif, qty negatif atau pecahan, kata sandi lemah, email tidak valid, tanggal terbalik atau tidak ada, ID bukan ObjectId, JSON rusak
- login salah memberi pesan yang sama untuk email tidak terdaftar dan kata sandi salah
- rate limit login mengembalikan 429 pada percobaan ke-6 (diuji dengan batas 5)

## Uji integritas (`npm run uji:integritas`)

- 12 pembelian serentak untuk stok 5: 5 berhasil, 7 ditolak, stok akhir 0
- rekonsiliasi stok: rantai mutasi berkesinambungan, stok sama dengan mutasi terakhir, jumlah mutasi penjualan sama dengan jumlah barang terjual di transaksi
- cache laporan (rata-rata 15 kali): 8,4 ms tanpa cache, 4,8 ms dengan cache
- cache terhapus setelah transaksi baru

## Perbaikan setelah pengujian

- transaksi disimpan sebelum stok dikurangi, sekarang stok dikurangi dulu dengan rollback jika gagal
- validasi input dilengkapi sesuai PRD 7.2
- tanggal default memakai zona Asia/Jakarta
- produk terlaris menandai produk yang sudah dihapus
- webhook Midtrans memeriksa tanda tangan
- nomor transaksi berurutan per hari (TRX-YYYYMMDD-0001)
- ekspor Excel ditambah rentang tanggal dan total omzet
- folder `backend/node_modules` yang ikut ter-commit dikeluarkan dari git

## Belum teruji atau belum selesai

- QRIS belum dicoba dengan kunci Midtrans sungguhan. Tanpa kunci, API mengembalikan sesi contoh (`mock: true`)
- deployment belum dilakukan
- logout hanya menghapus token di klien
