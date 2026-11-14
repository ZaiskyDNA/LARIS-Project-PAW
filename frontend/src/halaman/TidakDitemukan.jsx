import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { gunakanAuth } from '../hook/gunakanAuth.js'
import { BERANDA_PERAN } from '../utilitas/konstanta.js'

export default function TidakDitemukan() {
  const { pengguna } = gunakanAuth()
  const beranda = pengguna ? BERANDA_PERAN[pengguna.role] : '/masuk'
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-latar px-6 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-persik text-cokelat">
        <Compass className="size-10" aria-hidden="true" />
      </div>
      <p className="angka mt-2 text-sm font-bold text-cokelat">404</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-tinta">Halaman tidak ditemukan</h1>
      <p className="max-w-sm text-sm text-zaitun">Alamat yang Anda buka tidak ada atau sudah dipindahkan.</p>
      <Link to={beranda} className="mt-4 inline-flex min-h-12 items-center justify-center rounded-xl bg-jingga px-6 text-sm font-bold text-black transition-colors hover:bg-jingga-tua">
        {pengguna ? 'Kembali ke halaman utama' : 'Masuk'}
      </Link>
    </main>
  )
}
