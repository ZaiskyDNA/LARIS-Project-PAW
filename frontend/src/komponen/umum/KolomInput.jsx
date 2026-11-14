import { useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { gabungKelas } from '../../utilitas/gabungKelas.js'
import { formatAngka, hanyaAngka } from '../../utilitas/formatRupiah.js'

const KELAS_DASAR =
  'w-full min-h-11 rounded-xl px-4 text-sm text-tinta placeholder:text-khaki shadow-kolom ' +
  'transition-shadow focus:outline-2 focus:outline-offset-0 focus:outline-jingga ' +
  'disabled:cursor-not-allowed disabled:opacity-60 read-only:cursor-default'

const WARNA = { kuning: 'bg-kuning', krem: 'bg-krem' }

// Pembungkus label + pesan galat/bantuan yang dipakai semua jenis kolom
export function BingkaiKolom({ id, label, galat, bantuan, className, children }) {
  return (
    <div className={gabungKelas('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-bold text-tinta">
          {label}
        </label>
      )}
      {children}
      {galat ? (
        <p id={`${id}-galat`} role="alert" className="text-xs font-semibold text-merah">
          {galat}
        </p>
      ) : (
        bantuan && <p className="text-xs text-zaitun">{bantuan}</p>
      )}
    </div>
  )
}

const propAria = (id, galat) => ({
  'aria-invalid': galat ? true : undefined,
  'aria-describedby': galat ? `${id}-galat` : undefined,
})

export function KolomInput({ label, galat, bantuan, warna = 'kuning', className, kelasInput, akhiran, ref, ...sisa }) {
  const idBawaan = useId()
  const id = sisa.id || idBawaan
  return (
    <BingkaiKolom id={id} label={label} galat={galat} bantuan={bantuan} className={className}>
      <div className="relative">
        <input
          ref={ref}
          id={id}
          className={gabungKelas(KELAS_DASAR, WARNA[warna], akhiran && 'pr-12', galat && 'outline-2 outline-merah', kelasInput)}
          {...propAria(id, galat)}
          {...sisa}
        />
        {akhiran && <div className="absolute inset-y-0 right-1 flex items-center">{akhiran}</div>}
      </div>
    </BingkaiKolom>
  )
}

export function KolomPilih({ label, galat, bantuan, warna = 'kuning', className, children, ref, ...sisa }) {
  const idBawaan = useId()
  const id = sisa.id || idBawaan
  return (
    <BingkaiKolom id={id} label={label} galat={galat} bantuan={bantuan} className={className}>
      <div className="relative">
        <select
          ref={ref}
          id={id}
          className={gabungKelas(KELAS_DASAR, WARNA[warna], 'appearance-none pr-10', galat && 'outline-2 outline-merah')}
          {...propAria(id, galat)}
          {...sisa}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-zaitun" aria-hidden="true" />
      </div>
    </BingkaiKolom>
  )
}

// Kolom angka bulat dengan pemisah ribuan; nilai keluar berupa number atau ''
export function KolomAngka({ label, galat, bantuan, warna = 'kuning', className, kelasInput, awalan, value, onChange, ref, ...sisa }) {
  const idBawaan = useId()
  const id = sisa.id || idBawaan
  const tampil = value === '' || value == null ? '' : formatAngka(value)
  return (
    <BingkaiKolom id={id} label={label} galat={galat} bantuan={bantuan} className={className}>
      <div className="relative">
        {awalan && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zaitun">{awalan}</span>
        )}
        <input
          ref={ref}
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={tampil}
          onChange={(peristiwa) => onChange(hanyaAngka(peristiwa.target.value))}
          className={gabungKelas(KELAS_DASAR, WARNA[warna], 'angka', awalan && 'pl-11', galat && 'outline-2 outline-merah', kelasInput)}
          {...propAria(id, galat)}
          {...sisa}
        />
      </div>
    </BingkaiKolom>
  )
}
