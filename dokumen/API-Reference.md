# API Reference

Base URL: `http://localhost:5000/api`
Format: JSON. Endpoint yang butuh login memakai header `Authorization: Bearer <token>`.

## Format respons

Berhasil:

```json
{ "sukses": true, "pesan": "Produk berhasil ditambahkan", "data": {}, "meta": { "halaman": 1, "perHalaman": 20, "total": 15, "totalHalaman": 1 } }
```

Gagal:

```json
{ "sukses": false, "pesan": "Validasi gagal", "kodeGalat": "VALIDASI_GAGAL", "galat": [{ "field": "harga", "pesan": "Harga tidak boleh negatif" }] }
```

| Status | kodeGalat | Arti |
|---|---|---|
| 400 | VALIDASI_GAGAL | Input tidak valid |
| 400 | STOK_TIDAK_CUKUP | Stok kurang dari jumlah yang dibeli |
| 401 | TIDAK_TERAUTENTIKASI | Token tidak ada atau tidak valid |
| 401 | KREDENSIAL_SALAH | Email atau kata sandi salah |
| 403 | AKSES_DITOLAK | Peran tidak diizinkan |
| 404 | TIDAK_DITEMUKAN | Data atau rute tidak ada |
| 409 | DATA_DUPLIKAT | Email, nama produk, atau barcode sudah dipakai |
| 422 | PEMBAYARAN_GAGAL | Pembayaran QRIS gagal |
| 429 | TERLALU_BANYAK_PERMINTAAN | Terlalu banyak percobaan login |
| 500 | GALAT_SERVER | Kesalahan server |

## Autentikasi

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| POST | /auth/login | Publik | Body: `email`, `password`. Mengembalikan `token` dan `user` |
| GET | /auth/profil | Login | Data pengguna yang sedang login |
| POST | /auth/logout | Login | Token dihapus di sisi klien |

## Pengguna

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| POST | /users | Pemilik | Body: `nama`, `email`, `password`, `role` (default `kasir`) |
| GET | /users | Pemilik | Query: `role` |
| PATCH | /users/:id | Pemilik | Body: `nama`, `isAktif` |
| DELETE | /users/:id | Pemilik | Menonaktifkan akun, tidak bisa untuk akun sendiri |

## Produk dan stok

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| GET | /produk | Login | Query: `cari`, `kategori`, `statusStok`, `halaman`, `perHalaman` |
| GET | /produk/:id | Login | Detail produk |
| GET | /produk/barcode/:kode | Login | Cari lewat barcode |
| POST | /produk | Pemilik | Body: `nama`, `kategori`, `harga`, `stok`, `stokMinimum`, `satuan`, `barcode` |
| PUT | /produk/:id | Pemilik | Ubah data produk |
| DELETE | /produk/:id | Pemilik | Soft delete |
| GET | /produk/stok-menipis | Pemilik | Produk dengan stok <= stok minimum, urut stok terkecil |
| POST | /produk/:id/opname | Pemilik | Body: `stokFisik`, `alasan` (rusak, hilang, kedaluwarsa, salah input, stok masuk, lain-lain) |
| GET | /produk/:id/mutasi | Pemilik | Riwayat mutasi stok |

## Transaksi

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| POST | /transaksi | Login | Body: `items` (`productId`, `qty`), `metodeBayar` (tunai/qris), `nominalBayar` |
| GET | /transaksi | Login | Query: `tanggalMulai`, `tanggalAkhir`, `halaman`, `perHalaman`. Kasir hanya melihat miliknya |
| GET | /transaksi/:id | Login | Kasir hanya bisa membuka miliknya |
| POST | /transaksi/:id/bayar-qris | Login | Membuat sesi pembayaran QRIS |
| POST | /transaksi/webhook-midtrans | Publik | Notifikasi Midtrans, tanda tangan diperiksa |

## Laporan (pemilik)

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | /laporan/ringkasan | Omzet hari ini, jumlah transaksi, rata-rata, jumlah stok menipis |
| GET | /laporan/omzet-harian | Query: `tanggalMulai`, `tanggalAkhir` (YYYY-MM-DD) |
| GET | /laporan/produk-terlaris | Query: `limit` (default 10), `tanggalMulai`, `tanggalAkhir` |
| GET | /laporan/ekspor | Query: `format` (xlsx/pdf), `tanggalMulai`, `tanggalAkhir` |

## Pengaturan

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| GET | /pengaturan | Login | Baca pengaturan toko |
| PUT | /pengaturan | Pemilik | Body: `namaToko`, `alamat`, `stokMinimumDefault`, `mataUang` |

## Aturan validasi

- email harus valid dan unik, kata sandi minimal 8 karakter dengan huruf dan angka
- nama produk 2 sampai 100 karakter dan unik, harga bilangan bulat 0 sampai 100.000.000, stok bilangan bulat tidak negatif
- barcode 8 sampai 20 karakter huruf/angka dan unik
- `qty` bilangan bulat minimal 1, tidak boleh melebihi stok
- pembayaran tunai minimal sebesar total
- tanggal berformat `YYYY-MM-DD`, tanggal mulai tidak melewati tanggal akhir, rentang maksimal 365 hari

## Catatan

- Transaksi tunai mengurangi stok dengan `findOneAndUpdate({ stok: { $gte: qty } })`. Jika ada item yang gagal, item yang sudah dikurangi dikembalikan, jadi tidak ada transaksi yang tersimpan sebagian.
- Transaksi QRIS berstatus `menunggu` dan stok baru berkurang setelah webhook `settlement`.
- Cache laporan 60 detik dan dihapus saat ada transaksi, opname, atau perubahan produk.
- Respons login memakai `data.user._id`, berbeda dari contoh PRD (`data.pengguna.id`).
