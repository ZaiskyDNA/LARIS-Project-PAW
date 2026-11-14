import { z } from 'zod'

export const skemaLogin = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email wajib diisi')
    .max(100, 'Email maksimal 100 karakter')
    .email('Format email tidak valid'),
  password: z.string().min(1, 'Kata sandi wajib diisi'),
})
