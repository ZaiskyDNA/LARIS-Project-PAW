import { useEffect, useRef, useState } from 'react'
import { CalendarDays, ChevronDown } from 'lucide-react'
import Tombol from './Tombol.jsx'
import { gabungKelas } from '../../utilitas/gabungKelas.js'
import { awalBulanIso, formatRentang, formatTanggal, geserHari, hariIniIso, selisihHari } from '../../utilitas/formatTanggal.js'

const KELAS_INPUT = 'min-h-11 w-full rounded-xl bg-kuning px-3 text-sm text-tinta shadow-kolom focus:outline-2 focus:outline-jingga'
const MAKS_HARI = 365

const pintasan = () => {
  const hariIni = hariIniIso()
  return [
    { label: 'Hari ini', mulai: hariIni, akhir: hariIni },
    { label: '7 hari', mulai: geserHari(hariIni, -6), akhir: hariIni },
    { label: 'Bulan ini', mulai: awalBulanIso(hariIni), akhir: hariIni },
    { label: '30 hari', mulai: geserHari(hariIni, -29), akhir: hariIni },
  ]
}

// Pil jingga berisi rentang tanggal; diklik untuk membuka panel pemilihan
export default function PilihTanggal({ tanggalMulai, tanggalAkhir, saatUbah, className, rataPanel = 'kiri' }) {
  const [buka, setBuka] = useState(false)
  const [draf, setDraf] = useState({ mulai: tanggalMulai, akhir: tanggalAkhir })
  const refAkar = useRef(null)
  const hariIni = hariIniIso()

  useEffect(() => {
    if (!buka) return undefined
    const tutupBilaDiLuar = (peristiwa) => {
      if (!refAkar.current?.contains(peristiwa.target)) setBuka(false)
    }
    const tutupBilaEscape = (peristiwa) => peristiwa.key === 'Escape' && setBuka(false)
    document.addEventListener('pointerdown', tutupBilaDiLuar)
    document.addEventListener('keydown', tutupBilaEscape)
    return () => {
      document.removeEventListener('pointerdown', tutupBilaDiLuar)
      document.removeEventListener('keydown', tutupBilaEscape)
    }
  }, [buka])

  const bukaPanel = () => {
    setDraf({ mulai: tanggalMulai, akhir: tanggalAkhir })
    setBuka((nilai) => !nilai)
  }

  const terapkan = (mulai, akhir) => {
    saatUbah({ tanggalMulai: mulai, tanggalAkhir: akhir })
    setBuka(false)
  }

  let galat = null
  if (!draf.mulai || !draf.akhir) galat = 'Kedua tanggal wajib diisi'
  else if (draf.mulai > draf.akhir) galat = 'Tanggal mulai tidak boleh melewati tanggal akhir'
  else if (selisihHari(draf.mulai, draf.akhir) > MAKS_HARI) galat = 'Rentang maksimal 365 hari'

  const teksPil =
    tanggalMulai === tanggalAkhir
      ? `${tanggalMulai === hariIni ? 'Hari ini · ' : ''}${formatTanggal(tanggalMulai)}`
      : formatRentang(tanggalMulai, tanggalAkhir)

  return (
    <div ref={refAkar} className={gabungKelas('relative', className)}>
      <button
        type="button"
        onClick={bukaPanel}
        aria-haspopup="dialog"
        aria-expanded={buka}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-jingga px-6 text-sm font-bold text-black transition-colors hover:bg-jingga-tua"
      >
        <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
        <span className="truncate">{teksPil}</span>
        <ChevronDown className={gabungKelas('size-4 shrink-0 transition-transform', buka && 'rotate-180')} aria-hidden="true" />
      </button>

      {buka && (
        <div
          role="dialog"
          aria-label="Pilih rentang tanggal"
          className={gabungKelas(
            'absolute top-full z-30 mt-2 w-[min(20rem,calc(100vw-2rem))] animate-muncul rounded-2xl border border-kuning-tua bg-latar p-4 shadow-kartu',
            rataPanel === 'kanan' ? 'right-0' : 'left-0',
          )}
        >
          <div className="flex flex-wrap gap-2">
            {pintasan().map((p) => (
              <button key={p.label} type="button" onClick={() => terapkan(p.mulai, p.akhir)} className="min-h-9 rounded-full bg-kuning px-3.5 text-xs font-bold text-tinta hover:bg-kuning-tua">
                {p.label}
              </button>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-xs font-bold text-tinta">
              Dari
              <input type="date" value={draf.mulai} max={hariIni} onChange={(e) => setDraf((d) => ({ ...d, mulai: e.target.value }))} className={KELAS_INPUT} />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-bold text-tinta">
              Sampai
              <input type="date" value={draf.akhir} max={hariIni} onChange={(e) => setDraf((d) => ({ ...d, akhir: e.target.value }))} className={KELAS_INPUT} />
            </label>
          </div>
          {galat && (
            <p role="alert" className="mt-2 text-xs font-semibold text-merah">
              {galat}
            </p>
          )}
          <Tombol penuh className="mt-4" disabled={Boolean(galat)} onClick={() => terapkan(draf.mulai, draf.akhir)}>
            Terapkan
          </Tombol>
        </div>
      )}
    </div>
  )
}
