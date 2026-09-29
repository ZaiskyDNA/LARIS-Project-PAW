# Laporan Milestone 1 - Backend LARIS

Kelompok 15 - Pengembangan Web Aplikasi
Studi kasus: Toko Kelontong "Berkah"

| Anggota | Bagian | NIM |
|---|---|---|
| Muhammad Zakiyyuddin Abdul Adhiim | Autentikasi, otorisasi, pengguna | 24/545668/TK/60719 |
| Josiah Hermes | Produk, stok, peringatan | 24/543958/TK/60463 |
| Yuki Shafa Maheswari | Transaksi, kasir, pembayaran | 24/545600/TK/60708 |
| Sukmawati | Laporan, ekspor, cache | 24/545512/TK/60686 |

## 1. Analisis Kebutuhan

Sistem dipakai oleh dua peran: pemilik toko (Pak Hasan) dan kasir (Rani). Kebutuhan berikut diambil dari user story pada PRD.

| ID | Peran | Kebutuhan | Prioritas |
|---|---|---|---|
| US-01 | Pemilik/kasir | Login dengan email dan kata sandi agar akses sesuai peran | Must |
| US-02 | Pemilik | Menambah, mengubah, dan menghapus produk | Must |
| US-03 | Pemilik | Mengubah harga produk kapan saja, tanpa mengubah transaksi lama | Must |
| US-04 | Pemilik | Melihat produk yang stoknya menipis | Must |
| US-05 | Pemilik | Melihat omzet harian | Must |
| US-06 | Pemilik | Melihat produk terlaris | Must |
| US-07 | Pemilik | Membuat dan menonaktifkan akun kasir | Must |
| US-08 | Kasir | Login dan hanya mendapat menu kasir | Must |
| US-09 | Kasir | Mencari dan memilih produk saat transaksi | Must |
| US-10 | Kasir | Menyelesaikan transaksi, total dan kembalian dihitung otomatis | Must |
| US-11 | Kasir | Menerima pembayaran QRIS | Could |
| US-12 | Pemilik | Mengekspor laporan penjualan | Should |
| US-13 | Pemilik | Stok opname untuk mencocokkan stok sistem dengan stok fisik | Should |
| US-14 | Kasir | Melihat riwayat transaksi miliknya sendiri | Must |

Kebutuhan lain yang berpengaruh ke backend:

- kata sandi disimpan sebagai hash dan tidak pernah dikirim ke klien
- endpoint pemilik harus menolak kasir dengan status 403
- stok tidak boleh negatif dan transaksi tidak boleh tersimpan sebagian
- setiap perubahan stok tercatat (mutasi stok)
- tanggal laporan memakai zona waktu Asia/Jakarta
- laporan di-cache 60 detik

## 2. Analisis Fitur

| No | Modul | Fitur | Dari user story |
|---|---|---|---|
| 1 | Autentikasi | Login, JWT 8 jam, profil, logout | US-01, US-08 |
| 2 | Otorisasi | Middleware cek token dan peran | US-02, US-08 |
| 3 | Pengguna | Buat, lihat, ubah, nonaktifkan akun | US-07 |
| 4 | Produk | Tambah, ubah, hapus (soft delete) | US-02, US-03 |
| 5 | Produk | Daftar dengan pencarian, filter kategori, paginasi; cari lewat barcode | US-09 |
| 6 | Stok | Daftar stok menipis, status stok (aman/menipis/habis) | US-04 |
| 7 | Stok | Stok opname dan riwayat mutasi | US-13 |
| 8 | Transaksi | Buat transaksi multi item, total dan kembalian dihitung server | US-10 |
| 9 | Transaksi | Stok berkurang otomatis, ditolak jika stok kurang | US-10 |
| 10 | Transaksi | Riwayat dan detail (kasir hanya miliknya) | US-14 |
| 11 | Pembayaran | QRIS lewat Midtrans sandbox dan webhook | US-11 |
| 12 | Laporan | Ringkasan dashboard, omzet harian, produk terlaris | US-05, US-06 |
| 13 | Laporan | Ekspor Excel dan PDF | US-12 |
| 14 | Laporan | Cache laporan | nilai tambah |
| 15 | Pengaturan | Nama toko dan stok minimum default | - |

