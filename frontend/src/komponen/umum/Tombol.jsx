import { LoaderCircle } from 'lucide-react'
import { gabungKelas } from '../../utilitas/gabungKelas.js'

const VARIAN = {
  primer: 'bg-jingga text-black hover:bg-jingga-tua active:bg-jingga-tua',
  sekunder: 'bg-kuning text-tinta hover:bg-kuning-tua active:bg-kuning-tua',
  terang: 'bg-krem text-tinta border border-kuning-tua hover:bg-kuning active:bg-kuning',
  bahaya: 'bg-merah-muda text-merah hover:bg-[#ffbdb7] active:bg-[#ffbdb7]',
  teks: 'bg-transparent text-cokelat hover:bg-persik/60 active:bg-persik',
}

const UKURAN = {
  kecil: 'min-h-9 px-3.5 text-sm rounded-full',
  sedang: 'min-h-11 px-5 text-sm rounded-xl',
  besar: 'min-h-14 px-6 text-base rounded-2xl',
}

export default function Tombol({
  varian = 'primer',
  ukuran = 'sedang',
  memuat = false,
  penuh = false,
  ikon: Ikon,
  type = 'button',
  disabled,
  className,
  children,
  ...sisa
}) {
  return (
    <button
      type={type}
      disabled={disabled || memuat}
      aria-busy={memuat || undefined}
      className={gabungKelas(
        'inline-flex select-none items-center justify-center gap-2 font-bold transition-colors duration-150',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIAN[varian],
        UKURAN[ukuran],
        penuh && 'w-full',
        className,
      )}
      {...sisa}
    >
      {memuat ? (
        <LoaderCircle className="size-4 shrink-0 animate-spin" aria-hidden="true" />
      ) : (
        Ikon && <Ikon className="size-4 shrink-0" aria-hidden="true" />
      )}
      {children}
    </button>
  )
}
