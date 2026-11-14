import { useMemo, useState } from 'react'
import Tombol from '../umum/Tombol.jsx'
import { KolomAngka } from '../umum/KolomInput.jsx'
import { formatRupiah, formatRupiahRingkas } from '../../utilitas/formatRupiah.js'
import { PECAHAN_UANG } from '../../utilitas/konstanta.js'
import { gabungKelas } from '../../utilitas/gabungKelas.js'

// Saran nominal: pembulatan total ke atas untuk tiap pecahan uang yang lazim
const saranNominal = (total) => {
  const saran = PECAHAN_UANG.map((pecahan) => Math.ceil(total / pecahan) * pecahan).filter((nominal) => nominal > total)
  return [...new Set(saran)].slice(0, 3)
}

export default function PanelTunai({ total, memuat, galat, saatSelesai }) {
  const [nominal, setNominal] = useState('')
  const saran = useMemo(() => saranNominal(total), [total])
  const terisi = nominal !== ''
  const kembalian = terisi ? nominal - total : 0
  const kurang = terisi && kembalian < 0

  const kirim = (peristiwa) => {
    peristiwa.preventDefault()
    if (terisi && !kurang) saatSelesai(nominal)
  }

  return (
    <form onSubmit={kirim} noValidate className="flex flex-col gap-5">
      <KolomAngka
        label="Uang diterima"
        awalan="Rp"
        placeholder="0"
        value={nominal}
        onChange={setNominal}
        disabled={memuat}
        autoFocus
        kelasInput="min-h-12 text-base font-bold"
        galat={kurang ? 'Nominal pembayaran kurang dari total' : undefined}
      />

      <div className="flex flex-wrap gap-2.5">
        <button type="button" disabled={memuat} onClick={() => setNominal(total)} className="min-h-11 flex-1 whitespace-nowrap rounded-full bg-kuning px-4 text-xs font-bold text-tinta transition-colors hover:bg-kuning-tua disabled:opacity-50">
          Uang pas
        </button>
        {saran.map((angka) => (
          <button key={angka} type="button" disabled={memuat} onClick={() => setNominal(angka)} className="angka min-h-11 flex-1 whitespace-nowrap rounded-full bg-kuning px-4 text-xs font-bold text-tinta transition-colors hover:bg-kuning-tua disabled:opacity-50">
            {formatRupiahRingkas(angka)}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4 rounded-2xl bg-kuning px-6 py-5" aria-live="polite">
        <span className="text-sm font-bold text-tinta">{kurang ? 'Kurang' : 'Kembalian'}</span>
        <span className={gabungKelas('angka text-[28px] font-extrabold leading-none tracking-tight', kurang ? 'text-merah' : 'text-hijau')}>
          {formatRupiah(Math.abs(kembalian))}
        </span>
      </div>

      {galat && (
        <p role="alert" className="rounded-xl bg-merah-muda px-4 py-3 text-sm font-semibold text-merah">
          {galat}
        </p>
      )}

      <Tombol type="submit" ukuran="besar" penuh memuat={memuat} disabled={!terisi || kurang} className="mb-2 min-h-15 rounded-xl text-lg">
        {memuat ? 'Menyimpan…' : 'Selesaikan Transaksi'}
      </Tombol>
    </form>
  )
}
