import { ChevronLeft, ChevronRight } from 'lucide-react'
import { gabungKelas } from '../../utilitas/gabungKelas.js'

const KELAS_TOMBOL =
  'angka flex size-10 items-center justify-center rounded-full text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-35'

// Menampilkan maksimal 5 nomor di sekitar halaman aktif
const nomorTampil = (halaman, total) => {
  const awal = Math.max(1, Math.min(halaman - 2, total - 4))
  return Array.from({ length: Math.min(5, total) }, (_, i) => awal + i)
}

export default function Paginasi({ halaman = 1, totalHalaman = 1, total, saatGanti }) {
  if (totalHalaman <= 1) return null
  return (
    <nav aria-label="Paginasi" className="flex flex-wrap items-center justify-center gap-1 pb-1 pt-4">
      <button type="button" aria-label="Halaman sebelumnya" disabled={halaman <= 1} onClick={() => saatGanti(halaman - 1)} className={gabungKelas(KELAS_TOMBOL, 'hover:bg-kuning-tua')}>
        <ChevronLeft className="size-4" aria-hidden="true" />
      </button>
      {nomorTampil(halaman, totalHalaman).map((nomor) => (
        <button
          key={nomor}
          type="button"
          aria-current={nomor === halaman ? 'page' : undefined}
          onClick={() => saatGanti(nomor)}
          className={gabungKelas(KELAS_TOMBOL, nomor === halaman ? 'bg-jingga text-black' : 'hover:bg-kuning-tua')}
        >
          {nomor}
        </button>
      ))}
      <button type="button" aria-label="Halaman berikutnya" disabled={halaman >= totalHalaman} onClick={() => saatGanti(halaman + 1)} className={gabungKelas(KELAS_TOMBOL, 'hover:bg-kuning-tua')}>
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>
      {total != null && <span className="ml-2 text-xs text-zaitun">{total} data</span>}
    </nav>
  )
}
