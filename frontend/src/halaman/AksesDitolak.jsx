import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { gunakanAuth } from '../hook/gunakanAuth.js'
import { BERANDA_PERAN } from '../utilitas/konstanta.js'

const KELAS_TAUTAN = 'inline-flex min-h-12 items-center justify-center rounded-xl bg-jingga px-6 text-sm font-bold text-black transition-colors hover:bg-jingga-tua'

export default function AksesDitolak() {
  const { pengguna } = gunakanAuth()
  const beranda = pengguna ? BERANDA_PERAN[pengguna.role] : '/masuk'
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-latar px-6 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-merah-muda text-merah">
        <ShieldAlert className="size-10" aria-hidden="true" />
      </div>
      <p className="angka mt-2 text-sm font-bold text-merah">403</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-tinta">Akses ditolak</h1>
      <p className="max-w-sm text-sm text-zaitun">
        Halaman ini hanya untuk pemilik toko. Bila Anda merasa seharusnya punya akses, hubungi pemilik.
      </p>
      <Link to={beranda} className={`${KELAS_TAUTAN} mt-4`}>
        {pengguna ? 'Kembali ke halaman utama' : 'Masuk'}
      </Link>
    </main>
  )
}
