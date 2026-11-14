export const KUNCI_TOKEN = 'laris_token'
export const KUNCI_PENGGUNA = 'laris_pengguna'
export const PERISTIWA_SESI_HABIS = 'laris:sesi-habis'

export const PERAN = { PEMILIK: 'pemilik', KASIR: 'kasir' }

export const LABEL_PERAN = { pemilik: 'Pemilik Toko', kasir: 'Kasir' }

export const BERANDA_PERAN = { pemilik: '/', kasir: '/kasir' }

export const KATEGORI_PRODUK = [
  'Sembako',
  'Makanan',
  'Minuman',
  'Rumah Tangga',
  'Kebutuhan Diri',
  'Lainnya',
]

export const SATUAN_PRODUK = ['pcs', 'kg', 'liter', 'botol', 'pouch', 'karung', 'renceng', 'dus']

export const STATUS_STOK = {
  aman: { label: 'Aman', kelas: 'bg-hijau-muda text-hijau' },
  menipis: { label: 'Menipis', kelas: 'bg-persik text-cokelat' },
  habis: { label: 'Habis', kelas: 'bg-merah-muda text-merah' },
}

export const ALASAN_OPNAME = [
  { nilai: 'rusak', label: 'Rusak' },
  { nilai: 'hilang', label: 'Hilang' },
  { nilai: 'kedaluwarsa', label: 'Kedaluwarsa' },
  { nilai: 'salah input', label: 'Salah input' },
  { nilai: 'stok masuk', label: 'Stok masuk' },
  { nilai: 'lain-lain', label: 'Lain-lain' },
]

export const TIPE_MUTASI = {
  masuk: { label: 'Masuk', kelas: 'bg-hijau-muda text-hijau', tanda: '+' },
  keluar: { label: 'Keluar', kelas: 'bg-persik text-cokelat', tanda: '−' },
  koreksi: { label: 'Koreksi', kelas: 'bg-pasir text-zaitun', tanda: '−' },
}

export const METODE_BAYAR = {
  tunai: { label: 'Tunai', kelas: 'bg-kuning text-tinta' },
  qris: { label: 'QRIS', kelas: 'bg-persik text-cokelat' },
}

export const STATUS_BAYAR = {
  berhasil: { label: 'Berhasil', kelas: 'bg-hijau-muda text-hijau' },
  menunggu: { label: 'Menunggu', kelas: 'bg-persik text-cokelat' },
  gagal: { label: 'Gagal', kelas: 'bg-merah-muda text-merah' },
  dibatalkan: { label: 'Dibatalkan', kelas: 'bg-pasir text-zaitun' },
}

export const PECAHAN_UANG = [10_000, 20_000, 50_000, 100_000]

export const PER_HALAMAN = 20
export const PER_HALAMAN_KASIR = 100
export const JEDA_DEBOUNCE_MS = 300
export const DURASI_QRIS_DETIK = 300
export const JEDA_CEK_QRIS_MS = 5000
export const POLA_BARCODE = /^[A-Za-z0-9]{8,20}$/
