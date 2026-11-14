import { PackageOpen, RefreshCw, TriangleAlert, WifiOff } from 'lucide-react'
import Tombol from './Tombol.jsx'
import { uraikanGalat } from '../../utilitas/galatApi.js'

export function StatusKosong({ ikon: Ikon = PackageOpen, judul, pesan, aksi }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <div className="mb-1 flex size-14 items-center justify-center rounded-full bg-persik text-cokelat">
        <Ikon className="size-7" aria-hidden="true" />
      </div>
      <p className="text-base font-bold text-tinta">{judul}</p>
      {pesan && <p className="max-w-sm text-sm text-zaitun">{pesan}</p>}
      {aksi && <div className="mt-3">{aksi}</div>}
    </div>
  )
}

export function StatusGalat({ galat, saatCobaLagi }) {
  const { pesan, kode } = uraikanGalat(galat)
  const Ikon = kode === 'JARINGAN' ? WifiOff : TriangleAlert
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <div className="mb-1 flex size-14 items-center justify-center rounded-full bg-merah-muda text-merah">
        <Ikon className="size-7" aria-hidden="true" />
      </div>
      <p className="text-base font-bold text-tinta">Data gagal dimuat</p>
      <p className="max-w-sm text-sm text-zaitun">{pesan}</p>
      {saatCobaLagi && (
        <Tombol varian="sekunder" ikon={RefreshCw} onClick={saatCobaLagi} className="mt-3 border border-kuning-tua">
          Coba lagi
        </Tombol>
      )}
    </div>
  )
}
