import { z } from 'zod'

const nama = z.string().trim().min(3, 'Nama minimal 3 karakter').max(60, 'Nama maksimal 60 karakter')

export const skemaKasirBaru = z.object({
  nama,
  email: z
    .string()
    .trim()
    .min(1, 'Email wajib diisi')
    .max(100, 'Email maksimal 100 karakter')
    .email('Format email tidak valid'),
  password: z
    .string()
    .min(8, 'Kata sandi minimal 8 karakter dan mengandung huruf serta angka')
    .refine(
      (nilai) => /[A-Za-z]/.test(nilai) && /\d/.test(nilai),
      'Kata sandi minimal 8 karakter dan mengandung huruf serta angka',
    ),
})

export const skemaUbahKasir = z.object({ nama })

// Skor 0–4 untuk indikator kekuatan kata sandi (US-07)
export const kekuatanKataSandi = (kataSandi = '') => {
  let skor = 0
  if (kataSandi.length >= 8) skor += 1
  if (/[A-Za-z]/.test(kataSandi) && /\d/.test(kataSandi)) skor += 1
  if (kataSandi.length >= 12) skor += 1
  if (/[^A-Za-z0-9]/.test(kataSandi) || (/[a-z]/.test(kataSandi) && /[A-Z]/.test(kataSandi))) skor += 1
  return skor
}
