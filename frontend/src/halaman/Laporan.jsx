import { useMemo, useState } from 'react'
import { ChartNoAxesColumn } from 'lucide-react'
import KepalaHalaman from '../komponen/tataletak/KepalaHalaman.jsx'
import KartuStatistik from '../komponen/umum/KartuStatistik.jsx'
import PilihTanggal from '../komponen/umum/PilihTanggal.jsx'
import Tombol from '../komponen/umum/Tombol.jsx'
import Tabel from '../komponen/umum/Tabel.jsx'
import Skeleton from '../komponen/umum/Skeleton.jsx'
import { StatusGalat, StatusKosong } from '../komponen/umum/StatusData.jsx'
import GrafikOmzet from '../komponen/laporan/GrafikOmzet.jsx'
import TabelTerlaris from '../komponen/laporan/TabelTerlaris.jsx'
import { gunakanEkspor, gunakanOmzetHarian, gunakanProdukTerlaris, hitungTotal, lengkapiHari } from '../hook/gunakanLaporan.js'
import { formatAngka, formatRupiah } from '../utilitas/formatRupiah.js'
import { awalBulanIso, formatTanggal, hariIniIso } from '../utilitas/formatTanggal.js'

const KOLOM_HARIAN = [
  { kunci: 'tanggal', judul: 'Tanggal', render: (baris) => formatTanggal(baris.tanggal), kelas: 'angka' },
  { kunci: 'jumlahTransaksi', judul: 'Transaksi', render: (baris) => formatAngka(baris.jumlahTransaksi), kelas: 'angka' },
  { kunci: 'totalOmzet', judul: 'Omzet', render: (baris) => formatRupiah(baris.totalOmzet), kelas: 'angka' },
]

function TombolEkspor({ rentang, className }) {
  const { ekspor, formatBerjalan } = gunakanEkspor()
  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-3">
      <Tombol varian="sekunder" memuat={formatBerjalan === 'xlsx'} disabled={Boolean(formatBerjalan)} onClick={() => ekspor('xlsx', rentang)} className="min-h-12 lg:min-h-11 lg:px-7">
        Ekspor Excel
      </Tombol>
      <Tombol memuat={formatBerjalan === 'pdf'} disabled={Boolean(formatBerjalan)} onClick={() => ekspor('pdf', rentang)} className="min-h-12 lg:min-h-11 lg:px-7">
        Ekspor PDF
      </Tombol>
      </div>
    </div>
  )
}

export default function Laporan() {
  const [rentang, setRentang] = useState(() => {
    const hariIni = hariIniIso()
    return { tanggalMulai: awalBulanIso(hariIni), tanggalAkhir: hariIni }
  })

  const omzet = gunakanOmzetHarian(rentang)
  const terlaris = gunakanProdukTerlaris({ ...rentang, limit: 10 })

  const total = useMemo(() => hitungTotal(omzet.data), [omzet.data])
  const dataGrafik = useMemo(
    () => lengkapiHari(omzet.data, rentang.tanggalMulai, rentang.tanggalAkhir).map((baris) => ({ tanggal: baris.tanggal, omzet: baris.totalOmzet })),
    [omzet.data, rentang],
  )
  const kosong = !omzet.isPending && !omzet.error && total.jumlahTransaksi === 0
  const harianTerbaru = useMemo(() => [...(omzet.data ?? [])].reverse(), [omzet.data])

  return (
    <>
      <KepalaHalaman judul="Laporan" />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <PilihTanggal tanggalMulai={rentang.tanggalMulai} tanggalAkhir={rentang.tanggalAkhir} saatUbah={setRentang} className="lg:w-80" />
        <TombolEkspor rentang={rentang} className="hidden lg:block" />
      </div>

      {omzet.error ? (
        <div className="rounded-3xl bg-kuning">
          <StatusGalat galat={omzet.error} saatCobaLagi={omzet.refetch} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-6">
            <KartuStatistik label="Total Omzet" nilai={formatRupiah(total.totalOmzet)} memuat={omzet.isPending} className="col-span-2 lg:col-span-1" />
            <KartuStatistik label="Jumlah Transaksi" nilai={formatAngka(total.jumlahTransaksi)} memuat={omzet.isPending} />
            <KartuStatistik label="Rata-rata / Transaksi" nilai={formatRupiah(total.rataRata)} memuat={omzet.isPending} />
          </div>

          <section className="mt-5 rounded-3xl bg-kuning p-5 lg:mt-6 lg:p-6" aria-labelledby="judul-omzet-harian">
            <h2 id="judul-omzet-harian" className="mb-2 text-base font-bold text-tinta">
              Omzet Harian
            </h2>
            {omzet.isPending ? (
              <Skeleton className="h-64 w-full" />
            ) : kosong ? (
              <StatusKosong ikon={ChartNoAxesColumn} judul="Belum ada transaksi pada periode ini" pesan="Pilih rentang tanggal lain atau mulai catat penjualan di kasir." />
            ) : (
              <GrafikOmzet data={dataGrafik} />
            )}
          </section>
        </>
      )}

      <section className="mt-5 rounded-3xl bg-kuning p-5 lg:mt-6 lg:p-6" aria-labelledby="judul-terlaris">
        <h2 id="judul-terlaris" className="mb-3 text-base font-bold text-tinta">
          Produk Terlaris
        </h2>
        <TabelTerlaris data={terlaris.data} memuat={terlaris.isPending} galat={terlaris.error} saatCobaLagi={terlaris.refetch} />
      </section>

      {!omzet.error && !kosong && (
        <section className="mt-5 rounded-3xl bg-kuning p-5 lg:mt-6 lg:p-6" aria-labelledby="judul-rincian">
          <h2 id="judul-rincian" className="mb-3 text-base font-bold text-tinta">
            Rincian per Hari
          </h2>
          <Tabel kolom={KOLOM_HARIAN} data={harianTerbaru} kunciBaris={(baris) => baris.tanggal} memuat={omzet.isPending} polos />
        </section>
      )}

      <TombolEkspor rentang={rentang} className="mt-5 lg:hidden" />
    </>
  )
}
