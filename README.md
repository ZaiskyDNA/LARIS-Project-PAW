# LARIS — Layanan Administrasi Ritel & Inventaris Stok

**Sistem Kasir & Manajemen Stok Berbasis Web untuk Toko Kelontong**

LARIS adalah sebuah sistem kasir dan manajemen stok berbasis web yang dibangun untuk mengatasi permasalahan pencatatan manual pada UMKM, dengan studi kasus pada Toko Kelontong "Berkah". Proyek ini merupakan pemenuhan tugas mata kuliah Pengembangan Web Aplikasi.

## 👥 Kelompok & Anggota Tim

**Nama Kelompok:** Kelompok 15

| Peran | Nama Anggota | NIM / NPM |
|---|---|---|
| Autentikasi, Otorisasi & Pengguna | Muhammad Zakiyyuddin Abdul Adhiim | 24/545668/TK/60719 |
| Produk, Stok & Peringatan | Josiah Hermes | 24/543958/TK/60463 |
| Transaksi, Kasir & Pembayaran | [Nama Anggota C] | [NIM Anggota C] |
| Laporan, Dashboard, Ekspor & Cache | Sukmawati | 24/545512/TK/60686 |

## 🚀 Fitur Utama

Sistem ini memfasilitasi dua peran pengguna, yaitu **Pemilik** dan **Kasir**, dengan fitur utama sebagai berikut:
- **Autentikasi & Otorisasi:** Sistem login dengan JWT, pembagian akses secara ketat antara pemilik toko dan kasir.
- **Manajemen Katalog & Stok:** Pemilik dapat melakukan CRUD produk, mengatur harga, memeriksa stok yang menipis, serta melakukan stok opname.
- **Transaksi Penjualan:** Antarmuka kasir yang interaktif untuk melayani penjualan, dilengkapi kalkulasi kembalian otomatis dan integrasi pembayaran QRIS (Midtrans).
- **Laporan Penjualan:** Dashboard informatif bagi pemilik toko yang menyajikan total omzet, produk terlaris, dan fitur ekspor laporan ke Excel/PDF.
- **Audit Mutasi Stok:** Pencatatan otomatis setiap pergerakan stok (keluar/masuk) untuk mencegah selisih dan kerugian.

## 🛠️ Teknologi yang Digunakan (Tech Stack)

### Frontend
- **Framework:** React 18 dengan Vite
- **Styling:** Tailwind CSS
- **Routing & State:** React Router v6, React Query, Axios
- **Validasi Form:** React Hook Form & Zod
- **Ikon & Komponen Tambahan:** Lucide React, react-hot-toast, Recharts

### Backend
- **Framework:** Node.js dengan Express.js
- **Basis Data:** MongoDB (Atlas) dengan Mongoose ODM
- **Keamanan:** bcryptjs, jsonwebtoken, helmet, cors, express-rate-limit
- **Fitur Tambahan:** Midtrans SDK (QRIS), ExcelJS/PDFKit (Ekspor Data), node-cache

## 📦 Prasyarat & Instalasi

Pastikan sistem Anda telah memiliki [Node.js](https://nodejs.org/) (disarankan v18+) dan akses ke cluster [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

### Langkah-langkah Menjalankan Sistem Secara Lokal

1. **Kloning Repositori**
   ```bash
   git clone [URL_REPOSITORI_ANDA]
   cd LARIS-Project-PAW
   ```

2. **Jalankan Backend Server**
   ```bash
   cd backend
   npm install
   # Buat file .env berdasarkan .env.example dan lengkapi konfigurasi (MongoDB URI, JWT Secret, dll)
   npm run dev
   ```

3. **Jalankan Frontend App**
   ```bash
   cd frontend
   npm install
   # Buat file .env berdasarkan .env.example (API URL, Midtrans Client Key, dll)
   npm run dev
   ```

4. Akses antarmuka aplikasi melalui browser di `http://localhost:5173`.

## 📖 Spesifikasi Lengkap (PRD)

Dokumentasi komprehensif mengenai kontrak API, skema basis data, user stories, arsitektur, hingga metrik evaluasi dapat dibaca pada berkas [PRD-LARIS-v2.md](./PRD-LARIS-v2.md).
