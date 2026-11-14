import { gabungKelas } from '../../utilitas/gabungKelas.js'

// Deretan pil pilihan (tab / filter kategori) seperti pada desain
export default function PilTab({ pilihan, aktif, saatPilih, label, className }) {
  return (
    <div role="tablist" aria-label={label} className={gabungKelas('flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden', className)}>
      {pilihan.map(({ nilai, label: teks, akhiran }) => {
        const terpilih = nilai === aktif
        return (
          <button
            key={nilai}
            type="button"
            role="tab"
            aria-selected={terpilih}
            onClick={() => saatPilih(nilai)}
            className={gabungKelas(
              'inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-6 text-sm font-bold transition-colors',
              terpilih ? 'bg-jingga text-black' : 'bg-kuning text-tinta hover:bg-kuning-tua',
            )}
          >
            {teks}
            {akhiran}
          </button>
        )
      })}
    </div>
  )
}
