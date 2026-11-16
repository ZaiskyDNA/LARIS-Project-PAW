# Panduan Deploy LARIS ke AWS

Susunan termurah untuk masa demo ±1 bulan:

| Lapisan | Layanan | Biaya perkiraan |
|---|---|---|
| Backend (Express) | AWS Lambda + Function URL | Rp0 — masuk kuota *always free* Lambda (1 juta request/bulan) |
| Frontend (React) | AWS Amplify Hosting, unggah ZIP | Beberapa sen dolar, tertutup kredit AWS |
| Basis data | MongoDB Atlas M0 | Gratis |

Seluruh layanan AWS dibuat di region **Asia Pacific (Singapore) `ap-southeast-1`**, sama dengan cluster Atlas.

## Persiapan

- `MONGO_URI` Atlas sudah teruji dan data demo sudah di-seed ke Atlas: `MONGO_URI="..." npm run seed` dari folder `backend`.
- `JWT_SECRET` produksi (≥ 32 karakter): `openssl rand -hex 32`.
- Pasang alarm biaya: **Billing and Cost Management → Budgets → Create budget → Monthly cost budget**, isi `5` USD dan email Anda.

## 1. Buat paket backend

```bash
cd backend
npm install
npm run bundle:lambda      # menghasilkan backend/dist-lambda/laris-backend.zip
```

## 2. Buat fungsi Lambda

1. Pastikan region kanan atas **Asia Pacific (Singapore)**.
2. Cari **Lambda** → **Create function** → **Author from scratch**.
   - Function name: `laris-backend`
   - Runtime: **Node.js 22.x**
   - Architecture: **x86_64**
   - Permissions: biarkan *Create a new role with basic Lambda permissions*
   - **Additional configurations** → centang **Enable function URL** → Auth type **NONE**.
     **Jangan** centang *Configure cross-origin resource sharing (CORS)* — CORS sudah diatur oleh Express.
3. **Create function**.
4. Tab **Code** → **Upload from** → **.zip file** → pilih `laris-backend.zip` → **Save**.
5. Masih di tab Code, bagian **Runtime settings** → **Edit** → Handler: `lambda.handler` → **Save**.
6. Tab **Configuration** → **General configuration** → **Edit** → Memory `512` MB, Timeout `30` detik → **Save**.
7. Tab **Configuration** → **Environment variables** → **Edit** → tambahkan:

   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | URI Atlas lengkap |
   | `JWT_SECRET` | hasil `openssl rand -hex 32` |
   | `JWT_EXPIRES_IN` | `8h` |
   | `CORS_ORIGIN` | `http://localhost:5173` (sementara, diganti di langkah 5) |
   | `CACHE_TTL` | `60` |
   | `LOGIN_RATE_LIMIT` | `100` |

   `TRUST_PROXY` dan kunci Midtrans **tidak perlu** diisi (QRIS berjalan dalam mode simulasi).
8. Tab **Configuration** → **Function URL** → salin alamatnya, mis. `https://abc123.lambda-url.ap-southeast-1.on.aws/`.
9. Uji: buka `https://abc123.lambda-url.ap-southeast-1.on.aws/api/kesehatan` di browser → harus tampil `{"sukses":true,...}`.

## 3. Buat paket frontend

Gunakan Function URL dari langkah 2.8, **ditambah `/api`**:

```bash
cd frontend
npm install
npm run bundle:amplify -- https://abc123.lambda-url.ap-southeast-1.on.aws/api
# menghasilkan frontend/laris-frontend.zip
```

## 4. Deploy frontend ke Amplify

1. Cari **AWS Amplify** → **Create new app** (atau *Deploy an app*).
2. Pilih **Deploy without Git** → **Next**.
3. App name `laris`, Branch name `main` → metode **Drag and drop** → unggah `laris-frontend.zip` → **Save and deploy**.
4. Setelah status **Deployed**, salin domainnya, mis. `https://main.d1a2b3c4.amplifyapp.com`.
5. Menu **Hosting → Rewrites and redirects → Manage redirects → Add rewrite** (agar refresh di `/produk` tidak 404):
   - Source address: `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>`
   - Target address: `/index.html`
   - Type: **200 (Rewrite)**
   → **Save**.

## 5. Izinkan domain Amplify di backend

Lambda → `laris-backend` → **Configuration → Environment variables → Edit** → ubah `CORS_ORIGIN` menjadi domain Amplify **tanpa garis miring di akhir**, mis. `https://main.d1a2b3c4.amplifyapp.com` → **Save**.

## 6. Uji akhir

1. Buka domain Amplify → login `owner@laris.com` / `password123`.
2. Cek Dashboard, Produk, Laporan, Ekspor Excel & PDF.
3. Login sebagai kasir → buat transaksi tunai dan QRIS (tombol *Simulasikan Pembayaran Berhasil*).
4. Refresh halaman `/produk` → tidak boleh 404.

## Memperbarui aplikasi

- Backend: `npm run bundle:lambda` → Lambda → Code → Upload from .zip.
- Frontend: `npm run bundle:amplify -- <url>/api` → Amplify → app `laris` → **Deploy updates** → unggah ZIP baru.
- Data demo segar sebelum presentasi: `MONGO_URI="..." npm run seed` dari komputer lokal.

## Masalah umum

| Gejala | Penyebab & solusi |
|---|---|
| Browser: *blocked by CORS policy* | `CORS_ORIGIN` tidak sama persis dengan domain Amplify (cek `https`, tanpa `/` di akhir), atau CORS Function URL ikut diaktifkan — matikan. |
| API mengembalikan 503 "Basis data tidak dapat dihubungi" | `MONGO_URI` salah atau Network Access Atlas belum `0.0.0.0/0`. |
| API mengembalikan *Internal Server Error* sebelum sampai Express | Variabel lingkungan kurang / `JWT_SECRET` < 32 karakter. Lihat **Monitor → View CloudWatch logs**. |
| Refresh halaman → 404 | Aturan rewrite langkah 4.5 belum dibuat. |
| Permintaan pertama lambat 1–3 detik | *Cold start* Lambda. Buka aplikasi beberapa menit sebelum demo. |

## Setelah masa demo selesai

Hapus agar tidak ada biaya: aplikasi Amplify `laris`, fungsi Lambda `laris-backend`, log group CloudWatch `/aws/lambda/laris-backend`, dan IAM role `laris-backend-role-…`.
