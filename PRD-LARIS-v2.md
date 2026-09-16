# Product Requirements Document (PRD)
## LARIS — Layanan Administrasi Ritel & Inventaris Stok

**Sistem Kasir & Manajemen Stok Berbasis Web untuk Toko Kelontong**

| | |
|---|---|
| **Mata Kuliah** | Pengembangan Web Aplikasi |
| **Kategori Masalah** | Migrasi Platform |
| **Domain** | Toko Kelontong — Kasir & Manajemen Stok |
| **Studi Kasus** | Toko Kelontong "Berkah" |
| **Jumlah Anggota Tim** | 4 orang |
| **Durasi Pengembangan** | 5 minggu |
| **Versi Dokumen** | 2.0 |
| **Status** | Disetujui untuk pengembangan |

---

## Daftar Isi

| Bagian | Judul |
|---|---|
| 0 | Ringkasan Perubahan dari v1.0 |
| 1 | Latar Belakang & Analisis Masalah |
| 2 | Tujuan Projek & Metrik Keberhasilan |
| 3 | Ruang Lingkup & Prioritas Fitur (MoSCoW) |
| 4 | Pengguna, Peran & Matriks Hak Akses |
| 5 | User Stories & Kriteria Penerimaan |
| 6 | Kebutuhan Fungsional |
| 7 | Aturan Bisnis & Aturan Validasi |
| 8 | Kebutuhan Non-Fungsional (Terukur) |
| 9 | Arsitektur Sistem & Tech Stack |
| 10 | Skema Basis Data |
| 11 | Kontrak API |
| 12 | Rancangan Antarmuka & Alur Pengguna |
| 13 | Struktur Folder Proyek |
| 14 | Standar Kode & Alur Kerja Git |
| 15 | Strategi Pengujian |
| 16 | Deployment & Konfigurasi Lingkungan |
| 17 | Pembagian Tim & Tanggung Jawab |
| 18 | Timeline Pengembangan 5 Minggu |
| 19 | Definition of Done |
| 20 | Risiko & Mitigasi |
| 21 | Pemetaan Rubrik Penilaian → Bukti Pengerjaan |
| 22 | Rencana Presentasi & Video |
| 23 | Glosarium |
| A | Lampiran: Contoh Payload API |

---

## 0. Ringkasan Perubahan dari v1.0

Bagian ini dicantumkan agar tim mengetahui apa yang berubah dan mengapa.

| No | Perubahan | Alasan |
|---|---|---|
| 1 | Menambahkan **kriteria penerimaan (acceptance criteria)** pada setiap user story | v1.0 hanya menyebut "saya ingin" tanpa definisi kapan sebuah story dianggap selesai, sehingga rawan perbedaan tafsir antar anggota tim |
| 2 | Menambahkan **FR-22 s.d. FR-31** (stok opname, riwayat mutasi stok, pemindaian barcode, pencarian & paginasi, manajemen profil) | Rubrik "Ketepatan fitur" (35%) menuntut *fitur pendukung yang menambah kenyamanan*, bukan hanya kebutuhan minimum |
| 3 | Menambahkan **koleksi `mutasiStok`** sebagai jejak audit stok | Masalah inti toko adalah selisih stok. Tanpa jejak mutasi, selisih tetap tidak bisa dilacak penyebabnya |
| 4 | Mengubah penghapusan produk menjadi **soft delete** (`isAktif: false`) | Hard delete merusak integritas laporan historis karena produk yang sudah terjual ikut hilang |
| 5 | Menambahkan **prioritas MoSCoW** pada seluruh fitur | Durasi 5 minggu menuntut kejelasan mana yang boleh dikorbankan bila waktu mepet |
| 6 | Menambahkan **kontrak API lengkap** (format respons standar, kode galat, contoh payload) | v1.0 menunda hal ini ke "dokumen terpisah"; menyatukannya mencegah backend & frontend saling menunggu |
| 7 | Menambahkan **aturan validasi eksplisit per field** | Rubrik frontend "Konsumsi API dan validasi form" berbobot 30% — validasi harus terdefinisi, bukan improvisasi |
| 8 | Menambahkan **standar kode, alur Git, dan target kontribusi per anggota** | Rubrik "Kontribusi" (30%) dan "Alur pengembangan" (10%) dinilai dari jejak commit |
| 9 | Menambahkan **strategi pengujian & skenario uji end-to-end** | Diperlukan sebagai bukti bahwa FR benar-benar berfungsi saat demo |
| 10 | Menambahkan **pemetaan rubrik → bukti pengerjaan** (Bagian 21) | Memastikan tidak ada butir rubrik yang terlewat |
| 11 | Membuat kebutuhan non-fungsional **terukur** (angka, bukan kata sifat) | "Merespons cepat" tidak bisa diuji; "< 500 ms untuk 1.000 transaksi" bisa |
| 12 | Memperbaiki inkonsistensi DoD v1.0 yang menyebut "FR-01 s.d. FR-19" padahal FR mencapai FR-21 | Kesalahan penomoran |
| 13 | Menambahkan **desain sistem visual** (palet warna, tipografi, komponen) | Rubrik "Penerjemahan desain ke antarmuka" (20%) menilai konsistensi |
| 14 | Menambahkan **rencana presentasi & video** | Rubrik presentasi (15%) + video (10%) = 25% dari Penilaian Umum, namun tidak dibahas di v1.0 |

---

## 1. Latar Belakang & Analisis Masalah

### 1.1 Kondisi Saat Ini (As-Is)

Toko Kelontong "Berkah" mencatat penjualan di **dua kanal terpisah dan tidak tersinkronisasi**:

1. **Buku catatan manual** — dipakai saat toko ramai atau baterai HP habis.
2. **Catatan di HP** (aplikasi catatan/spreadsheet sederhana) — dipakai pemilik untuk rekap.

Alur kerja saat ini:

```
Pelanggan ──▶ Kasir menghitung manual ──▶ Catat di buku ATAU di HP
                                              │
                                              ▼
                              Malam hari: pemilik menyalin ulang
                              kedua catatan → rekap harian manual
                                              │
                                              ▼
                              Stok dihitung ulang dengan perkiraan
```

### 1.2 Akar Masalah dan Dampaknya

| Akar Masalah | Dampak Langsung | Dampak Bisnis |
|---|---|---|
| Pencatatan terpisah di dua kanal tanpa sinkronisasi | Data penjualan ganda atau hilang | Angka omzet tidak dapat dipercaya |
| Stok tidak dikurangi otomatis saat penjualan | Stok sistem ≠ stok fisik di rak | Barang laku habis tanpa disadari → kehilangan penjualan |
| Tidak ada agregasi data penjualan | Pemilik tidak tahu produk terlaris | Salah alokasi modal saat kulakan |
| Rekap dilakukan manual setiap malam | 30–60 menit kerja repetitif per hari | Waktu pemilik tersita dari pengembangan usaha |
| Tidak ada ambang peringatan stok | Restock selalu terlambat | Pelanggan kecewa, beralih ke toko lain |

### 1.3 Kondisi yang Diinginkan (To-Be)

Satu sistem kasir berbasis web yang menyatukan katalog produk beserta stoknya, pencatatan transaksi, peringatan stok menipis, dan laporan penjualan — mengikuti pola aplikasi kasir UMKM yang telah lazim di Indonesia (BukuWarung, Kasir Pintar, majoo, Qasir).

```
Pelanggan ──▶ Kasir input di LARIS ──▶ Stok berkurang otomatis (real-time)
                      │                          │
                      │                          ▼
                      │                 Peringatan stok menipis
                      ▼                          │
              Transaksi tersimpan ───────────────┤
                      │                          ▼
                      └──────────────▶ Dashboard omzet & produk terlaris
                                       (tanpa rekap manual)
```

### 1.4 Mengapa Berbasis Web

- Dapat diakses dari perangkat yang sudah dimiliki (HP kasir, laptop pemilik) tanpa instalasi.
- Pembaruan sistem tidak perlu dilakukan di setiap perangkat.
- Satu sumber data (*single source of truth*) untuk kasir dan pemilik secara bersamaan.

---

## 2. Tujuan Projek & Metrik Keberhasilan

Setiap tujuan dilengkapi metrik agar keberhasilan dapat dibuktikan saat demo, bukan sekadar diklaim.

| Kode | Tujuan | Metrik Keberhasilan | Cara Verifikasi |
|---|---|---|---|
| T-01 | Menyatukan pencatatan produk, stok, dan transaksi ke satu sistem | 100% transaksi demo tercatat di satu basis data; tidak ada pencatatan di luar sistem | Cek koleksi `transactions` di MongoDB Atlas |
| T-02 | Menghilangkan selisih stok | Stok akhir = stok awal − total kuantitas terjual, selisih 0 pada 20 transaksi uji | Skrip uji rekonsiliasi (Bagian 15.4) |
| T-03 | Memberi visibilitas omzet & produk terlaris tanpa rekap manual | Laporan tersaji < 3 detik setelah halaman dibuka; angka sama dengan hitungan manual data uji | Bandingkan dashboard vs perhitungan spreadsheet |
| T-04 | Memberi peringatan dini stok menipis | Produk dengan `stok ≤ stokMinimum` selalu muncul di daftar peringatan (recall 100%) | Uji ambang batas dengan 5 produk |
| T-05 | Memisahkan wewenang pemilik dan kasir | 0 dari 8 percobaan akses endpoint pemilik oleh token kasir berhasil (semua 403) | Uji manual via Postman (Bagian 15.3) |
| T-06 | Mengurangi waktu penyusunan laporan harian | Dari ±45 menit manual menjadi < 1 menit (buka dashboard + ekspor) | Demonstrasi saat presentasi |

---

## 3. Ruang Lingkup & Prioritas Fitur (MoSCoW)

Prioritas ini adalah **alat pengambilan keputusan saat waktu mepet**. Bila minggu ke-4 tiba dan pekerjaan belum selesai, yang dikorbankan adalah *Could*, lalu *Should*, dan **tidak pernah** *Must*.

### 3.1 Must Have — wajib selesai, syarat kelulusan fungsional

| Fitur | FR Terkait |
|---|---|
| Login dengan email & kata sandi, kata sandi ter-hash | FR-01, FR-02 |
| Otorisasi berbasis peran (JWT + middleware) | FR-03, FR-04, FR-05 |
| CRUD produk lengkap oleh pemilik | FR-06 s.d. FR-09 |
| Transaksi penjualan multi-item dengan pengurangan stok otomatis | FR-11 s.d. FR-15 |
| Pencegahan transaksi bila stok tidak cukup | FR-14 |
| Peringatan stok menipis | FR-10, FR-24 |
| Laporan omzet harian & produk terlaris | FR-16 s.d. FR-18 |
| Manajemen akun kasir oleh pemilik | FR-28 |
| Tampilan responsif (desktop, tablet, HP) | NFR-05 |

### 3.2 Should Have — sangat diharapkan, dikerjakan setelah Must selesai

