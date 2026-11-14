# LARIS — Frontend

Antarmuka web LARIS (kasir & manajemen stok) untuk pemilik dan kasir. Tampilan mengikuti desain Figma "PAW" (palet krem–jingga, tata letak desktop + HP).

## Menjalankan

```bash
npm install
cp .env.example .env   # VITE_API_URL, default http://localhost:5000/api
npm run dev            # http://localhost:5173
```

Backend harus berjalan lebih dulu (lihat README di akar repositori). Akun contoh ada di data seed backend.

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Server pengembangan |
| `npm run build` | Build produksi ke `dist/` |
| `npm run lint` | Pemeriksaan kode (oxlint) |

## Halaman & rute

| Rute | Halaman | Akses |
|---|---|---|
| `/masuk` | Login | Publik |
| `/` | Dashboard | Pemilik (kasir dialihkan ke `/kasir`) |
| `/produk`, `/produk?tab=menipis` | Produk & Stok, stok menipis, stok opname | Pemilik |
| `/produk/tambah`, `/produk/:id/ubah` | Form produk | Pemilik |
| `/produk/:id/mutasi` | Riwayat mutasi stok | Pemilik |
| `/laporan` | Laporan + ekspor Excel/PDF | Pemilik |
| `/pengguna` | Manajemen akun kasir | Pemilik |
| `/pengaturan` | Pengaturan toko | Pemilik |
| `/kasir` | Transaksi (tunai/QRIS), struk | Pemilik & Kasir |
| `/transaksi` | Riwayat transaksi | Pemilik (semua) · Kasir (miliknya) |
| `/profil` | Profil & keluar | Pemilik & Kasir |
| `/akses-ditolak`, `*` | 403 dan 404 | Semua |

## Struktur

```
src/
├── halaman/      satu berkas per halaman
├── komponen/     umum · tataletak · produk · kasir · laporan · pengguna
├── hook/         logika & React Query (awalan `gunakan`)
├── layanan/      pemanggilan API (Axios), satu berkas per modul
├── konteks/      KonteksAuth — sesi pengguna & token
├── rute/         RuteAplikasi, RuteTerproteksi (penjaga peran)
├── skema/        validasi form (Zod)
└── utilitas/     formatRupiah, formatTanggal, konstanta, galatApi
```

Aturan yang dipegang: halaman tidak memanggil Axios langsung (selalu lewat `layanan/` + `hook/`), daftar tetap ada di `utilitas/konstanta.js`, dan token warna didefinisikan sekali di `src/index.css` (`@theme`).

Karena hook memakai awalan `gunakan` (bukan `use`), aturan lint `rules-of-hooks` dimatikan khusus untuk `src/hook/` di `.oxlintrc.json`.
