# Pembagian Tugas

Kelompok 15

| Anggota | NIM | Bagian | FR |
|---|---|---|---|
| Muhammad Zakiyyuddin Abdul Adhiim | 24/545668/TK/60719 | Autentikasi, otorisasi, pengguna | FR-01 sampai FR-05, FR-28, FR-29, FR-31 |
| Josiah Hermes | 24/543958/TK/60463 | Produk, stok, peringatan stok | FR-06 sampai FR-10, FR-22 sampai FR-25 |
| Yuki Shafa Maheswari | 24/545600/TK/60708 | Transaksi, kasir, pembayaran | FR-11 sampai FR-15, FR-20, FR-26, FR-27, FR-32 |
| Sukmawati | 24/545512/TK/60686 | Laporan, ekspor, cache | FR-16 sampai FR-19, FR-21, FR-30 |

## Bagian backend per anggota

| Anggota | File utama di `backend/src` |
|---|---|
| Zakiyyuddin | `model/User.js`, `pengendali/authPengendali.js`, `pengendali/penggunaPengendali.js`, `middleware/autentikasi.js`, `middleware/otorisasi.js` |
| Josiah | `model/Produk.js`, `model/MutasiStok.js`, `pengendali/produkPengendali.js`, `layanan/layananStok.js` |
| Yuki | `model/Transaksi.js`, `pengendali/transaksiPengendali.js`, `utilitas/nomorTransaksi.js`, `konfigurasi/midtrans.js` |
| Sukmawati | `pengendali/laporanPengendali.js`, `layanan/layananLaporan.js`, `layanan/layananEkspor.js`, `konfigurasi/cache.js` |

## Tanggung jawab bersama

- review Pull Request silang: Zakiyyuddin dengan Josiah, Yuki dengan Sukmawati
- README dan dokumentasi
- Postman collection dan pengujian API
