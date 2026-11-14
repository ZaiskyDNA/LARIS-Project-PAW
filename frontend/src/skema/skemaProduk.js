import { z } from 'zod'

const bilanganBulat = (pesanWajib, pesanNegatif) =>
  z
    .union([z.number(), z.literal('')])
    .refine((nilai) => nilai !== '', pesanWajib)
    .refine((nilai) => nilai === '' || Number.isInteger(nilai), 'Harus berupa angka bulat')
    .refine((nilai) => nilai === '' || nilai >= 0, pesanNegatif)

export const skemaProduk = z.object({
  nama: z.string().trim().min(2, 'Nama produk minimal 2 karakter').max(100, 'Nama produk maksimal 100 karakter'),
  kategori: z.string().trim().min(1, 'Kategori wajib diisi').max(40, 'Kategori maksimal 40 karakter'),
  barcode: z
    .string()
    .trim()
    .refine((nilai) => nilai === '' || /^[A-Za-z0-9]{8,20}$/.test(nilai), 'Barcode harus 8–20 karakter huruf/angka'),
  harga: bilanganBulat('Harga wajib diisi', 'Harga tidak boleh negatif').refine(
    (nilai) => nilai === '' || nilai <= 100_000_000,
    'Harga maksimal Rp100.000.000',
  ),
  stok: bilanganBulat('Stok wajib diisi', 'Stok tidak boleh negatif'),
  stokMinimum: z
    .union([z.number(), z.literal('')])
    .refine(
      (nilai) => nilai === '' || (Number.isInteger(nilai) && nilai >= 0 && nilai <= 10_000),
      'Stok minimum tidak valid',
    ),
  satuan: z.string().trim().max(20, 'Satuan maksimal 20 karakter'),
})

export const skemaOpname = z.object({
  stokFisik: bilanganBulat('Stok fisik wajib diisi', 'Stok fisik tidak boleh negatif'),
  alasan: z.string().min(1, 'Alasan wajib dipilih'),
  catatan: z.string().trim().max(200, 'Catatan maksimal 200 karakter'),
})