Belum dikerjakan: deployment backend (jadwal minggu 5).

## 3. Daftar API

Base URL: `http://localhost:5000/api`. Endpoint selain login memakai header `Authorization: Bearer <token>`. Total 27 endpoint. Penjelasan parameter dan kode galat ada di `API-Reference.md`.

| No | Method | Endpoint | Fungsi | Akses |
|---|---|---|---|---|
| 1 | POST | /auth/login | Login | Publik |
| 2 | GET | /auth/profil | Profil pengguna | Login |
| 3 | POST | /auth/logout | Logout | Login |
| 4 | POST | /users | Buat akun | Pemilik |
| 5 | GET | /users | Daftar akun | Pemilik |
| 6 | PATCH | /users/:id | Ubah nama / status akun | Pemilik |
| 7 | DELETE | /users/:id | Nonaktifkan akun | Pemilik |
| 8 | GET | /produk | Daftar produk | Login |
| 9 | GET | /produk/:id | Detail produk | Login |
| 10 | GET | /produk/barcode/:kode | Cari produk lewat barcode | Login |
| 11 | POST | /produk | Tambah produk | Pemilik |
| 12 | PUT | /produk/:id | Ubah produk | Pemilik |
| 13 | DELETE | /produk/:id | Hapus produk (soft delete) | Pemilik |
| 14 | GET | /produk/stok-menipis | Produk stok menipis | Pemilik |
| 15 | POST | /produk/:id/opname | Stok opname | Pemilik |
| 16 | GET | /produk/:id/mutasi | Riwayat mutasi stok | Pemilik |
| 17 | POST | /transaksi | Buat transaksi | Login |
| 18 | GET | /transaksi | Riwayat transaksi | Login |
| 19 | GET | /transaksi/:id | Detail transaksi | Login |
| 20 | POST | /transaksi/:id/bayar-qris | Buat sesi QRIS | Login |
| 21 | POST | /transaksi/webhook-midtrans | Notifikasi Midtrans | Publik |
| 22 | GET | /laporan/ringkasan | Ringkasan dashboard | Pemilik |
| 23 | GET | /laporan/omzet-harian | Omzet per hari | Pemilik |
| 24 | GET | /laporan/produk-terlaris | Produk terlaris | Pemilik |
| 25 | GET | /laporan/ekspor | Ekspor xlsx / pdf | Pemilik |
| 26 | GET | /pengaturan | Baca pengaturan toko | Login |
| 27 | PUT | /pengaturan | Ubah pengaturan toko | Pemilik |

## 4. Hasil Pemanggilan API via Postman

Koleksi: `backend/docs/LARIS.postman_collection.json` (147 request, tiap request punya test otomatis). Environment: `backend/docs/LARIS.postman_environment.json`.

Ringkasan hasil Collection Runner: 147 request, 314 test lulus, 0 gagal.

Tangkapan layar (disimpan di `dokumen/screenshot-postman/`):

| Gambar | Isi |
|---|---|
| 01-login-pemilik.png | Login pemilik, mendapat token |
| 02-tambah-produk.png | Tambah produk (201) |
| 03-transaksi-tunai.png | Transaksi tunai, total dan kembalian |
| 04-stok-tidak-cukup.png | Transaksi ditolak karena stok kurang (400) |
| 05-kasir-ditolak-403.png | Kasir mengakses endpoint pemilik (403) |
| 06-tanpa-token-401.png | Request tanpa token (401) |
| 07-laporan-omzet.png | Laporan omzet harian |
| 08-produk-terlaris.png | Produk terlaris |
| 09-ekspor.png | Ekspor laporan |
| 10-collection-runner.png | Hasil Collection Runner (semua hijau) |
