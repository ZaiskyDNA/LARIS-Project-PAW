import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { gabungKelas } from '../../utilitas/gabungKelas.js'

/**
 * Kepala halaman pemilik: pita kuning lengket di HP, judul besar di desktop.
 * `polos` meniadakan pita kuning (dipakai Dashboard sesuai desain).
 * `kembali` menampilkan panah kembali (HP) — di desktop navigasi lewat sidebar.
 */
export default function KepalaHalaman({ judul, sapaan, keterangan, kembali, aksi, polos = false, className }) {
  return (
    <header
      className={gabungKelas(
        'flex items-center gap-3',
        polos ? 'mb-4 pt-6' : 'sticky top-0 z-20 -mx-4 mb-5 min-h-18 bg-kuning px-5 py-4',
        'lg:static lg:mx-0 lg:mb-7 lg:min-h-0 lg:items-end lg:bg-transparent lg:p-0',
        className,
      )}
    >
      {kembali && (
        <Link to={kembali} aria-label="Kembali" className="-ml-2 flex size-11 shrink-0 items-center justify-center rounded-full text-tinta hover:bg-kuning-tua lg:hidden">
          <ChevronLeft className="size-6" strokeWidth={3} aria-hidden="true" />
        </Link>
      )}
      <div className="min-w-0 flex-1">
        {sapaan && <p className="text-sm font-bold text-jingga lg:text-lg">{sapaan}</p>}
        <h1 className="truncate text-2xl font-extrabold tracking-tight text-tinta lg:text-[40px] lg:leading-tight">{judul}</h1>
        {keterangan && <p className="mt-0.5 truncate text-sm font-bold text-tinta">{keterangan}</p>}
      </div>
      {aksi && <div className="flex shrink-0 items-center gap-3">{aksi}</div>}
    </header>
  )
}
