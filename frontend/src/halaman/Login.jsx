import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import Avatar from '../komponen/umum/Avatar.jsx'
import Tombol from '../komponen/umum/Tombol.jsx'
import { KolomInput } from '../komponen/umum/KolomInput.jsx'
import PemuatHalaman from '../komponen/tataletak/PemuatHalaman.jsx'
import { gunakanAuth } from '../hook/gunakanAuth.js'
import { skemaLogin } from '../skema/skemaLogin.js'
import { BERANDA_PERAN, PERAN } from '../utilitas/konstanta.js'
import { uraikanGalat } from '../utilitas/galatApi.js'

// Tujuan setelah login: halaman asal bila berwenang, selain itu beranda sesuai peran
const tujuanSetelahMasuk = (pengguna, dari) => {
  const beranda = BERANDA_PERAN[pengguna.role] ?? '/kasir'
  if (!dari || dari === '/masuk' || dari === '/') return beranda
  const khususKasir = ['/kasir', '/transaksi', '/profil'].some((awalan) => dari.startsWith(awalan))
  return pengguna.role === PERAN.PEMILIK || khususKasir ? dari : beranda
}

export default function Login() {
  const { pengguna, sedangMemeriksa, sesiHabis, masuk } = gunakanAuth()
  const navigate = useNavigate()
  const lokasi = useLocation()
  const [galatServer, setGalatServer] = useState(null)
  const [tampilSandi, setTampilSandi] = useState(false)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(skemaLogin), mode: 'onTouched', defaultValues: { email: '', password: '' } })

  const [email, password] = useWatch({ control, name: ['email', 'password'] })
  const kosong = !email.trim() || !password

  if (sedangMemeriksa && !pengguna) return <PemuatHalaman layarPenuh />
  if (pengguna) return <Navigate to={tujuanSetelahMasuk(pengguna, lokasi.state?.dari)} replace />

  const kirim = async (data) => {
    setGalatServer(null)
    try {
      const akun = await masuk({ email: data.email.trim().toLowerCase(), password: data.password })
      navigate(tujuanSetelahMasuk(akun, lokasi.state?.dari), { replace: true })
    } catch (error) {
      setGalatServer(uraikanGalat(error).pesan)
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-kuning px-4 py-10">
      <div className="w-full max-w-md rounded-[36px] bg-kuning px-2 py-6 sm:bg-latar sm:px-12 sm:py-12 sm:shadow-kartu">
        <div className="flex flex-col items-center">
          <Avatar ukuran="besar" />
          <h1 className="mt-2 text-5xl font-extrabold tracking-tight text-black">Login</h1>
          <p className="mt-2 text-sm text-zaitun">LARIS · Kasir &amp; stok Toko Berkah</p>
        </div>

        <form onSubmit={handleSubmit(kirim)} noValidate className="mt-9 flex flex-col gap-6">
          {sesiHabis && !galatServer && (
            <p role="status" className="rounded-xl bg-persik px-4 py-3 text-sm font-semibold text-cokelat">
              Sesi Anda telah berakhir. Silakan masuk kembali.
            </p>
          )}
          {galatServer && (
            <p role="alert" className="rounded-xl bg-merah-muda px-4 py-3 text-sm font-semibold text-merah">
              {galatServer}
            </p>
          )}

          <KolomInput
            label="Email"
            type="email"
            inputMode="email"
            autoComplete="username"
            autoFocus
            warna="krem"
            kelasInput="min-h-12"
            galat={errors.email?.message}
            {...register('email')}
          />
          <KolomInput
            label="Password"
            type={tampilSandi ? 'text' : 'password'}
            autoComplete="current-password"
            warna="krem"
            kelasInput="min-h-12"
            galat={errors.password?.message}
            bantuan="Lupa kata sandi? Hubungi pemilik toko."
            akhiran={
              <button
                type="button"
                onClick={() => setTampilSandi((nilai) => !nilai)}
                aria-label={tampilSandi ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                className="flex size-10 items-center justify-center rounded-full text-zaitun hover:bg-kuning"
              >
                {tampilSandi ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
              </button>
            }
            {...register('password')}
          />

          <Tombol type="submit" ukuran="besar" penuh memuat={isSubmitting} disabled={kosong} className="mt-4 rounded-xl text-lg">
            {isSubmitting ? 'Memproses…' : 'Log In'}
          </Tombol>
        </form>
      </div>
    </main>
  )
}
