import { Search, X } from 'lucide-react'
import { gabungKelas } from '../../utilitas/gabungKelas.js'

export default function KolomCari({ nilai, saatUbah, placeholder = 'Cari…', label = 'Cari', className, ...sisa }) {
  return (
    <div className={gabungKelas('relative', className)}>
      <Search className="pointer-events-none absolute left-5 top-1/2 size-4 -translate-y-1/2 text-khaki" aria-hidden="true" />
      <input
        type="search"
        value={nilai}
        onChange={(peristiwa) => saatUbah(peristiwa.target.value)}
        placeholder={placeholder}
        aria-label={label}
        autoComplete="off"
        className="min-h-12 w-full rounded-full bg-kuning pl-12 pr-12 text-sm text-tinta placeholder:text-khaki focus:outline-2 focus:outline-offset-0 focus:outline-jingga [&::-webkit-search-cancel-button]:hidden"
        {...sisa}
      />
      {nilai && (
        <button type="button" aria-label="Hapus pencarian" onClick={() => saatUbah('')} className="absolute right-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-zaitun hover:bg-kuning-tua">
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
