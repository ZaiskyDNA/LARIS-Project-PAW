# LARIS — Layanan Administrasi Ritel & Inventaris Stok

**Sistem Kasir & Manajemen Stok Berbasis Web untuk Toko Kelontong**

LARIS (Layanan Administrasi Ritel & Inventaris Stok) adalah sistem kasir dan manajemen stok berbasis web yang dikembangkan untuk membantu Toko Kelontong "Berkah" mengatasi permasalahan pencatatan transaksi dan inventaris yang sebelumnya dilakukan secara manual dan tidak tersinkronisasi.

Aplikasi ini menyediakan satu sumber data terpusat untuk mendukung aktivitas kasir dan pemantauan toko oleh pemilik.

## Kelompok & Anggota Tim

**Nama Kelompok:** Kelompok 15

| No | Peran | Nama Anggota | NIM / NPM |
|---|---|---|---|
| 1 | Project Manager | Josiah Hermes | 24/543958/TK/60463 |
| 2 | Backend Developer | Muhammad Zakiyyuddin Abdul Adhiim | 24/545668/TK/60719 |
| 3 | UI/UX Designer | Sukmawati | 24/545512/TK/60686 |
| 4 | Frontend Developer | Yuki Shafa Maheswari | 24/545600/TK/60708 |

## Fitur Utama

LARIS memiliki dua peran utama, yaitu **Pemilik** dan **Kasir**.

- **Autentikasi & Otorisasi**  
  Login menggunakan JWT serta pembatasan akses berdasarkan peran.

- **Manajemen Pengguna**  
  Pemilik dapat membuat, melihat, mengubah, dan menonaktifkan akun kasir.

- **Manajemen Produk**  
  Pemilik dapat menambah, mengubah, dan menonaktifkan produk menggunakan mekanisme *soft delete*.

- **Manajemen Stok**  
  Menampilkan stok terkini, peringatan stok menipis, stok opname, serta riwayat mutasi stok.

- **Transaksi Penjualan**  
  Mendukung transaksi multi-item, perhitungan total dan kembalian di server, serta pengurangan stok otomatis.

- **Pembayaran QRIS**  
  Integrasi Midtrans Sandbox dan webhook untuk pembayaran non-tunai.

- **Laporan & Analitik**  
  Menampilkan ringkasan omzet, omzet harian, dan produk terlaris serta ekspor laporan ke Excel/PDF.

- **Riwayat Transaksi**  
  Kasir dapat melihat riwayat transaksi miliknya sendiri, sedangkan pemilik dapat melihat seluruh riwayat.

## Struktur Folder dan File

```text
LARIS-Project-PAW/
├── .gitignore
├── COMMIT_CONVENTION.md
├── README.md
├── backend/
│   ├── docs/
│   ├── scripts/
│   ├── src/
│   └── ...
├── frontend/
│   └── ...
└── dokumen/
    ├── API-Reference.md
    ├── laporan-milestone-1-backend.md
    ├── laporan-pengujian.md
    ├── pembagian-tugas.md
    └── PRD-LARIS-v2.md
```

## Teknologi yang Digunakan

### Frontend

- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **Data Fetching & State:** React Query, Axios
- **Validasi Form:** React Hook Form, Zod
- **Komponen/UI:** Lucide React, react-hot-toast
- **Visualisasi:** Recharts

### Backend

- **Runtime:** Node.js
- **Framework:** Express.js
- **Basis Data:** MongoDB Atlas
- **ODM:** Mongoose
- **Autentikasi:** JSON Web Token (JWT)
- **Password Hashing:** bcryptjs
- **Keamanan:** Helmet, CORS, express-rate-limit
- **Pembayaran:** Midtrans SDK
- **Ekspor Data:** ExcelJS, PDFKit
- **Caching:** node-cache

## Prasyarat & Instalasi

Pastikan perangkat telah memiliki:

- Node.js (disarankan v18+)
- npm
- Akses ke MongoDB Atlas

### 1. Clone Repository

```bash
git clone https://github.com/ZaiskyDNA/LARIS-Project-PAW.git
cd LARIS-Project-PAW
```
### 2. Menjalankan Backend

```
cd backend
npm install
npm run seed
npm run dev
```

### 3. Menjalankan Frontend
Buka terminal baru:

```
cd frontend
npm install
npm run dev
```
Aplikasi frontend dapat diakses melalui: http://localhost:5173

## Dokumentasi Proyek

- [PRD LARIS v2](./dokumen/PRD-LARIS-v2.md)
- [API Reference](./dokumen/API-Reference.md)
- [Laporan Milestone 1 (Backend)](./dokumen/laporan-milestone-1-backend.md)
- [Laporan Pengujian](./dokumen/laporan-pengujian.md)
- [Pembagian Tugas](./dokumen/pembagian-tugas.md)

### Dokumentasi Postman

- Collection: `backend/docs/LARIS.postman_collection.json`
- Environment: `backend/docs/LARIS.postman_environment.json`

## 📄 Laporan Milestone 1

Laporan Milestone 1 dapat diakses melalui Google Drive berikut: [Google Drive - Laporan Milestone 1](https://drive.google.com/file/d/1-kUvRislSNcM7-iy5UjdnEZapDCsi2qd/view?usp=sharing)
