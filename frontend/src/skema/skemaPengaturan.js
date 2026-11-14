import { z } from 'zod'

export const skemaPengaturan = z.object({
  namaToko: z.string().trim().min(2, 'Nama toko minimal 2 karakter').max(100, 'Nama toko maksimal 100 karakter'),
  alamat: z.string().trim().max(200, 'Alamat maksimal 200 karakter'),
  telepon: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{0,20}$/, 'Nomor telepon hanya boleh angka, spasi, +, -, dan maksimal 20 karakter'),
  stokMinimumDefault: z
    .union([z.number(), z.literal('')])
    .refine((nilai) => nilai !== '', 'Stok minimum wajib diisi')
    .refine(
      (nilai) => nilai === '' || (Number.isInteger(nilai) && nilai >= 0 && nilai <= 10_000),
      'Stok minimum harus 0–10.000',
    ),
})