| Fitur | FR Terkait |
|---|---|
| Pencarian & paginasi daftar produk | FR-25 |
| Filter laporan berdasarkan rentang tanggal | FR-17 |
| Ekspor laporan ke Excel/PDF *(nilai tambah G6 #—)* | FR-19 |
| Stok opname (koreksi stok manual + alasan) | FR-22 |
| Riwayat mutasi stok (jejak audit) | FR-23 |
| Cache pada endpoint laporan *(nilai tambah G6 #4)* | FR-21 |
| Deployment backend di Render/Railway *(nilai tambah G6 #5)* | NFR-08 |

### 3.3 Could Have — dikerjakan hanya bila waktu tersisa di minggu ke-5

| Fitur | FR Terkait |
|---|---|
| Pembayaran QRIS via Midtrans *(nilai tambah G6 #3)* | FR-20 |
| Pemindaian barcode produk via kamera/USB scanner | FR-26 |
| Struk digital (cetak/unduh) | FR-27 |
| Pengaturan toko (nama toko, stok minimum default) | FR-29 |
| Grafik tren omzet 7 hari terakhir | FR-30 |

### 3.4 Won't Have — dinyatakan di luar ruang lingkup

| Di Luar Ruang Lingkup | Alasan |
|---|---|
| Manajemen multi-cabang / multi-toko | Studi kasus adalah toko tunggal |
| Manajemen supplier & purchase order stok masuk | Menambah dua modul baru; tidak diminta pada deskripsi masalah |
| Aplikasi mobile native (Android/iOS) | Fokus pada web responsif |
| Sistem akuntansi lengkap (jurnal, neraca, laba-rugi) | Di luar domain kasir & stok |
| Program loyalitas pelanggan / member | Tidak disebut dalam kebutuhan |
| Penjualan daring / marketplace | Toko fisik, transaksi di tempat |
| Mode offline (PWA offline-first) | Kompleksitas sinkronisasi melebihi durasi 5 minggu |

---

## 4. Pengguna, Peran & Matriks Hak Akses

### 4.1 Persona 1 — Pak Hasan (Pemilik Toko)

| Atribut | Keterangan |
|---|---|
| Usia / Literasi digital | 48 tahun / menengah — biasa memakai WhatsApp & aplikasi mobile banking |
| Perangkat utama | Laptop di rumah, HP saat di toko |
| Tujuan | Mengetahui omzet dan produk terlaris tanpa rekap manual; tidak kehabisan barang laku |
| Frustrasi saat ini | Menyalin catatan setiap malam; sering salah kira soal stok |
| Kebutuhan antarmuka | Angka besar dan jelas, istilah Bahasa Indonesia, sesedikit mungkin langkah |

### 4.2 Persona 2 — Rani (Kasir)

| Atribut | Keterangan |
|---|---|
| Usia / Literasi digital | 21 tahun / tinggi — cepat beradaptasi dengan aplikasi baru |
| Perangkat utama | Tablet/HP di meja kasir |
| Tujuan | Menyelesaikan transaksi secepat mungkin saat toko ramai |
| Frustrasi saat ini | Menghitung total manual, takut salah hitung uang kembalian |
| Kebutuhan antarmuka | Tombol besar, pencarian produk instan, total selalu terlihat, minim scroll |

### 4.3 Matriks Hak Akses (Authorization Matrix)

Legenda: ✅ = boleh, ❌ = ditolak (HTTP 403), 🔸 = boleh dengan batasan

| Kemampuan | Pemilik | Kasir |
|---|---|---|
| Login & melihat profil sendiri | ✅ | ✅ |
| Melihat daftar produk & stok | ✅ | ✅ |
| Menambah / mengubah / menghapus produk | ✅ | ❌ |
| Mengubah harga produk | ✅ | ❌ |
| Melakukan stok opname (koreksi stok) | ✅ | ❌ |
| Membuat transaksi penjualan | ✅ | ✅ |
| Melihat riwayat transaksi | ✅ semua | 🔸 hanya miliknya sendiri |
| Melihat daftar peringatan stok menipis | ✅ | 🔸 indikator visual saja, tanpa halaman laporan |
| Melihat laporan omzet & produk terlaris | ✅ | ❌ |
| Mengekspor laporan | ✅ | ❌ |
| Membuat / menghapus akun kasir | ✅ | ❌ |
| Mengubah pengaturan toko | ✅ | ❌ |

> **Catatan implementasi:** matriks ini adalah spesifikasi uji untuk FR-05. Setiap baris bertanda ❌ wajib diuji dengan token kasir dan harus mengembalikan HTTP 403, bukan hanya disembunyikan di antarmuka.

---

## 5. User Stories & Kriteria Penerimaan

Format kriteria: **Diberikan** (kondisi awal) → **Ketika** (aksi) → **Maka** (hasil yang diharapkan).

### US-01 — Login Pengguna
> **Sebagai** pemilik/kasir, **saya ingin** login dengan email dan kata sandi, **agar** dapat mengakses fitur sesuai wewenang saya.

**Prioritas:** Must | **Estimasi:** 3 poin | **Penanggung jawab:** Anggota A

**Kriteria Penerimaan:**
1. Diberikan email & kata sandi benar → ketika menekan "Masuk" → maka sistem mengembalikan JWT dan mengarahkan ke halaman sesuai peran (pemilik → Dashboard, kasir → Kasir).
2. Diberikan kata sandi salah → maka muncul pesan galat "Email atau kata sandi salah" **tanpa** menyebutkan field mana yang salah (mencegah *user enumeration*).
3. Diberikan field kosong → maka tombol "Masuk" tidak aktif dan muncul pesan validasi di bawah field terkait.
4. Selama permintaan berlangsung → tombol menampilkan indikator memuat dan tidak dapat ditekan dua kali.
5. Token kedaluwarsa/tidak valid saat menjelajah → maka pengguna otomatis diarahkan kembali ke halaman login.

---

### US-02 — Kelola Data Produk
> **Sebagai** pemilik, **saya ingin** menambah, mengubah, dan menghapus produk, **agar** katalog selalu sesuai kondisi toko.

**Prioritas:** Must | **Estimasi:** 5 poin | **Penanggung jawab:** Anggota B

**Kriteria Penerimaan:**
1. Diberikan form produk terisi valid → ketika disimpan → maka produk muncul di daftar tanpa perlu memuat ulang halaman, dan muncul notifikasi sukses.
2. Diberikan nama produk yang sudah ada → maka sistem menolak dengan pesan "Nama produk sudah terdaftar".
3. Diberikan harga atau stok bernilai negatif / bukan angka → maka form menolak sebelum dikirim ke API.
4. Ketika produk dihapus → maka muncul dialog konfirmasi terlebih dahulu; setelah dikonfirmasi produk hilang dari katalog **namun tetap muncul di laporan historis** (soft delete).
5. Ketika kasir membuka halaman manajemen produk secara langsung lewat URL → maka diarahkan ke halaman "Akses ditolak".

---

### US-03 — Ubah Harga Produk
> **Sebagai** pemilik, **saya ingin** mengubah harga produk kapan saja, **agar** harga jual mengikuti kondisi terkini.

**Prioritas:** Must | **Estimasi:** 2 poin | **Penanggung jawab:** Anggota B

**Kriteria Penerimaan:**
1. Ketika harga produk diubah → maka transaksi baru memakai harga baru.
2. Transaksi yang **sudah tersimpan** tetap menampilkan harga saat transaksi terjadi (`hargaSaat`), tidak berubah mengikuti harga terbaru.
3. Laporan omzet periode lampau tidak berubah nilainya setelah harga diperbarui.

---

### US-04 — Notifikasi Stok Menipis
> **Sebagai** pemilik, **saya ingin** melihat notifikasi produk berstok menipis, **agar** dapat segera melakukan restock.

**Prioritas:** Must | **Estimasi:** 3 poin | **Penanggung jawab:** Anggota B

**Kriteria Penerimaan:**
1. Diberikan produk dengan `stok ≤ stokMinimum` → maka produk tampil di kartu "Stok Menipis" pada dashboard dan diberi badge kuning di daftar produk.
2. Diberikan produk dengan `stok = 0` → maka badge berwarna merah dengan label "Habis", dan produk tidak dapat ditambahkan ke transaksi.
3. Ketika stok dinaikkan di atas ambang batas → maka produk otomatis hilang dari daftar peringatan pada pemuatan berikutnya.
4. Daftar peringatan terurut dari stok paling sedikit.

---

### US-05 — Laporan Omzet Harian
> **Sebagai** pemilik, **saya ingin** melihat laporan omzet harian, **agar** mengetahui performa penjualan tanpa rekap manual.

**Prioritas:** Must | **Estimasi:** 5 poin | **Penanggung jawab:** Anggota D

**Kriteria Penerimaan:**
1. Dashboard menampilkan total omzet hari ini, jumlah transaksi, dan rata-rata nilai transaksi.
2. Diberikan rentang tanggal → maka laporan hanya menghitung transaksi dalam rentang tersebut (inklusif, zona waktu Asia/Jakarta).
3. Diberikan hari tanpa transaksi → maka ditampilkan status kosong yang ramah ("Belum ada transaksi hari ini"), bukan angka `NaN` atau tabel kosong tanpa keterangan.
4. Angka ditampilkan dalam format Rupiah (`Rp 1.250.000`), bukan angka mentah.

---

### US-06 — Daftar Produk Terlaris
> **Sebagai** pemilik, **saya ingin** melihat daftar produk terlaris, **agar** mengetahui produk yang paling diminati.

**Prioritas:** Must | **Estimasi:** 3 poin | **Penanggung jawab:** Anggota D

**Kriteria Penerimaan:**
1. Menampilkan 10 produk teratas berdasarkan total kuantitas terjual pada periode terpilih.
2. Setiap baris menampilkan nama produk, kuantitas terjual, dan kontribusi omzet.
3. Produk yang sudah di-soft-delete tetap muncul dengan penanda "(nonaktif)" agar data historis utuh.
4. Diperhitungkan menggunakan MongoDB Aggregation Pipeline, bukan pengolahan di sisi frontend.

---

### US-07 — Daftarkan Akun Kasir
> **Sebagai** pemilik, **saya ingin** mendaftarkan akun kasir baru, **agar** karyawan dapat mengakses sistem sesuai perannya.

**Prioritas:** Must | **Estimasi:** 3 poin | **Penanggung jawab:** Anggota A

**Kriteria Penerimaan:**
1. Pemilik dapat membuat akun dengan nama, email, kata sandi, dan peran (`kasir`).
2. Email duplikat ditolak dengan pesan jelas.
3. Kata sandi minimal 8 karakter; kekuatan ditampilkan secara visual.
4. Pemilik dapat menonaktifkan/menghapus akun kasir; kasir yang dihapus tidak dapat login lagi, namun riwayat transaksinya tetap ada.
5. Pemilik tidak dapat menghapus akun dirinya sendiri.

---

### US-08 — Login Kasir
> **Sebagai** kasir, **saya ingin** login dengan akun saya, **agar** dapat mulai melayani transaksi.

**Prioritas:** Must | **Estimasi:** 1 poin | **Penanggung jawab:** Anggota A

**Kriteria Penerimaan:**
1. Setelah login, kasir langsung diarahkan ke halaman Kasir (bukan Dashboard).
2. Menu pemilik (Produk, Laporan, Manajemen Kasir) tidak tampil di navigasi kasir.

---

### US-09 — Cari & Pilih Produk saat Transaksi
> **Sebagai** kasir, **saya ingin** mencari dan memilih produk saat transaksi, **agar** input transaksi cepat dan akurat.

**Prioritas:** Must | **Estimasi:** 5 poin | **Penanggung jawab:** Anggota C

**Kriteria Penerimaan:**
1. Pencarian menyaring produk berdasarkan nama secara langsung (debounce 300 ms) tanpa menekan tombol.
2. Menekan produk menambahkannya ke keranjang dengan kuantitas awal 1; menekan ulang menambah kuantitas.
3. Kuantitas dapat diubah manual, dan tidak dapat melebihi stok tersedia (input dibatasi + pesan galat).
4. Item dapat dihapus dari keranjang; total diperbarui seketika.
5. Produk berstok 0 ditampilkan namun tidak dapat dipilih.

---

### US-10 — Selesaikan Transaksi
> **Sebagai** kasir, **saya ingin** menyelesaikan transaksi dan melihat total belanja, **agar** pelanggan bisa segera membayar.

**Prioritas:** Must | **Estimasi:** 5 poin | **Penanggung jawab:** Anggota C

**Kriteria Penerimaan:**
1. Total belanja terlihat jelas dan selalu berada di area yang mudah dijangkau (sticky di mobile).
2. Untuk pembayaran tunai: kasir memasukkan nominal uang, sistem menghitung kembalian; nominal kurang dari total ditolak.
3. Ketika transaksi disimpan → maka stok setiap produk berkurang sesuai kuantitas, dan keranjang otomatis dikosongkan untuk transaksi berikutnya.
4. Bila stok berubah oleh transaksi lain sebelum disimpan → maka muncul pesan "Stok [produk] tidak lagi mencukupi (tersisa X)" dan transaksi **tidak** tersimpan sebagian.
5. Muncul notifikasi sukses berisi nomor transaksi dan total.

---

### US-11 — Pembayaran QRIS
> **Sebagai** kasir, **saya ingin** menerima pembayaran via QRIS, **agar** dapat memberi opsi non-tunai kepada pelanggan.

**Prioritas:** Could | **Estimasi:** 8 poin | **Penanggung jawab:** Anggota C

**Kriteria Penerimaan:**
1. Memilih metode QRIS memunculkan kode QR dari payment gateway (Midtrans, mode sandbox).
2. Status pembayaran diperbarui otomatis (polling atau webhook) menjadi `berhasil` / `gagal` / `kedaluwarsa`.
3. Stok hanya berkurang setelah status pembayaran `berhasil`.
4. Bila pembayaran gagal atau kedaluwarsa → transaksi ditandai `dibatalkan` dan stok tidak berubah.
5. Kegagalan gateway tidak menghalangi transaksi tunai (fitur *degradasi anggun*).

---

### US-12 — Ekspor Laporan
> **Sebagai** pemilik, **saya ingin** mengekspor laporan penjualan, **agar** dapat menyimpan/mengirim laporan di luar sistem.

**Prioritas:** Should | **Estimasi:** 5 poin | **Penanggung jawab:** Anggota D

**Kriteria Penerimaan:**
1. Ekspor menghasilkan berkas `.xlsx` (dan/atau `.pdf`) yang langsung terunduh.
2. Berkas memuat: rentang tanggal, daftar transaksi, total omzet, dan daftar produk terlaris.
3. Nama berkas mengandung rentang tanggal, mis. `laporan-laris-2026-05-01_2026-05-31.xlsx`.
4. Selama pembuatan berkas, tombol menampilkan indikator memuat.
5. Ekspor menghormati filter tanggal yang aktif di layar.

---

### US-13 — Stok Opname *(baru di v2.0)*
> **Sebagai** pemilik, **saya ingin** mengoreksi stok sistem agar sesuai stok fisik beserta alasannya, **agar** selisih stok dapat ditelusuri dan tidak terulang.

**Prioritas:** Should | **Estimasi:** 5 poin | **Penanggung jawab:** Anggota B

**Kriteria Penerimaan:**
1. Pemilik memasukkan stok fisik hasil hitung; sistem menampilkan selisih terhadap stok sistem.
2. Alasan wajib dipilih: `rusak`, `hilang`, `kedaluwarsa`, `salah input`, `stok masuk`, `lain-lain`.
3. Setiap koreksi tercatat di koleksi `mutasiStok` beserta pengguna dan waktunya.
4. Riwayat mutasi stok per produk dapat dilihat pemilik (masuk, keluar, koreksi).

---

### US-14 — Riwayat Transaksi Kasir *(baru di v2.0)*
> **Sebagai** kasir, **saya ingin** melihat riwayat transaksi yang saya buat hari ini, **agar** dapat memeriksa bila ada keluhan pelanggan.

**Prioritas:** Must | **Estimasi:** 3 poin | **Penanggung jawab:** Anggota C

**Kriteria Penerimaan:**
1. Kasir hanya melihat transaksi dengan `kasirId` = dirinya (dipaksakan di sisi server, bukan hanya di query frontend).
2. Daftar menampilkan waktu, jumlah item, total, dan metode bayar; dapat dibuka untuk melihat detail item.
3. Terdapat paginasi bila transaksi lebih dari 20 baris.

---

## 6. Kebutuhan Fungsional

Kolom **Prioritas**: M = Must, S = Should, C = Could.

### 6.1 Modul Autentikasi & Otorisasi

| ID | Kebutuhan | Prioritas | PIC |
|---|---|---|---|
| FR-01 | Sistem menyediakan login menggunakan email dan kata sandi | M | A |
| FR-02 | Kata sandi disimpan sebagai hash bcrypt (cost factor ≥ 10), tidak pernah dalam teks biasa, dan tidak pernah dikembalikan dalam respons API | M | A |
| FR-03 | Sistem menerbitkan JWT (masa berlaku 8 jam, memuat `id` dan `role`) setelah login berhasil | M | A |
| FR-04 | Setiap endpoint terproteksi melewati middleware `autentikasi` (verifikasi token) lalu `otorisasi` (verifikasi peran) | M | A |
| FR-05 | Kasir menerima HTTP 403 saat mengakses endpoint manajemen produk, laporan, atau pengguna — termasuk bila diakses langsung via Postman/cURL | M | A |
| FR-31 | Pengguna dapat keluar (logout); token dihapus dari penyimpanan sisi klien | M | A |

### 6.2 Modul Manajemen Produk & Stok

| ID | Kebutuhan | Prioritas | PIC |
|---|---|---|---|
| FR-06 | Pemilik dapat menambah produk (nama, kategori, harga, stok awal, stok minimum, satuan, barcode opsional) | M | B |
| FR-07 | Pemilik dapat mengubah seluruh data produk, termasuk harga, kapan saja | M | B |
| FR-08 | Pemilik dapat menghapus produk secara *soft delete* (`isAktif: false`) sehingga data historis laporan tetap utuh | M | B |
| FR-09 | Pemilik dan kasir dapat melihat daftar produk beserta stok terkini | M | B |
| FR-10 | Sistem menampilkan badge peringatan pada produk dengan `stok ≤ stokMinimum`, dan badge "Habis" bila `stok = 0` | M | B |
| FR-22 | Pemilik dapat melakukan stok opname: menyesuaikan stok sistem ke stok fisik dengan alasan wajib | S | B |
| FR-23 | Sistem mencatat setiap perubahan stok (penjualan, opname, stok masuk) ke koleksi `mutasiStok` sebagai jejak audit | S | B |
| FR-24 | Sistem menyediakan endpoint & halaman khusus daftar produk berstok menipis, terurut dari stok terkecil | M | B |
| FR-25 | Daftar produk mendukung pencarian nama, filter kategori, dan paginasi (default 20 baris per halaman) | S | B |
| FR-26 | Sistem dapat menambahkan produk ke keranjang melalui pemindaian barcode (kamera perangkat atau USB scanner) | C | C |

### 6.3 Modul Transaksi

| ID | Kebutuhan | Prioritas | PIC |
|---|---|---|---|
| FR-11 | Kasir dapat membuat transaksi berisi satu atau lebih produk dengan kuantitas masing-masing | M | C |
| FR-12 | Sistem menghitung subtotal per item dan total transaksi **di sisi server** (nilai dari frontend tidak dipercaya) | M | C |
| FR-13 | Stok produk berkurang otomatis sebesar kuantitas terjual saat transaksi tersimpan | M | C |
| FR-14 | Sistem menolak transaksi bila ada item yang kuantitasnya melebihi stok tersedia, dengan menyebutkan produk dan sisa stoknya | M | C |
| FR-15 | Setiap transaksi mencatat `kasirId`, waktu (`createdAt`), metode bayar, dan nomor transaksi unik | M | C |
| FR-27 | Sistem dapat menampilkan/mengunduh struk transaksi berisi rincian item, total, kembalian, dan nama toko | C | C |
| FR-32 | Kasir dapat melihat riwayat transaksi miliknya sendiri; pemilik dapat melihat seluruh riwayat | M | C |

### 6.4 Modul Laporan

| ID | Kebutuhan | Prioritas | PIC |
|---|---|---|---|
| FR-16 | Pemilik dapat melihat total omzet harian beserta jumlah transaksi dan rata-rata nilai transaksi | M | D |
| FR-17 | Pemilik dapat memfilter laporan berdasarkan rentang tanggal (zona waktu Asia/Jakarta) | S | D |
| FR-18 | Pemilik dapat melihat daftar produk terlaris berdasarkan total kuantitas terjual, dihitung via Aggregation Pipeline | M | D |
| FR-19 | Pemilik dapat mengekspor laporan ke Excel (`.xlsx`) dan/atau PDF | S | D |
| FR-30 | Dashboard menampilkan grafik tren omzet 7 hari terakhir | C | D |

### 6.5 Modul Pengguna & Pengaturan

| ID | Kebutuhan | Prioritas | PIC |
|---|---|---|---|
| FR-28 | Pemilik dapat membuat, melihat daftar, dan menghapus/menonaktifkan akun kasir | M | A |
| FR-29 | Pemilik dapat mengubah pengaturan toko (nama toko, stok minimum default) | C | A |

### 6.6 Modul Nilai Tambah (Pihak Ketiga — G6)

| ID | Kebutuhan | Jenis G6 | Prioritas | PIC |
|---|---|---|---|---|
| FR-20 | Pembayaran QRIS melalui integrasi Midtrans (mode sandbox) | #3 Payment Gateway | C | C |
| FR-21 | Cache pada endpoint laporan dengan TTL 60 detik, diinvalidasi saat transaksi baru dibuat | #4 Cache pada backend | S | D |
| FR-33 | Deployment backend di Render/Railway (bukan Vercel) | #5 Deployment selain Vercel | S | Semua |

> **Strategi nilai tambah:** rubrik hanya mensyaratkan **minimal satu** fitur nilai tambah. Urutan pengerjaan yang dipilih adalah **cache (FR-21) → deployment non-Vercel (FR-33) → ekspor laporan (FR-19) → QRIS (FR-20)**, karena tiga yang pertama berisiko rendah dan dapat diselesaikan dalam hitungan jam, sementara QRIS bergantung pada pihak ketiga.

---

## 7. Aturan Bisnis & Aturan Validasi

### 7.1 Aturan Bisnis (Business Rules)

| Kode | Aturan |
|---|---|
| BR-01 | Stok tidak boleh bernilai negatif dalam kondisi apa pun |
| BR-02 | Transaksi bersifat **atomik**: seluruh item berhasil disimpan dan stok berkurang, atau tidak ada perubahan sama sekali |
| BR-03 | Harga pada transaksi dibekukan (`hargaSaat`) saat transaksi dibuat; perubahan harga produk tidak mengubah transaksi lampau |
| BR-04 | Produk yang di-soft-delete tidak muncul di katalog kasir, tetapi tetap muncul di laporan historis |
| BR-05 | Total transaksi dihitung ulang di server dari harga produk di basis data; total kiriman frontend hanya untuk tampilan |
| BR-06 | Produk berstok 0 tidak dapat dimasukkan ke transaksi |
| BR-07 | Peringatan stok aktif bila `stok ≤ stokMinimum`; bila `stokMinimum` tidak diisi, dipakai `stokMinimumDefault` dari pengaturan (default 5) |
| BR-08 | Satu email hanya boleh dimiliki satu akun pengguna |
| BR-09 | Akun pemilik tidak dapat menghapus dirinya sendiri, dan sistem harus selalu memiliki minimal satu akun pemilik aktif |
| BR-10 | Kasir hanya dapat membaca transaksi dengan `kasirId` miliknya sendiri (dipaksakan di server) |
| BR-11 | Nominal pembayaran tunai tidak boleh kurang dari total transaksi |
| BR-12 | Untuk pembayaran QRIS, stok baru berkurang setelah status pembayaran `berhasil` |
| BR-13 | Seluruh perhitungan tanggal laporan memakai zona waktu Asia/Jakarta (UTC+7) |

### 7.2 Aturan Validasi per Field

Validasi wajib diterapkan **di frontend** (umpan balik cepat) **dan di backend** (sumber kebenaran).

**Login & Pengguna**

| Field | Aturan | Pesan Galat |
|---|---|---|
| `email` | Wajib, format email valid, maksimal 100 karakter, unik | "Format email tidak valid" / "Email sudah terdaftar" |
| `password` | Wajib, minimal 8 karakter, mengandung huruf dan angka | "Kata sandi minimal 8 karakter dan mengandung huruf serta angka" |
| `nama` | Wajib, 3–60 karakter | "Nama minimal 3 karakter" |
| `role` | Wajib, salah satu dari `pemilik` \| `kasir` | "Peran tidak valid" |

**Produk**

| Field | Aturan | Pesan Galat |
|---|---|---|
| `nama` | Wajib, 2–100 karakter, unik di antara produk aktif | "Nama produk sudah terdaftar" |
| `kategori` | Wajib, dipilih dari daftar atau diisi bebas maksimal 40 karakter | "Kategori wajib diisi" |
| `harga` | Wajib, angka bulat ≥ 0, maksimal 100.000.000 | "Harga tidak boleh negatif" |
| `stok` | Wajib, angka bulat ≥ 0 | "Stok tidak boleh negatif" |
| `stokMinimum` | Opsional, angka bulat ≥ 0, ≤ 10.000 | "Stok minimum tidak valid" |
| `satuan` | Opsional, mis. `pcs`, `kg`, `liter`, `renceng` | — |
| `barcode` | Opsional, 8–20 karakter alfanumerik, unik bila diisi | "Barcode sudah dipakai produk lain" |

**Transaksi**

| Field | Aturan | Pesan Galat |
|---|---|---|
| `items` | Wajib, array minimal 1 item | "Keranjang masih kosong" |
| `items[].productId` | Wajib, ObjectId valid dan produk harus aktif | "Produk tidak ditemukan" |
| `items[].qty` | Wajib, bilangan bulat ≥ 1 dan ≤ stok tersedia | "Kuantitas melebihi stok (tersisa X)" |
| `metodeBayar` | Wajib, `tunai` \| `qris` | "Metode bayar tidak valid" |
| `nominalBayar` | Wajib bila `tunai`, ≥ `total` | "Nominal pembayaran kurang dari total" |

**Laporan**

| Field | Aturan | Pesan Galat |
|---|---|---|
| `tanggalMulai` / `tanggalAkhir` | Format `YYYY-MM-DD`, `tanggalMulai ≤ tanggalAkhir`, rentang maksimal 365 hari | "Rentang tanggal tidak valid" |

---

## 8. Kebutuhan Non-Fungsional (Terukur)

| Kode | Kategori | Kebutuhan Terukur | Cara Uji |
|---|---|---|---|
| NFR-01 | Keamanan — Kata sandi | Hash bcrypt dengan salt rounds ≥ 10; field `password` tidak pernah ada di respons API mana pun | Inspeksi dokumen MongoDB + cek respons Postman |
| NFR-02 | Keamanan — API | Semua endpoint kecuali `/api/auth/login` menolak permintaan tanpa token valid (401) dan tanpa peran sesuai (403) | Uji 8 skenario negatif (Bagian 15.3) |
| NFR-03 | Keamanan — Perlindungan tambahan | Menggunakan `helmet`, CORS terbatas pada domain frontend, rate limit 100 permintaan/15 menit per IP pada rute autentikasi | Cek header respons + uji beban ringan |
| NFR-04 | Keamanan — Rahasia | Tidak ada kredensial/kunci API di dalam repositori; semua melalui variabel lingkungan (`.env` masuk `.gitignore`) | Telusuri riwayat Git |
| NFR-05 | Responsivitas tampilan | Berfungsi baik pada lebar 360 px (HP), 768 px (tablet), dan 1280 px (desktop); tidak ada scroll horizontal | Uji manual pada 3 breakpoint |
| NFR-06 | Performa — Laporan | Endpoint laporan merespons < 500 ms pada data 1.000 transaksi (dengan cache aktif < 100 ms) | Ukur di Postman dengan data seed |
| NFR-07 | Performa — Kasir | Pencarian produk menampilkan hasil < 300 ms; halaman kasir interaktif < 2 detik pada koneksi 4G | Ukur via DevTools |
| NFR-08 | Ketersediaan | Frontend di Vercel, backend di Render/Railway, basis data di MongoDB Atlas; ketiganya dapat diakses publik saat demo | URL live disertakan pada pengumpulan |
| NFR-09 | Keandalan data | 0 transaksi tersimpan tanpa pengurangan stok yang sesuai; diverifikasi lewat skrip rekonsiliasi | Bagian 15.4 |
| NFR-10 | Kegunaan | Transaksi 3 item dapat diselesaikan dalam ≤ 5 interaksi (ketukan) dan ≤ 30 detik oleh pengguna baru | Uji dengan 2 orang di luar tim |
| NFR-11 | Interaktivitas | Setiap aksi asinkron memiliki 4 status visual: idle, memuat (skeleton/spinner), sukses (toast), galat (pesan spesifik) | Ceklis per halaman |
| NFR-12 | Aksesibilitas dasar | Kontras teks ≥ 4.5:1; seluruh input memiliki `label`; navigasi utama dapat dijangkau dengan keyboard | Cek Lighthouse |
| NFR-13 | Keterpeliharaan kode | Struktur folder & penamaan konsisten (Bagian 13–14); tidak ada berkas komponen > 300 baris; logika API terpisah dari komponen tampilan | Tinjauan kode saat pull request |
| NFR-14 | Kompatibilitas | Berjalan pada Chrome, Edge, dan Safari versi mutakhir | Uji manual |

---

## 9. Arsitektur Sistem & Tech Stack

### 9.1 Diagram Arsitektur

```
┌──────────────────────────────┐
│         PENGGUNA             │
│  Pemilik (laptop/HP)         │
│  Kasir (tablet/HP)           │
└──────────────┬───────────────┘
               │ HTTPS
               ▼
┌──────────────────────────────┐
│   FRONTEND — React + Vite    │      Deploy: Vercel
│  • React Router (routing)    │
│  • KonteksAuth (JWT state)   │
│  • React Query (cache HTTP)  │
│  • Tailwind CSS (styling)    │
│  • Axios interceptor         │──── Menyisipkan header
└──────────────┬───────────────┘     Authorization: Bearer <JWT>
               │ REST API (JSON)
               ▼
┌──────────────────────────────────────────────────────┐
│            BACKEND — Express.js                      │   Deploy: Render/Railway
│                                                      │
│  Rute ──▶ middleware autentikasi ──▶ middleware      │
│                 (verifikasi JWT)      otorisasi      │
│                                       (cek peran)    │
│            │                                         │
│            ▼                                         │
│      Pengendali (controller) ──▶ Model (Mongoose)    │
│            │                                         │
│            ├──▶ Cache laporan (node-cache, TTL 60s)  │
│            └──▶ Midtrans SDK (QRIS, opsional)        │
└──────────────┬───────────────────────────────────────┘
               │ Mongoose ODM
               ▼
┌──────────────────────────────┐
│    MongoDB Atlas             │
│  users · products            │
│  transactions · mutasiStok   │
│  settings                    │
└──────────────────────────────┘
```

### 9.2 Tech Stack & Justifikasi

| Komponen | Teknologi | Alasan Pemilihan |
|---|---|---|
| Backend Framework | **Express.js** | Wajib sesuai ketentuan; ringan dan cocok untuk REST API |
| Basis Data | **MongoDB Atlas + Mongoose** | Wajib sesuai ketentuan; skema fleksibel dan Aggregation Pipeline kuat untuk laporan |
| Frontend Framework | **React 18 + Vite** | Wajib sesuai ketentuan; Vite mempercepat *dev server* dan *build* |
| Routing | **React Router v6** | Mendukung rute terproteksi berbasis peran |
| Pengambilan data | **Axios + React Query (TanStack Query)** | React Query menangani status memuat/galat/cache secara konsisten — langsung mendukung rubrik interaktivitas |
| Validasi form | **React Hook Form + Zod** | Validasi deklaratif; skema Zod dapat dipakai ulang di backend |
| Styling | **Tailwind CSS** | Konsistensi desain cepat; utilitas responsif bawaan |
| Ikon | **Lucide React** | Ringan dan konsisten |
| Autentikasi | **jsonwebtoken + bcryptjs** | Standar industri; memenuhi rubrik penyandian kata sandi |
| Keamanan API | **helmet, cors, express-rate-limit** | Memenuhi rubrik perlindungan API |
| Validasi backend | **express-validator** atau **Zod** | Menolak masukan tidak valid sebelum menyentuh basis data |
| Cache | **node-cache** | Nilai tambah G6 #4; tanpa infrastruktur tambahan (berbeda dari Redis) |
| Ekspor laporan | **ExcelJS** (Excel) & **PDFKit** (PDF) | Tidak butuh layanan eksternal |
| Payment Gateway | **Midtrans Snap/Core (sandbox)** | Nilai tambah G6 #3; mendukung QRIS dan populer di Indonesia |
| Pemindaian barcode | **html5-qrcode** | Berjalan di peramban tanpa perangkat khusus |
| Grafik | **Recharts** | Integrasi React sederhana untuk tren omzet |
| Notifikasi | **react-hot-toast** | Umpan balik visual sukses/galat |
| Pengujian API | **Postman Collection** | Bukti pengujian yang dapat dilampirkan |
| Deployment | **Vercel** (frontend), **Render/Railway** (backend) | Memenuhi nilai tambah G6 #5 |
| Kontrol versi | **Git + GitHub** | Bukti kontribusi & alur pengembangan |

---

## 10. Skema Basis Data

### 10.1 Diagram Relasi

```
┌────────────────┐          ┌──────────────────────┐
│    users       │          │      products        │
│────────────────│          │──────────────────────│
│ _id            │          │ _id                  │
│ nama           │          │ nama (unik/aktif)    │
│ email (unik)   │          │ kategori             │
│ password(hash) │          │ harga                │
│ role           │          │ stok                 │
│ isAktif        │          │ stokMinimum          │
└───────┬────────┘          │ satuan, barcode      │
        │                   │ isAktif              │
        │ kasirId           └──────────┬───────────┘
        │                              │ productId
        ▼                              │
┌───────────────────────────────────────▼──────────┐
│                 transactions                     │
│──────────────────────────────────────────────────│
│ _id, nomorTransaksi (unik)                       │
│ kasirId ──────▶ users._id                        │
│ items[] { productId, nama, hargaSaat, qty,       │
│           subtotal }                             │
│ total, metodeBayar, statusBayar                  │
│ nominalBayar, kembalian, createdAt               │
└──────────────────────┬───────────────────────────┘
                       │ refId (bila mutasi dari penjualan)
                       ▼
        ┌──────────────────────────────────┐        ┌─────────────────────┐
        │          mutasiStok              │        │      settings       │
        │──────────────────────────────────│        │─────────────────────│
        │ productId ──▶ products._id       │        │ namaToko            │
        │ tipe: masuk|keluar|koreksi       │        │ alamat              │
        │ jumlah, stokSebelum, stokSesudah │        │ stokMinimumDefault  │
        │ alasan, refId, userId, createdAt │        │ mataUang            │
        └──────────────────────────────────┘        └─────────────────────┘
```

### 10.2 Koleksi `users`

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `_id` | ObjectId | otomatis | Kunci primer |
| `nama` | String | ✔ | 3–60 karakter |
| `email` | String | ✔ | Unik, lowercase, terindeks |
| `password` | String | ✔ | Hash bcrypt; `select: false` agar tidak ikut terbaca secara default |
| `role` | String | ✔ | Enum: `pemilik` \| `kasir` |
| `isAktif` | Boolean | ✔ | Default `true`; `false` = tidak dapat login |
| `createdAt` / `updatedAt` | Date | otomatis | `timestamps: true` |

**Indeks:** `{ email: 1 }` unik.

### 10.3 Koleksi `products`

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `_id` | ObjectId | otomatis | |
| `nama` | String | ✔ | 2–100 karakter, terindeks untuk pencarian |
| `kategori` | String | ✔ | mis. Makanan, Minuman, Sembako, Rumah Tangga |
| `harga` | Number | ✔ | ≥ 0, bilangan bulat (Rupiah) |
| `stok` | Number | ✔ | ≥ 0, default 0 |
| `stokMinimum` | Number | ✖ | Default mengikuti `settings.stokMinimumDefault` |
| `satuan` | String | ✖ | Default `pcs` |
| `barcode` | String | ✖ | Unik bila diisi (*sparse index*) |
| `isAktif` | Boolean | ✔ | Default `true`; `false` = terhapus (soft delete) |
| `createdAt` / `updatedAt` | Date | otomatis | |

**Indeks:** `{ nama: "text" }` untuk pencarian; `{ kategori: 1, isAktif: 1 }`; `{ barcode: 1 }` unik & sparse.

**Field virtual:** `statusStok` → `habis` bila `stok = 0`, `menipis` bila `stok ≤ stokMinimum`, selain itu `aman`.

### 10.4 Koleksi `transactions`

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `_id` | ObjectId | otomatis | |
| `nomorTransaksi` | String | ✔ | Unik, format `TRX-YYYYMMDD-0001` |
| `kasirId` | ObjectId (ref `users`) | ✔ | Terindeks |
| `namaKasir` | String | ✔ | Snapshot nama agar laporan tetap terbaca bila akun dihapus |
| `items` | Array of Object | ✔ | Minimal 1 item |
| `items[].productId` | ObjectId (ref `products`) | ✔ | |
| `items[].nama` | String | ✔ | Snapshot nama produk |
| `items[].hargaSaat` | Number | ✔ | Snapshot harga saat transaksi (BR-03) |
| `items[].qty` | Number | ✔ | ≥ 1 |
| `items[].subtotal` | Number | ✔ | `hargaSaat × qty`, dihitung di server |
| `total` | Number | ✔ | Jumlah seluruh subtotal, dihitung di server |
| `metodeBayar` | String | ✔ | Enum: `tunai` \| `qris` |
| `statusBayar` | String | ✔ | Enum: `berhasil` \| `menunggu` \| `gagal` \| `dibatalkan`; `tunai` langsung `berhasil` |
| `nominalBayar` | Number | ✖ | Untuk tunai |
| `kembalian` | Number | ✖ | `nominalBayar − total` |
| `midtransOrderId` | String | ✖ | Untuk pelacakan QRIS |
| `createdAt` | Date | otomatis | Terindeks untuk laporan |

**Indeks:** `{ createdAt: -1 }`; `{ kasirId: 1, createdAt: -1 }`; `{ nomorTransaksi: 1 }` unik.

### 10.5 Koleksi `mutasiStok` *(baru di v2.0)*

Koleksi ini adalah jawaban langsung terhadap masalah inti "stok tidak sesuai rak": setiap perubahan stok terekam sehingga selisih dapat ditelusuri.

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `productId` | ObjectId (ref `products`) | ✔ | Terindeks |
| `namaProduk` | String | ✔ | Snapshot |
| `tipe` | String | ✔ | Enum: `masuk` \| `keluar` \| `koreksi` |
| `jumlah` | Number | ✔ | Selalu positif; arah ditentukan `tipe` |
| `stokSebelum` | Number | ✔ | |
| `stokSesudah` | Number | ✔ | |
| `alasan` | String | ✖ | `penjualan`, `rusak`, `hilang`, `kedaluwarsa`, `salah input`, `stok masuk`, `lain-lain` |
| `refId` | ObjectId | ✖ | Referensi transaksi bila tipe `keluar` karena penjualan |
| `userId` | ObjectId (ref `users`) | ✔ | Pelaku perubahan |
| `createdAt` | Date | otomatis | |

**Indeks:** `{ productId: 1, createdAt: -1 }`.

### 10.6 Koleksi `settings`

Dokumen tunggal (*singleton*).

| Field | Tipe | Keterangan |
|---|---|---|
| `namaToko` | String | Default "Toko Kelontong Berkah" |
| `alamat` | String | Untuk dicetak di struk |
| `stokMinimumDefault` | Number | Default 5 |
| `mataUang` | String | Default `IDR` |

---

## 11. Kontrak API

### 11.1 Ketentuan Umum

- **Base URL:** `https://laris-api.onrender.com/api` (produksi) · `http://localhost:5000/api` (lokal)
- **Format:** JSON, `Content-Type: application/json`
- **Autentikasi:** header `Authorization: Bearer <JWT>`
- **Zona waktu:** seluruh tanggal disimpan UTC, ditampilkan Asia/Jakarta

### 11.2 Format Respons Standar

Konsistensi ini memudahkan frontend menangani semua respons dengan satu utilitas.

**Sukses**
```json
{
  "sukses": true,
  "pesan": "Produk berhasil ditambahkan",
  "data": { "...": "..." },
  "meta": { "halaman": 1, "perHalaman": 20, "total": 137 }
}
```

**Gagal**
```json
{
  "sukses": false,
  "pesan": "Validasi gagal",
  "kodeGalat": "VALIDASI_GAGAL",
  "galat": [
    { "field": "harga", "pesan": "Harga tidak boleh negatif" }
  ]
}
```

### 11.3 Kode Status & Kode Galat

| HTTP | `kodeGalat` | Kapan terjadi |
|---|---|---|
| 200 | — | Permintaan berhasil |
| 201 | — | Sumber daya berhasil dibuat |
| 400 | `VALIDASI_GAGAL` | Masukan tidak memenuhi aturan validasi |
| 400 | `STOK_TIDAK_CUKUP` | Kuantitas melebihi stok tersedia |
| 401 | `TIDAK_TERAUTENTIKASI` | Token tidak ada, tidak valid, atau kedaluwarsa |
| 401 | `KREDENSIAL_SALAH` | Email atau kata sandi salah |
| 403 | `AKSES_DITOLAK` | Peran pengguna tidak berwenang |
| 404 | `TIDAK_DITEMUKAN` | Sumber daya tidak ada |
| 409 | `DATA_DUPLIKAT` | Email atau nama produk sudah terdaftar |
| 422 | `PEMBAYARAN_GAGAL` | Payment gateway menolak/kedaluwarsa |
| 429 | `TERLALU_BANYAK_PERMINTAAN` | Melewati rate limit |
| 500 | `GALAT_SERVER` | Kesalahan tak terduga di server |

### 11.4 Daftar Endpoint

**Autentikasi**

| Method | Endpoint | Deskripsi | Akses |
|---|---|---|---|
| POST | `/auth/login` | Login, mengembalikan JWT & data pengguna | Publik |
| GET | `/auth/profil` | Profil pengguna yang sedang login | Login |
| POST | `/auth/logout` | Invalidasi sisi klien (opsional blacklist) | Login |

**Pengguna**

| Method | Endpoint | Deskripsi | Akses |
|---|---|---|---|
| POST | `/users` | Membuat akun kasir baru | Pemilik |
| GET | `/users` | Daftar akun (filter `?role=kasir`) | Pemilik |
| PATCH | `/users/:id` | Mengubah nama / status aktif | Pemilik |
| DELETE | `/users/:id` | Menonaktifkan akun kasir | Pemilik |

**Produk**

| Method | Endpoint | Deskripsi | Akses |
|---|---|---|---|
| GET | `/produk` | Daftar produk. Query: `?cari=`, `?kategori=`, `?halaman=`, `?perHalaman=`, `?statusStok=` | Pemilik & Kasir |
| GET | `/produk/:id` | Detail satu produk | Pemilik & Kasir |
| GET | `/produk/barcode/:kode` | Cari produk berdasarkan barcode | Pemilik & Kasir |
| POST | `/produk` | Menambah produk | Pemilik |
| PUT | `/produk/:id` | Mengubah data produk | Pemilik |
| DELETE | `/produk/:id` | Soft delete produk | Pemilik |
| GET | `/produk/stok-menipis` | Produk dengan `stok ≤ stokMinimum` | Pemilik |
| POST | `/produk/:id/opname` | Koreksi stok dengan alasan | Pemilik |
| GET | `/produk/:id/mutasi` | Riwayat mutasi stok produk | Pemilik |

**Transaksi**

| Method | Endpoint | Deskripsi | Akses |
|---|---|---|---|
| POST | `/transaksi` | Membuat transaksi baru (stok berkurang otomatis) | Kasir & Pemilik |
| GET | `/transaksi` | Riwayat transaksi. Query: `?tanggalMulai=`, `?tanggalAkhir=`, `?halaman=` | Pemilik: semua · Kasir: miliknya sendiri |
| GET | `/transaksi/:id` | Detail transaksi | Pemilik · Kasir (miliknya) |
| POST | `/transaksi/:id/bayar-qris` | Membuat sesi pembayaran QRIS | Kasir & Pemilik |
| POST | `/transaksi/webhook-midtrans` | Notifikasi status pembayaran dari Midtrans | Publik (terverifikasi tanda tangan) |

**Laporan**

| Method | Endpoint | Deskripsi | Akses |
|---|---|---|---|
| GET | `/laporan/ringkasan` | Kartu ringkasan dashboard (omzet hari ini, jumlah transaksi, produk menipis) | Pemilik |
| GET | `/laporan/omzet-harian` | Omzet per hari dalam rentang tanggal | Pemilik |
| GET | `/laporan/produk-terlaris` | Produk terlaris. Query: `?limit=10` | Pemilik |
| GET | `/laporan/ekspor` | Ekspor laporan. Query: `?format=xlsx\|pdf` | Pemilik |

**Pengaturan**

| Method | Endpoint | Deskripsi | Akses |
|---|---|---|---|
| GET | `/pengaturan` | Membaca pengaturan toko | Login |
| PUT | `/pengaturan` | Mengubah pengaturan toko | Pemilik |

### 11.5 Catatan Implementasi Penting

**Atomisitas transaksi (BR-02).** Membuat transaksi menyentuh dua koleksi (`transactions` dan `products`). Dua pendekatan yang disetujui:

1. **MongoDB Transaction (disarankan)** — MongoDB Atlas mendukung *replica set*, sehingga `session.startTransaction()` dapat dipakai. Jika salah satu langkah gagal, seluruh perubahan dibatalkan.
2. **Pengurangan stok bersyarat** — gunakan `findOneAndUpdate({ _id, stok: { $gte: qty } }, { $inc: { stok: -qty } })`. Bila mengembalikan `null`, stok tidak cukup; produk yang sudah dikurangi harus dikembalikan (kompensasi).

Pendekatan yang dipilih **wajib** dijelaskan saat presentasi karena inilah inti penyelesaian masalah "selisih stok".

**Strategi cache laporan (FR-21).**
- Kunci cache: `laporan:<jenis>:<tanggalMulai>:<tanggalAkhir>`
- TTL: 60 detik
- Invalidasi: seluruh kunci berawalan `laporan:` dihapus setiap kali transaksi baru berhasil dibuat atau stok opname dilakukan
- Bukti untuk rubrik: catat dan tampilkan waktu respons sebelum vs sesudah cache saat presentasi

---

## 12. Rancangan Antarmuka & Alur Pengguna

### 12.1 Desain Sistem Visual

| Elemen | Ketentuan |
|---|---|
| Warna primer | Hijau zamrud `#059669` — asosiasi kesegaran & perdagangan |
| Warna sekunder | Slate `#0F172A` untuk teks, `#F8FAFC` untuk latar |
| Warna status | Sukses `#16A34A` · Peringatan `#F59E0B` (stok menipis) · Galat `#DC2626` (habis) · Info `#0284C7` |
| Tipografi | `Inter` (antarmuka) dan `Inter Tight`/tabular-nums untuk angka nominal |
| Skala teks | 12 / 14 / 16 / 20 / 24 / 32 px |
| Radius sudut | 8 px (komponen), 12 px (kartu) |
| Spasi | Kelipatan 4 px |
| Ukuran target ketukan | Minimal 44 × 44 px pada halaman kasir |
| Breakpoint | `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 |

### 12.2 Daftar Halaman

| Halaman | Rute | Akses | Isi Utama |
|---|---|---|---|
| Login | `/masuk` | Publik | Form email & kata sandi, logo, pesan galat |
| Dashboard | `/` | Pemilik | 4 kartu ringkasan, grafik tren 7 hari, tabel produk terlaris, daftar stok menipis |
| Kasir | `/kasir` | Pemilik & Kasir | Kolom pencarian + grid produk (kiri), keranjang + total + pembayaran (kanan/bawah) |
| Manajemen Produk | `/produk` | Pemilik | Tabel produk, pencarian, filter kategori, tombol tambah, modal form, badge stok |
| Stok Opname | `/produk/opname` | Pemilik | Daftar produk + input stok fisik + selisih + alasan |
| Riwayat Transaksi | `/transaksi` | Pemilik & Kasir | Tabel transaksi + filter tanggal + modal detail |
| Laporan | `/laporan` | Pemilik | Filter rentang tanggal, tabel omzet harian, produk terlaris, tombol ekspor |
| Manajemen Kasir | `/pengguna` | Pemilik | Daftar akun kasir, form tambah, aksi nonaktifkan |
| Pengaturan | `/pengaturan` | Pemilik | Nama toko, alamat, stok minimum default |
| Akses Ditolak | `/akses-ditolak` | Semua | Pesan 403 + tombol kembali |
| Tidak Ditemukan | `*` | Semua | Halaman 404 |

### 12.3 Alur Utama — Transaksi Penjualan

```
1. Kasir login                    → JWT tersimpan, diarahkan ke /kasir
2. Kasir mengetik "indomie"       → daftar tersaring (debounce 300 ms)
3. Kasir menekan kartu produk     → item masuk keranjang, qty 1
4. Kasir mengubah qty menjadi 3   → subtotal & total diperbarui seketika
   └─ bila qty > stok             → input ditolak + pesan "tersisa X"
5. Kasir memilih metode bayar     → tunai: input nominal & kembalian
                                  → QRIS: tampilkan kode QR
6. Kasir menekan "Simpan"         → tombol memuat, keranjang terkunci
7. Server memvalidasi & menyimpan → stok berkurang, mutasiStok tercatat
8. Sukses                         → toast "TRX-20260509-0007 · Rp 45.000"
   Gagal (stok berubah)           → pesan galat spesifik, keranjang tetap utuh
9. Keranjang dikosongkan          → siap untuk pelanggan berikutnya
```

### 12.4 Ketentuan Status Antarmuka (mendukung NFR-11)

Setiap halaman yang mengambil data **wajib** menangani empat status:

| Status | Perlakuan Visual |
|---|---|
| Memuat | *Skeleton* untuk tabel/kartu; spinner untuk tombol |
| Kosong | Ilustrasi/ikon + pesan ramah + ajakan aksi (mis. "Belum ada produk — Tambah Produk") |
| Galat | Pesan spesifik penyebab + tombol "Coba lagi" |
| Sukses | Toast singkat; data di layar diperbarui tanpa memuat ulang halaman |

Tambahan: efek *hover* pada semua elemen dapat ditekan, status `disabled` yang jelas, dan dialog konfirmasi untuk semua aksi destruktif.

### 12.5 Komponen yang Dapat Dipakai Ulang (mendukung rubrik Frontend Best Practices)

| Komponen | Dipakai di |
|---|---|
| `Tombol` (varian: primer, sekunder, bahaya; status memuat) | Semua halaman |
| `KolomInput`, `KolomPilih`, `KolomAngka` (dengan label & pesan galat) | Semua form |
| `Modal` | Form produk, detail transaksi, konfirmasi |
| `Tabel` (dengan slot kolom, status kosong, paginasi) | Produk, transaksi, laporan |
| `KartuStatistik` | Dashboard |
| `BadgeStok` | Produk, kasir, dashboard |
| `Skeleton` | Semua halaman pengambilan data |
| `RuteTerproteksi` (pembungkus berbasis peran) | Konfigurasi routing |
| `formatRupiah`, `formatTanggal` (utilitas) | Semua halaman |

---

## 13. Struktur Folder Proyek

Nama folder/berkas memakai Bahasa Indonesia, kecuali istilah teknis yang sudah baku dalam ekosistem JavaScript (`middleware`, `node_modules`, `package.json`, `App.jsx`, dan sebagainya).

### 13.1 Backend (Express.js)

```
backend/
├── src/
│   ├── konfigurasi/
│   │   ├── koneksiDatabase.js        # koneksi MongoDB Atlas
│   │   ├── cache.js                  # inisialisasi node-cache
│   │   └── midtrans.js               # konfigurasi payment gateway
│   ├── model/
│   │   ├── User.js
│   │   ├── Produk.js
│   │   ├── Transaksi.js
│   │   ├── MutasiStok.js
│   │   └── Pengaturan.js
│   ├── pengendali/                   # controllers — logika per modul
│   │   ├── authPengendali.js
│   │   ├── penggunaPengendali.js
│   │   ├── produkPengendali.js
│   │   ├── transaksiPengendali.js
│   │   ├── laporanPengendali.js
│   │   └── pengaturanPengendali.js
│   ├── layanan/                      # services — logika bisnis murni
│   │   ├── layananStok.js            # pengurangan stok & pencatatan mutasi
│   │   ├── layananLaporan.js         # aggregation pipeline
│   │   └── layananEkspor.js          # ExcelJS / PDFKit
│   ├── rute/
│   │   ├── index.js                  # penggabung seluruh rute
│   │   ├── authRute.js
│   │   ├── penggunaRute.js
│   │   ├── produkRute.js
│   │   ├── transaksiRute.js
│   │   ├── laporanRute.js
│   │   └── pengaturanRute.js
│   ├── middleware/
│   │   ├── autentikasi.js            # verifikasi JWT
│   │   ├── otorisasi.js              # cek peran: otorisasi('pemilik')
│   │   ├── validasi.js               # penjalan aturan express-validator
│   │   └── penangananGalat.js        # error handler terpusat
│   ├── validator/
│   │   ├── authValidator.js
│   │   ├── produkValidator.js
│   │   └── transaksiValidator.js
│   ├── utilitas/
│   │   ├── hashKataSandi.js
│   │   ├── buatToken.js
│   │   ├── formatResponsApi.js       # sukses() & gagal()
│   │   ├── nomorTransaksi.js
│   │   └── zonaWaktu.js              # helper Asia/Jakarta
│   ├── seed/
│   │   └── dataAwal.js               # akun pemilik + 30 produk contoh
│   └── app.js                        # konfigurasi Express (helmet, cors, rute)
├── docs/
│   └── LARIS.postman_collection.json
├── .env.example
├── .gitignore
├── package.json
└── server.js                         # titik masuk, menjalankan app
```

### 13.2 Frontend (React + Vite)

```
frontend/
├── src/
│   ├── komponen/
│   │   ├── umum/                     # Tombol, Modal, Tabel, Skeleton, Toast,
│   │   │                             # KolomInput, BadgeStok, KartuStatistik
│   │   ├── tataletak/                # Sidebar, Navbar, TataLetakUtama
│   │   ├── produk/                   # TabelProduk, FormProduk, FilterProduk
│   │   ├── kasir/                    # GridProduk, PencarianProduk, Keranjang,
│   │   │                             # RingkasanTotal, DialogPembayaran
│   │   ├── laporan/                  # KartuRingkasan, GrafikOmzet, TabelTerlaris
│   │   └── pengguna/                 # TabelKasir, FormKasir
│   ├── halaman/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Kasir.jsx
│   │   ├── ManajemenProduk.jsx
│   │   ├── StokOpname.jsx
│   │   ├── RiwayatTransaksi.jsx
│   │   ├── Laporan.jsx
│   │   ├── ManajemenKasir.jsx
│   │   ├── Pengaturan.jsx
│   │   ├── AksesDitolak.jsx
│   │   └── TidakDitemukan.jsx
│   ├── layanan/                      # services — pemanggilan API
│   │   ├── klienApi.js               # instance Axios + interceptor token
│   │   ├── apiAuth.js
│   │   ├── apiProduk.js
│   │   ├── apiTransaksi.js
│   │   ├── apiLaporan.js
│   │   └── apiPengguna.js
│   ├── konteks/
│   │   └── KonteksAuth.jsx           # menyimpan pengguna & token
│   ├── hook/                         # custom hooks — logika terpisah dari tampilan
│   │   ├── gunakanAuth.js
│   │   ├── gunakanProduk.js          # React Query: query & mutation produk
│   │   ├── gunakanKeranjang.js       # logika keranjang kasir
│   │   ├── gunakanTransaksi.js
│   │   ├── gunakanLaporan.js
│   │   └── gunakanDebounce.js
│   ├── rute/
│   │   ├── RuteAplikasi.jsx
│   │   └── RuteTerproteksi.jsx       # penjaga rute berbasis peran
│   ├── skema/                        # skema validasi Zod
│   │   ├── skemaProduk.js
│   │   └── skemaLogin.js
│   ├── utilitas/
│   │   ├── formatRupiah.js
│   │   ├── formatTanggal.js
│   │   └── konstanta.js              # kategori, metode bayar, alasan opname
│   ├── aset/
│   ├── App.jsx
│   └── main.jsx
├── .env.example                      # VITE_API_URL
├── tailwind.config.js
├── package.json
└── vite.config.js
```

### 13.3 Struktur Repositori

```
laris/
├── backend/
├── frontend/
├── dokumen/
│   ├── PRD-LARIS-v2.md
│   ├── API-Reference.md
│   ├── laporan-pengujian.md
│   └── pembagian-tugas.md
└── README.md          # cara menjalankan, URL live, daftar anggota & kontribusi
```

---

## 14. Standar Kode & Alur Kerja Git

Bagian ini secara langsung menopang rubrik **Kontribusi (30%)** dan **Alur pengembangan (10%)**, yang keduanya dinilai dari jejak pengerjaan di repositori.

### 14.1 Struktur Branch

```
main   ──── hanya kode stabil & ter-deploy; merge hanya dari dev
  │
dev    ──── integrasi harian seluruh anggota
  │
  ├── fitur/auth-login          (Anggota A)
  ├── fitur/produk-crud         (Anggota B)
  ├── fitur/transaksi-kasir     (Anggota C)
  └── fitur/laporan-dashboard   (Anggota D)
```

### 14.2 Konvensi Nama Branch & Commit

| Jenis | Format | Contoh |
|---|---|---|
| Branch fitur | `fitur/<modul>-<ringkas>` | `fitur/produk-crud` |
| Branch perbaikan | `perbaikan/<ringkas>` | `perbaikan/validasi-stok-negatif` |
| Commit | `<tipe>(<lingkup>): <deskripsi>` | `feat(produk): tambah endpoint POST /api/produk` |

Tipe commit yang dipakai: `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`.

### 14.3 Aturan Kerja Tim

1. Setiap fitur dikerjakan di branch sendiri, lalu di-merge ke `dev` melalui **Pull Request**.
2. Setiap PR wajib ditinjau (*review*) oleh minimal satu anggota lain sebelum merge — ini menghasilkan jejak kolaborasi.
3. **Target minimal 3 commit bermakna per anggota per minggu** (bukan satu commit besar di akhir), agar rubrik "pengerjaan bertahap" terbukti.
4. Deskripsi PR menyebut ID kebutuhan yang diselesaikan (mis. "Menyelesaikan FR-06, FR-07").
5. `main` di-merge setiap akhir minggu sebagai *milestone* (tag `v0.1` s.d. `v1.0`).
6. `.env` **tidak pernah** di-commit; hanya `.env.example`.

### 14.4 Konvensi Penamaan Kode

| Objek | Konvensi | Contoh |
|---|---|---|
| Komponen React | PascalCase | `TabelProduk.jsx` |
| Hook | camelCase, awalan `gunakan` | `gunakanProduk.js` |
| Fungsi & variabel | camelCase | `hitungTotalTransaksi` |
| Konstanta | UPPER_SNAKE_CASE | `KATEGORI_PRODUK` |
| Model Mongoose | PascalCase tunggal | `Produk.js` |
| Field basis data | camelCase Bahasa Indonesia | `stokMinimum` |
| Endpoint | kebab-case Bahasa Indonesia | `/api/produk/stok-menipis` |

### 14.5 Aturan Pemisahan Logika (rubrik Frontend Best Practices)

- Komponen halaman **tidak** memanggil Axios secara langsung; pemanggilan API selalu melalui `src/layanan/` dan dibungkus custom hook di `src/hook/`.
- Komponen tampilan tidak menyimpan logika bisnis (mis. perhitungan total) — logika ditempatkan di hook atau utilitas.
- Tidak ada nilai ajaib (*magic value*) tersebar; semua daftar tetap berada di `utilitas/konstanta.js`.
- Berkas komponen dijaga di bawah 300 baris; bila melebihi, dipecah menjadi subkomponen.

---

## 15. Strategi Pengujian

### 15.1 Cakupan Pengujian

| Jenis | Alat | Cakupan |
|---|---|---|
| Uji manual API | Postman Collection | Seluruh endpoint, kasus positif & negatif |
| Uji otorisasi | Postman (token kasir vs pemilik) | Seluruh baris ❌ pada matriks Bagian 4.3 |
| Uji validasi form | Manual di peramban | Seluruh aturan Bagian 7.2 |
| Uji end-to-end | Manual mengikuti skenario 15.2 | Alur utama kasir & pemilik |
| Uji responsif | Chrome DevTools (360 / 768 / 1280 px) | Seluruh halaman |
| Uji rekonsiliasi stok | Skrip Node | Konsistensi stok (NFR-09) |

### 15.2 Skenario Uji End-to-End Wajib

| No | Skenario | Hasil yang Diharapkan |
|---|---|---|
| E2E-01 | Pemilik login → tambah 3 produk → lihat di katalog | 3 produk tampil dengan stok benar |
| E2E-02 | Pemilik buat akun kasir → logout → login sebagai kasir | Kasir masuk ke halaman Kasir, menu pemilik tidak tampil |
| E2E-03 | Kasir buat transaksi 2 produk × 3 qty → simpan | Stok kedua produk berkurang tepat 3; transaksi tercatat |
| E2E-04 | Kasir coba beli 100 unit dari produk berstok 5 | Ditolak dengan pesan "tersisa 5"; stok tidak berubah |
| E2E-05 | Kasir buka `/produk` langsung lewat URL | Diarahkan ke halaman Akses Ditolak |
| E2E-06 | Kirim `GET /api/laporan/omzet-harian` dengan token kasir via Postman | HTTP 403 `AKSES_DITOLAK` |
| E2E-07 | Kirim permintaan tanpa header Authorization | HTTP 401 `TIDAK_TERAUTENTIKASI` |
| E2E-08 | Turunkan stok produk hingga ≤ stokMinimum | Produk muncul di daftar stok menipis dengan badge kuning |
| E2E-09 | Pemilik ubah harga produk → lihat laporan periode lampau | Angka laporan lampau tidak berubah |
| E2E-10 | Pemilik hapus produk yang pernah terjual | Produk hilang dari katalog, tetap ada di laporan terlaris |
| E2E-11 | Buka laporan dua kali dalam 60 detik | Permintaan kedua jauh lebih cepat (cache aktif) |
| E2E-12 | Ekspor laporan rentang 1 bulan | Berkas `.xlsx` terunduh dengan data sesuai filter |
| E2E-13 | Matikan koneksi internet lalu simpan transaksi | Muncul pesan galat jaringan, keranjang tidak hilang |
| E2E-14 | Buka seluruh halaman pada lebar 360 px | Tidak ada scroll horizontal, semua tombol terjangkau |

### 15.3 Matriks Uji Otorisasi (bukti untuk FR-05 & rubrik Perlindungan API)

| Endpoint | Tanpa Token | Token Kasir | Token Pemilik |
|---|---|---|---|
| `POST /api/produk` | 401 | **403** | 201 |
| `PUT /api/produk/:id` | 401 | **403** | 200 |
| `DELETE /api/produk/:id` | 401 | **403** | 200 |
| `GET /api/produk/stok-menipis` | 401 | **403** | 200 |
| `GET /api/laporan/omzet-harian` | 401 | **403** | 200 |
| `GET /api/laporan/produk-terlaris` | 401 | **403** | 200 |
| `POST /api/users` | 401 | **403** | 201 |
| `DELETE /api/users/:id` | 401 | **403** | 200 |
| `GET /api/produk` | 401 | 200 | 200 |
| `POST /api/transaksi` | 401 | 201 | 201 |
| `GET /api/transaksi` | 401 | 200 (hanya milik sendiri) | 200 (semua) |

### 15.4 Uji Rekonsiliasi Stok

Skrip verifikasi yang dijalankan setelah rangkaian transaksi uji:

```
Untuk setiap produk:
  stokHarusnya = stokAwalSeed
                 - Σ(qty terjual pada transactions berstatus 'berhasil')
                 + Σ(mutasi 'masuk')
                 - Σ(mutasi 'keluar' non-penjualan)
                 ± Σ(koreksi opname)
  Assert: stokHarusnya == produk.stok
```

Hasil pengujian didokumentasikan pada `dokumen/laporan-pengujian.md` dan ditampilkan saat presentasi sebagai bukti pencapaian T-02.

---

## 16. Deployment & Konfigurasi Lingkungan

### 16.1 Variabel Lingkungan

**Backend (`.env`)**

| Variabel | Contoh | Keterangan |
|---|---|---|
| `PORT` | `5000` | Port server |
| `NODE_ENV` | `production` | Mode berjalan |
| `MONGO_URI` | `mongodb+srv://...` | Koneksi MongoDB Atlas |
| `JWT_SECRET` | *(acak, ≥ 32 karakter)* | Kunci penanda tangan token |
| `JWT_EXPIRES_IN` | `8h` | Masa berlaku token |
| `CORS_ORIGIN` | `https://laris.vercel.app` | Domain frontend yang diizinkan |
| `CACHE_TTL` | `60` | TTL cache laporan (detik) |
| `MIDTRANS_SERVER_KEY` | `SB-Mid-server-...` | Kunci server Midtrans sandbox |
| `MIDTRANS_CLIENT_KEY` | `SB-Mid-client-...` | Kunci klien Midtrans sandbox |

**Frontend (`.env`)**

| Variabel | Contoh |
|---|---|
| `VITE_API_URL` | `https://laris-api.onrender.com/api` |

### 16.2 Rencana Deployment

| Lapisan | Layanan | Catatan |
|---|---|---|
| Frontend | Vercel | Terhubung ke branch `main`; build otomatis |
| Backend | Render / Railway | Memenuhi nilai tambah G6 #5 (deployment selain Vercel); perlu diingat *cold start* pada paket gratis |
| Basis data | MongoDB Atlas (M0 gratis) | Batasi akses IP; buat pengguna basis data khusus |

### 16.3 Daftar Periksa Sebelum Demo

- [ ] URL frontend & backend dapat diakses publik
- [ ] Data seed tersedia: 1 akun pemilik, 2 akun kasir, ≥ 30 produk, ≥ 50 transaksi tersebar dalam 14 hari
- [ ] Akun demo tercantum di `README.md`
- [ ] Backend "dipanaskan" 5 menit sebelum presentasi (menghindari cold start)
- [ ] Postman Collection terekspor ke `dokumen/`
- [ ] Rencana cadangan: rekaman video demo bila jaringan bermasalah

---

## 17. Pembagian Tim & Tanggung Jawab

Rubrik **Kontribusi (30%)** dinilai per individu. Karena itu setiap anggota memiliki modul yang jelas beserta artefak yang dapat ditunjukkan.

### 17.1 Anggota A — Autentikasi, Otorisasi & Pengguna

| Aspek | Rincian |
|---|---|
| Backend | Model `User`, `authPengendali`, `penggunaPengendali`, middleware `autentikasi` & `otorisasi`, hashing bcrypt, penerbitan JWT, helmet/CORS/rate limit |
| Frontend | Halaman Login, `KonteksAuth`, `RuteTerproteksi`, interceptor Axios, halaman Manajemen Kasir, halaman Akses Ditolak |
| FR yang dimiliki | FR-01 s.d. FR-05, FR-28, FR-29, FR-31 |
| Bukti kontribusi | Branch `fitur/auth-*`, matriks uji otorisasi Bagian 15.3, tangkapan layar dokumen MongoDB berisi hash kata sandi |

### 17.2 Anggota B — Produk, Stok & Peringatan

| Aspek | Rincian |
|---|---|
| Backend | Model `Produk` & `MutasiStok`, `produkPengendali`, `layananStok`, endpoint stok menipis, opname, riwayat mutasi, validator produk |
| Frontend | Halaman Manajemen Produk, `FormProduk`, `TabelProduk`, `BadgeStok`, filter & pencarian, halaman Stok Opname |
| FR yang dimiliki | FR-06 s.d. FR-10, FR-22 s.d. FR-25 |
| Bukti kontribusi | Branch `fitur/produk-*`, demonstrasi CRUD lengkap, demonstrasi jejak mutasi stok |

### 17.3 Anggota C — Transaksi, Kasir & Pembayaran

| Aspek | Rincian |
|---|---|
| Backend | Model `Transaksi`, `transaksiPengendali`, logika pengurangan stok atomik, penomoran transaksi, integrasi Midtrans QRIS (opsional) |
| Frontend | Halaman Kasir (grid produk, keranjang, total, dialog pembayaran), `gunakanKeranjang`, halaman Riwayat Transaksi, pemindaian barcode (opsional) |
| FR yang dimiliki | FR-11 s.d. FR-15, FR-20, FR-26, FR-27, FR-32 |
| Bukti kontribusi | Branch `fitur/transaksi-*`, demonstrasi E2E-03 & E2E-04, tangkapan layar sandbox Midtrans |

### 17.4 Anggota D — Laporan, Dashboard, Ekspor & Cache

| Aspek | Rincian |
|---|---|
| Backend | `laporanPengendali`, `layananLaporan` (Aggregation Pipeline), cache node-cache + invalidasi, `layananEkspor` (ExcelJS/PDFKit) |
| Frontend | Halaman Dashboard, `KartuStatistik`, `GrafikOmzet`, `TabelTerlaris`, halaman Laporan, filter tanggal, tombol ekspor |
| FR yang dimiliki | FR-16 s.d. FR-19, FR-21, FR-30 |
| Bukti kontribusi | Branch `fitur/laporan-*`, perbandingan waktu respons sebelum/sesudah cache, berkas hasil ekspor |

### 17.5 Tanggung Jawab Bersama

| Pekerjaan | Penanggung Jawab |
|---|---|
| Kesepakatan desain sistem visual (minggu 1) | Semua, dipimpin D |
| Komponen umum (`Tombol`, `Modal`, `Tabel`, `Skeleton`) | A membuat, semua memakai |
| Tinjauan Pull Request | Berpasangan silang: A↔B, C↔D |
| `README.md` & dokumentasi | Semua, dikoordinasi B |
| Deployment | C (backend), D (frontend) |
| Materi presentasi & video | Semua, disunting C |

---

## 18. Timeline Pengembangan 5 Minggu

Setiap minggu memiliki **kriteria keluar (exit criteria)** yang harus terpenuhi sebelum lanjut, agar pengerjaan benar-benar bertahap (rubrik Alur Pengembangan 10%).

### Minggu 1 — Fondasi & Kesepakatan

| Kegiatan | PIC |
|---|---|
| Membuat repositori, struktur folder, branch `dev`, aturan commit | Semua |
| Setup MongoDB Atlas + koneksi + skrip seed | A |
| Scaffolding backend Express (app.js, rute kosong, penanganan galat) | A |
| Scaffolding frontend Vite + Tailwind + konfigurasi desain sistem | D |
| Menyusun seluruh model Mongoose | B, C |
| Menyepakati palet warna, tipografi, dan komponen umum | Semua |
| Modul Autentikasi: login, hash, JWT, middleware | A |

**Kriteria keluar:** repositori berjalan di lokal untuk keempat anggota; `POST /api/auth/login` mengembalikan token; middleware otorisasi berfungsi; tag `v0.1`.

### Minggu 2 — Backend Inti

| Kegiatan | PIC |
|---|---|
| CRUD produk + validasi + soft delete | B |
| Endpoint stok menipis + pencatatan mutasi stok | B |
| API transaksi + pengurangan stok atomik + pencegahan stok kurang | C |
| Aggregation laporan omzet harian & produk terlaris | D |
| Manajemen akun kasir | A |
| Menyusun Postman Collection untuk seluruh endpoint | Semua |

**Kriteria keluar:** seluruh endpoint Must Have dapat diuji dari Postman; matriks uji otorisasi 15.3 lulus 100%; tag `v0.2`.

### Minggu 3 — Integrasi Frontend

| Kegiatan | PIC |
|---|---|
| Halaman Login + rute terproteksi + konteks auth | A |
| Halaman Manajemen Produk (tabel, form, validasi, badge) | B |
| Halaman Kasir (pencarian, keranjang, total, simpan transaksi) | C |
| Kerangka Dashboard + kartu ringkasan | D |
| Komponen umum & utilitas format Rupiah | A, D |

**Kriteria keluar:** alur E2E-01 s.d. E2E-05 berhasil di peramban; tidak ada pemanggilan Axios langsung di dalam komponen halaman; tag `v0.3`.

### Minggu 4 — Pematangan & Pengujian (Feature Freeze Fitur Inti)

| Kegiatan | PIC |
|---|---|
| Halaman Laporan lengkap + filter tanggal + grafik | D |
| Halaman Riwayat Transaksi + Stok Opname | C, B |
| Penyeragaman status memuat/kosong/galat/sukses seluruh halaman | Semua |
| Penyesuaian responsif 360 / 768 / 1280 px | Semua |
| Menjalankan seluruh skenario E2E + uji rekonsiliasi stok | Semua |
| Perbaikan bug hasil pengujian | Semua |

**Kriteria keluar:** seluruh fitur Must Have selesai dan **dibekukan**; 14 skenario E2E lulus; `dokumen/laporan-pengujian.md` terisi; tag `v0.9`.

### Minggu 5 — Nilai Tambah, Deployment & Presentasi

| Kegiatan | PIC |
|---|---|
| Cache endpoint laporan + pengukuran perbandingan waktu respons | D |
| Ekspor laporan Excel/PDF | D |
| Deployment backend (Render/Railway) & frontend (Vercel) | C, D |
| QRIS Midtrans sandbox *(hanya bila waktu tersisa)* | C |
| Penulisan `README.md`, data seed demo, akun demo | B |
| Penyusunan slide, latihan presentasi, perekaman video | Semua |

**Kriteria keluar:** aplikasi dapat diakses publik; minimal satu nilai tambah berfungsi; video terekam; tag `v1.0`.

### Ritme Kerja Mingguan

| Hari | Kegiatan |
|---|---|
| Senin | Perencanaan mingguan 30 menit — menetapkan tugas per anggota |
| Rabu | Sinkronisasi tengah minggu — merge ke `dev`, selesaikan hambatan |
| Sabtu | Tinjauan Pull Request + demo internal + tag milestone |

---

## 19. Definition of Done

### 19.1 DoD per Fitur

Sebuah fitur dianggap selesai bila:

- [ ] Seluruh kriteria penerimaan user story terkait terpenuhi
- [ ] Validasi diterapkan di frontend **dan** backend
- [ ] Empat status antarmuka (memuat, kosong, galat, sukses) tertangani
- [ ] Berfungsi baik pada lebar 360 px, 768 px, dan 1280 px
- [ ] Endpoint teruji di Postman untuk kasus positif dan negatif
- [ ] Pemeriksaan otorisasi terverifikasi untuk kedua peran
- [ ] Kode telah melewati Pull Request dan ditinjau satu anggota lain
- [ ] Tidak ada `console.log` sisa maupun kode mati

### 19.2 DoD Projek Keseluruhan

**Fungsional**
- [ ] Seluruh kebutuhan **Must Have** (Bagian 3.1) berfungsi tanpa galat
- [ ] Stok berkurang otomatis dan konsisten; uji rekonsiliasi (15.4) menunjukkan selisih 0
- [ ] Transaksi ditolak bila stok tidak mencukupi, tanpa perubahan stok sebagian
- [ ] Laporan omzet & produk terlaris menampilkan angka yang cocok dengan verifikasi manual
- [ ] Peringatan stok menipis muncul sesuai ambang batas
- [ ] Minimal satu fitur nilai tambah (G6) berfungsi

**Backend**
- [ ] Dibangun dengan Express.js; data tersimpan di MongoDB
- [ ] Tersedia API CRUD lengkap (tambah, baca, ubah, hapus) untuk produk dan pengguna
- [ ] Kata sandi tersimpan sebagai hash bcrypt, tidak pernah dikembalikan API
- [ ] Strategi pengamanan API diterapkan: JWT, RBAC middleware, helmet, CORS, rate limit, validasi masukan
- [ ] Matriks uji otorisasi (15.3) lulus seluruhnya

**Frontend**
- [ ] React dengan struktur routing dan komponen yang tertata
- [ ] Tampilan konsisten dengan desain sistem dan responsif di tiga breakpoint
- [ ] Komponen dapat dipakai ulang; logika terpisah dari tampilan (hook & layanan)
- [ ] Umpan balik visual lengkap: indikator memuat, notifikasi, penanda galat, efek tunjuk
- [ ] Seluruh data berasal dari API; validasi form lengkap; galat tertangani

**Proses & Pengumpulan**
- [ ] Setiap anggota memiliki jejak commit bermakna yang tersebar di 5 minggu
- [ ] `README.md` memuat cara menjalankan, URL live, akun demo, dan tabel kontribusi
- [ ] Aplikasi ter-deploy dan dapat diakses publik
- [ ] Slide presentasi dan video sesuai ketentuan
- [ ] Dikumpulkan sebelum tenggat

---

## 20. Risiko & Mitigasi

| No | Risiko | Dampak | Kemungkinan | Mitigasi | Pemilik |
|---|---|---|---|---|---|
| R-01 | Waktu 5 minggu terlalu singkat untuk seluruh fitur | Tinggi | Tinggi | Prioritas MoSCoW ditegakkan; fitur inti dibekukan akhir minggu 4; nilai tambah hanya di minggu 5 | Semua |
| R-02 | Konflik kode antar anggota | Sedang | Tinggi | Branch per fitur, PR wajib, merge ke `dev` setiap Rabu & Sabtu, kepemilikan berkas yang jelas per modul | Semua |
| R-03 | Integrasi Midtrans memakan waktu lebih lama dari perkiraan | Sedang | Sedang | Dijadikan prioritas *Could*; cache & deployment non-Vercel dikerjakan lebih dulu sebagai nilai tambah pengaman | C |
| R-04 | Selisih stok akibat transaksi bersamaan (*race condition*) | Tinggi | Sedang | Gunakan MongoDB Transaction atau `findOneAndUpdate` bersyarat; uji dengan dua peramban sekaligus | C |
| R-05 | Desain antar halaman tidak konsisten | Sedang | Sedang | Desain sistem disepakati minggu 1; komponen umum dibuat sekali dan dipakai bersama | D |
| R-06 | Backend paket gratis mengalami *cold start* saat demo | Sedang | Tinggi | Panaskan server 5 menit sebelum demo; siapkan rekaman video cadangan | C |
| R-07 | Kontribusi anggota tidak merata / ada yang tertinggal | Tinggi | Sedang | Target 3 commit bermakna per anggota per minggu; sinkronisasi Rabu untuk mendeteksi keterlambatan; tugas dapat direalokasi sejak dini | Semua |
| R-08 | Frontend dan backend saling menunggu kontrak API | Sedang | Sedang | Kontrak API sudah dibekukan di Bagian 11; frontend memakai data tiruan bila endpoint belum siap | Semua |
| R-09 | Kehilangan data/kode | Tinggi | Rendah | Semua kode di GitHub; ekspor basis data secara berkala; skrip seed dapat membangun ulang data demo | B |
| R-10 | Laporan lambat saat data besar | Rendah | Rendah | Indeks pada `createdAt` & `kasirId`; agregasi di basis data; cache 60 detik | D |
| R-11 | Anggota tim jatuh sakit / berhalangan | Sedang | Rendah | Setiap modul memiliki pendamping (A↔B, C↔D) yang memahami kodenya lewat tinjauan PR | Semua |

---

## 21. Pemetaan Rubrik Penilaian → Bukti Pengerjaan

Tabel ini memastikan setiap butir rubrik memiliki artefak yang dapat ditunjukkan saat penilaian.

### 21.1 Penilaian Umum (35%)

| Butir Rubrik | Bobot | Bukti dalam Projek | Referensi |
|---|---|---|---|
| Ketepatan fitur | 35% | Seluruh kebutuhan Must Have terpenuhi, ditambah fitur pendukung: pencarian & paginasi, stok opname, jejak mutasi stok, riwayat transaksi kasir, grafik tren, struk, badge status stok | Bagian 3, 6 |
| Kontribusi | 30% | Kepemilikan modul per anggota, branch terpisah, tabel kontribusi di `README.md`, riwayat PR & tinjauan | Bagian 17, 14 |
| Alur pengembangan | 10% | Tag milestone `v0.1`–`v1.0`, kriteria keluar mingguan, target commit mingguan, ritme Senin/Rabu/Sabtu | Bagian 18 |
| Presentasi | 15% | Alur presentasi terstruktur berbasis masalah → solusi → demo | Bagian 22 |
| Video presentasi | 10% | Naskah dan daftar periksa ketentuan video | Bagian 22.3 |

### 21.2 Penilaian Backend (30%)

| Butir Rubrik | Bobot | Bukti dalam Projek | Referensi |
|---|---|---|---|
| Penggunaan ExpressJS | 20% | Backend Express dengan pemisahan rute/pengendali/layanan/middleware | Bagian 9, 13.1 |
| Penggunaan MongoDB | 20% | MongoDB Atlas + Mongoose, 5 koleksi, indeks, Aggregation Pipeline untuk laporan | Bagian 10 |
| Operasi CRUD | 30% | CRUD penuh produk (`GET/POST/PUT/DELETE /api/produk`) dan pengguna; ditunjukkan via Postman Collection | Bagian 11.4 |
| Penyandian kata sandi | 10% | bcrypt salt rounds ≥ 10, `select: false`, tangkapan layar dokumen MongoDB | FR-02, NFR-01 |
| Perlindungan API | 10% | JWT + middleware otorisasi peran, helmet, CORS terbatas, rate limit, validasi masukan; dibuktikan matriks uji otorisasi | FR-03–05, NFR-02–04, Bagian 15.3 |
| Ketepatan waktu | 10% | Timeline dengan penyelesaian di minggu 5, penyangga waktu di minggu 4 | Bagian 18 |

### 21.3 Penilaian Frontend (30%)

| Butir Rubrik | Bobot | Bukti dalam Projek | Referensi |
|---|---|---|---|
| Penggunaan React | 10% | React Router v6, rute terproteksi berbasis peran, Context untuk auth, custom hooks, komponen terstruktur per domain | Bagian 12.2, 13.2 |
| Penerjemahan desain ke antarmuka | 20% | Desain sistem terdefinisi (warna, tipografi, spasi, radius); responsif di 3 breakpoint tanpa scroll horizontal | Bagian 12.1, NFR-05 |
| Frontend Best Practices | 20% | Komponen umum dipakai ulang, folder per domain, logika di hook & layanan (bukan di komponen), berkas < 300 baris | Bagian 13.2, 14.5 |
| Interaktivitas | 10% | Empat status wajib per halaman: skeleton memuat, toast notifikasi, penanda galat spesifik, efek tunjuk & status disabled | Bagian 12.4, NFR-11 |
| Konsumsi API & validasi form | 30% | Seluruh data dari API via React Query; validasi React Hook Form + Zod sesuai Bagian 7.2; penanganan galat 400/401/403/409/500 dengan pesan spesifik | Bagian 7.2, 11.3 |
| Ketepatan waktu | 10% | Frontend inti selesai minggu 4, penyempurnaan minggu 5 | Bagian 18 |

### 21.4 Penilaian Tambahan (5%) — Fitur Pihak Ketiga (G6)

| Jenis G6 | Rencana Implementasi | Prioritas |
|---|---|---|
| #4 Penggunaan cache pada backend | node-cache pada endpoint laporan, TTL 60 detik, dengan invalidasi saat transaksi baru | Should — target utama |
| #5 Deployment selain Vercel | Backend di Render/Railway | Should — target utama |
| #3 Payment Gateway | Midtrans QRIS mode sandbox | Could |

> Rubrik hanya mensyaratkan minimal satu fitur nilai tambah. Dengan mengejar dua yang berisiko rendah lebih dahulu, butir ini praktis terjamin bahkan bila integrasi QRIS tidak selesai.

---

## 22. Rencana Presentasi & Video

Bobotnya 25% dari Penilaian Umum, sehingga perlu direncanakan sejak awal, bukan disiapkan di malam terakhir.

### 22.1 Alur Presentasi (target 10–12 menit)

| Menit | Bagian | Penyaji |
|---|---|---|
| 0–1 | Masalah nyata Toko Berkah: dua kanal catatan, selisih stok, rekap manual 45 menit/malam | A |
| 1–2 | Solusi LARIS & arsitektur singkat (diagram Bagian 9.1) | A |
| 2–4 | **Demo 1 — Otorisasi:** login pemilik vs kasir, perbedaan menu, lalu percobaan akses langsung via Postman → 403 | A |
| 4–6 | **Demo 2 — Produk & Stok:** tambah produk, ubah harga, badge stok menipis, stok opname dengan alasan | B |
| 6–8 | **Demo 3 — Kasir:** transaksi 3 item, stok berkurang otomatis di depan penguji, percobaan beli melebihi stok → ditolak | C |
| 8–10 | **Demo 4 — Laporan:** dashboard omzet, produk terlaris, filter tanggal, perbandingan waktu respons sebelum/sesudah cache, ekspor Excel | D |
| 10–11 | Nilai tambah, cakupan pengujian, jejak kontribusi (grafik commit GitHub) | Semua |
| 11–12 | Penutup: pemetaan masalah → fitur, rencana pengembangan lanjutan | A |

### 22.2 Kiat Penyampaian

- Selalu kaitkan setiap fitur ke masalah aslinya: "stok berkurang otomatis inilah yang menghilangkan selisih rak."
- Tunjukkan **kasus gagal**, bukan hanya jalur ideal — percobaan 403 dan penolakan stok kurang adalah bukti kualitas terkuat.
- Siapkan data demo yang tampak nyata (nama produk kelontong asli, harga wajar, transaksi tersebar 14 hari).
- Setiap anggota mempresentasikan modulnya sendiri agar penilaian kontribusi individu jelas.
- Latihan penuh minimal dua kali dengan pengukuran waktu.

### 22.3 Daftar Periksa Video

- [ ] Memenuhi seluruh ketentuan durasi dan format yang ditetapkan pengampu
- [ ] Menampilkan identitas kelompok dan nama seluruh anggota di awal
- [ ] Suara jernih dan naskah tertulis (bukan improvisasi penuh)
- [ ] Rekaman layar aplikasi live, bukan mockup atau slide statis
- [ ] Menyertakan keempat demo pada Bagian 22.1
- [ ] Setiap anggota bersuara pada bagian modulnya
- [ ] Menampilkan URL aplikasi live dan repositori
- [ ] Diunggah dan tautannya diuji dari perangkat lain sebelum dikumpulkan

---

## 23. Glosarium

| Istilah | Penjelasan |
|---|---|
| **LARIS** | Layanan Administrasi Ritel & Inventaris Stok — nama sistem ini; sekaligus bermakna "laris" (dagangan cepat terjual) |
| **RBAC** | *Role-Based Access Control* — pembatasan akses berdasarkan peran pengguna |
| **JWT** | *JSON Web Token* — token bertanda tangan yang membuktikan identitas pengguna pada setiap permintaan |
| **Hash** | Penyandian satu arah; kata sandi tidak dapat dikembalikan ke bentuk aslinya |
| **bcrypt** | Algoritma hashing kata sandi dengan *salt* dan biaya komputasi yang dapat diatur |
| **Soft delete** | Menandai data sebagai tidak aktif alih-alih menghapusnya, agar riwayat tetap utuh |
| **Aggregation Pipeline** | Fitur MongoDB untuk mengolah dan meringkas data langsung di basis data |
| **Atomik** | Sifat operasi yang berhasil seluruhnya atau tidak berpengaruh sama sekali |
| **Race condition** | Kondisi galat akibat dua proses mengubah data yang sama secara bersamaan |
| **TTL** | *Time To Live* — masa berlaku data di dalam cache |
| **MoSCoW** | Metode prioritas: Must, Should, Could, Won't have |
| **Stok opname** | Pencocokan stok sistem dengan hasil hitung fisik di rak |
| **Mutasi stok** | Catatan setiap perubahan stok beserta penyebabnya |
| **QRIS** | *Quick Response Code Indonesian Standard* — standar kode QR pembayaran nasional |
| **Debounce** | Menunda eksekusi hingga pengguna berhenti mengetik, untuk mengurangi permintaan API |
| **Cold start** | Jeda saat server paket gratis "bangun" setelah tidak aktif |
| **Seed** | Data awal yang dimasukkan ke basis data untuk pengembangan dan demonstrasi |

---

## Lampiran A — Contoh Payload API

### A.1 Login

**Permintaan** — `POST /api/auth/login`
```json
{
  "email": "hasan@tokoberkah.id",
  "password": "berkah2026"
}
```

**Respons 200**
```json
{
  "sukses": true,
  "pesan": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "pengguna": {
      "id": "6650a1f2c8b4d9e1a2f30011",
      "nama": "Pak Hasan",
      "email": "hasan@tokoberkah.id",
      "role": "pemilik"
    }
  }
}
```

**Respons 401**
```json
{
  "sukses": false,
  "pesan": "Email atau kata sandi salah",
  "kodeGalat": "KREDENSIAL_SALAH"
}
```

### A.2 Tambah Produk

**Permintaan** — `POST /api/produk` *(peran: pemilik)*
```json
{
  "nama": "Indomie Goreng",
  "kategori": "Makanan",
  "harga": 3500,
  "stok": 120,
  "stokMinimum": 24,
  "satuan": "pcs",
  "barcode": "8998866200011"
}
```

**Respons 201**
```json
{
  "sukses": true,
  "pesan": "Produk berhasil ditambahkan",
  "data": {
    "id": "6650a2b7c8b4d9e1a2f30042",
    "nama": "Indomie Goreng",
    "kategori": "Makanan",
    "harga": 3500,
    "stok": 120,
    "stokMinimum": 24,
    "satuan": "pcs",
    "statusStok": "aman",
    "isAktif": true
  }
}
```

**Respons 400**
```json
{
  "sukses": false,
  "pesan": "Validasi gagal",
  "kodeGalat": "VALIDASI_GAGAL",
  "galat": [
    { "field": "harga", "pesan": "Harga tidak boleh negatif" },
    { "field": "kategori", "pesan": "Kategori wajib diisi" }
  ]
}
```

### A.3 Daftar Produk dengan Pencarian & Paginasi

**Permintaan** — `GET /api/produk?cari=indomie&kategori=Makanan&halaman=1&perHalaman=20`

**Respons 200**
```json
{
  "sukses": true,
  "pesan": "Daftar produk berhasil diambil",
  "data": [
    {
      "id": "6650a2b7c8b4d9e1a2f30042",
      "nama": "Indomie Goreng",
      "kategori": "Makanan",
      "harga": 3500,
      "stok": 18,
      "stokMinimum": 24,
      "satuan": "pcs",
      "statusStok": "menipis"
    }
  ],
  "meta": { "halaman": 1, "perHalaman": 20, "total": 1, "totalHalaman": 1 }
}
```

### A.4 Buat Transaksi

**Permintaan** — `POST /api/transaksi` *(peran: kasir)*
```json
{
  "items": [
    { "productId": "6650a2b7c8b4d9e1a2f30042", "qty": 3 },
    { "productId": "6650a2b7c8b4d9e1a2f30055", "qty": 2 }
  ],
  "metodeBayar": "tunai",
  "nominalBayar": 50000
}
```

**Respons 201**
```json
{
  "sukses": true,
  "pesan": "Transaksi berhasil disimpan",
  "data": {
    "id": "6650a9d1c8b4d9e1a2f30099",
    "nomorTransaksi": "TRX-20260509-0007",
    "namaKasir": "Rani",
    "items": [
      { "productId": "6650a2b7c8b4d9e1a2f30042", "nama": "Indomie Goreng", "hargaSaat": 3500, "qty": 3, "subtotal": 10500 },
      { "productId": "6650a2b7c8b4d9e1a2f30055", "nama": "Teh Kotak 200ml", "hargaSaat": 4500, "qty": 2, "subtotal": 9000 }
    ],
    "total": 19500,
    "metodeBayar": "tunai",
    "statusBayar": "berhasil",
    "nominalBayar": 50000,
    "kembalian": 30500,
    "createdAt": "2026-05-09T03:21:44.000Z"
  }
}
```

**Respons 400 — stok tidak cukup**
```json
{
  "sukses": false,
  "pesan": "Stok tidak mencukupi",
  "kodeGalat": "STOK_TIDAK_CUKUP",
  "galat": [
    { "field": "items[0].qty", "pesan": "Indomie Goreng hanya tersisa 2 pcs" }
  ]
}
```

### A.5 Laporan Ringkasan Dashboard

**Permintaan** — `GET /api/laporan/ringkasan` *(peran: pemilik)*

**Respons 200**
```json
{
  "sukses": true,
  "pesan": "Ringkasan berhasil diambil",
  "data": {
    "tanggal": "2026-05-09",
    "omzetHariIni": 1247500,
    "jumlahTransaksi": 38,
    "rataRataTransaksi": 32828,
    "jumlahProdukMenipis": 6,
    "trenTujuhHari": [
      { "tanggal": "2026-05-03", "omzet": 980000 },
      { "tanggal": "2026-05-04", "omzet": 1120000 },
      { "tanggal": "2026-05-05", "omzet": 1045000 },
      { "tanggal": "2026-05-06", "omzet": 1310000 },
      { "tanggal": "2026-05-07", "omzet": 1190000 },
      { "tanggal": "2026-05-08", "omzet": 1402000 },
      { "tanggal": "2026-05-09", "omzet": 1247500 }
    ]
  },
  "meta": { "dariCache": false, "waktuProsesMs": 312 }
}
```

### A.6 Produk Terlaris

**Permintaan** — `GET /api/laporan/produk-terlaris?tanggalMulai=2026-05-01&tanggalAkhir=2026-05-09&limit=5`

**Respons 200**
```json
{
  "sukses": true,
  "pesan": "Laporan produk terlaris berhasil diambil",
  "data": [
    { "productId": "6650a2b7c8b4d9e1a2f30042", "nama": "Indomie Goreng", "totalQty": 342, "totalOmzet": 1197000, "isAktif": true },
    { "productId": "6650a2b7c8b4d9e1a2f30055", "nama": "Teh Kotak 200ml", "totalQty": 210, "totalOmzet": 945000, "isAktif": true },
    { "productId": "6650a2b7c8b4d9e1a2f30061", "nama": "Beras Pandan Wangi 1kg", "totalQty": 96, "totalOmzet": 1344000, "isAktif": true },
    { "productId": "6650a2b7c8b4d9e1a2f30073", "nama": "Minyak Goreng 1L", "totalQty": 88, "totalOmzet": 1584000, "isAktif": true },
    { "productId": "6650a2b7c8b4d9e1a2f30080", "nama": "Gula Pasir 1kg", "totalQty": 74, "totalOmzet": 1036000, "isAktif": false }
  ],
  "meta": { "dariCache": true, "waktuProsesMs": 8 }
}
```

### A.7 Stok Opname

**Permintaan** — `POST /api/produk/6650a2b7c8b4d9e1a2f30042/opname` *(peran: pemilik)*
```json
{
  "stokFisik": 15,
  "alasan": "rusak",
  "catatan": "3 bungkus sobek terkena air"
}
```

**Respons 200**
```json
{
  "sukses": true,
  "pesan": "Stok berhasil disesuaikan",
  "data": {
    "productId": "6650a2b7c8b4d9e1a2f30042",
    "nama": "Indomie Goreng",
    "stokSebelum": 18,
    "stokSesudah": 15,
    "selisih": -3,
    "tipe": "koreksi",
    "alasan": "rusak",
    "dicatatOleh": "Pak Hasan",
    "createdAt": "2026-05-09T04:02:10.000Z"
  }
}
```

### A.8 Percobaan Akses Tanpa Wewenang

**Permintaan** — `GET /api/laporan/omzet-harian` dengan token peran `kasir`

**Respons 403**
```json
{
  "sukses": false,
  "pesan": "Anda tidak memiliki wewenang untuk mengakses sumber daya ini",
  "kodeGalat": "AKSES_DITOLAK"
}
```

---

**Akhir Dokumen — PRD LARIS v2.0**
