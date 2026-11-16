import { Link } from 'react-router-dom'
import { CalendarDays, PackageCheck } from 'lucide-react'
import KepalaHalaman from '../komponen/tataletak/KepalaHalaman.jsx'
import KartuStatistik from '../komponen/umum/KartuStatistik.jsx'
import Skeleton, { SkeletonDaftar } from '../komponen/umum/Skeleton.jsx'
import { BadgeStok, LencanaJumlah } from '../komponen/umum/Lencana.jsx'
import { StatusGalat, StatusKosong } from '../komponen/umum/StatusData.jsx'
import GrafikOmzet from '../komponen/laporan/GrafikOmzet.jsx'
import TabelTerlaris from '../komponen/laporan/TabelTerlaris.jsx'
import { gunakanAuth } from '../hook/gunakanAuth.js'
import { gunakanProdukTerlaris, gunakanRingkasan, gunakanTrenMingguan } from '../hook/gunakanLaporan.js'
import { gunakanDaftarProduk, gunakanStokMenipis } from '../hook/gunakanProduk.js'
import { formatAngka, formatRupiah } from '../utilitas/formatRupiah.js'
import { formatTanggalPanjang, geserHari, hariIniIso } from '../utilitas/formatTanggal.js'
import { PER_HALAMAN_KASIR } from '../utilitas/konstanta.js'

const MAKS_STOK_MENIPIS = 6

function KartuStokMenipis() {
  const { data = [], isPending, error, refetch } = gunakanStokMenipis()
  return (
    <section className="rounded-3xl bg-kuning p-5 lg:p-6" aria-labelledby="judul-menipis">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="judul-menipis" className="text-base font-bold text-tinta">
          Stok Menipis
        </h2>
        <LencanaJumlah jumlah={data.length} className="h-7 min-w-12" />
      </div>
      {isPending ? (
        <SkeletonDaftar jumlah={4} tinggi="h-11" />
      ) : error ? (
        <StatusGalat galat={error} saatCobaLagi={refetch} />
      ) : data.length === 0 ? (
        <StatusKosong ikon={PackageCheck} judul="Semua stok aman" pesan="Tidak ada produk di bawah batas minimum." />
      ) : (
        <>
          <ul className="flex flex-col">
            {data.slice(0, MAKS_STOK_MENIPIS).map((produk) => (
              <li key={produk._id} className="flex items-center justify-between gap-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-tinta">{produk.nama}</p>
                  <p className="angka text-xs text-zaitun">
                    Sisa {produk.stok} {produk.satuan}
                  </p>
                </div>
                <BadgeStok status={produk.statusStok} />
              </li>
            ))}
          </ul>
          <Link to="/produk?tab=menipis" className="mt-3 inline-flex min-h-11 items-center text-sm font-bold text-cokelat hover:underline">
            {data.length > MAKS_STOK_MENIPIS ? `Lihat semua (${data.length})` : 'Kelola stok menipis'} ›
          </Link>
        </>
      )}
    </section>
  )
}

export default function Dashboard() {
  const { pengguna } = gunakanAuth()
  const hariIni = hariIniIso()
  const rentangMinggu = { tanggalMulai: geserHari(hariIni, -6), tanggalAkhir: hariIni, limit: 10 }

  const ringkasan = gunakanRingkasan()
  const tren = gunakanTrenMingguan()
  const terlaris = gunakanProdukTerlaris(rentangMinggu)
  const produk = gunakanDaftarProduk({ perHalaman: PER_HALAMAN_KASIR })

  const petaStok = new Map((produk.data?.data ?? []).map((p) => [p._id, p.stok]))
  const r = ringkasan.data
  const namaPanggilan = pengguna.nama.replace(/\s*\(.*\)$/, '').replace(/^(Pak|Bu|Ibu|Bapak)\s+/i, '')

  return (
    <>
      <KepalaHalaman sapaan={`Halo, ${namaPanggilan}!`} judul="Dashboard" polos />

      {ringkasan.error ? (
        <div className="mb-6 rounded-3xl bg-kuning">
          <StatusGalat galat={ringkasan.error} saatCobaLagi={ringkasan.refetch} />
        </div>
      ) : (
        <div className="mb-5 grid grid-cols-2 gap-3 lg:mb-6 lg:grid-cols-4 lg:gap-5">
          <KartuStatistik label="Omzet hari ini" nilai={formatRupiah(r?.omzetHariIni)} memuat={ringkasan.isPending} keterangan={r && r.jumlahTransaksiHariIni === 0 ? 'Belum ada transaksi hari ini' : undefined} className="col-span-2 lg:col-span-1" />
          <KartuStatistik label="Transaksi hari ini" nilai={formatAngka(r?.jumlahTransaksiHariIni)} memuat={ringkasan.isPending} />
          <KartuStatistik label="Rata-rata / transaksi" nilai={formatRupiah(r?.rataRataNilaiTransaksi)} memuat={ringkasan.isPending} />
          <KartuStatistik label="Produk stok menipis" nilai={formatAngka(r?.jumlahProdukStokMenipis)} memuat={ringkasan.isPending} tekanan={r?.jumlahProdukStokMenipis > 0} className="col-span-2 lg:col-span-1" />
        </div>
      )}

      <section className="rounded-3xl bg-kuning p-2 shadow-kartu" aria-labelledby="judul-tren">
        <div className="rounded-[20px] bg-krem px-4 pb-4 pt-5 lg:px-6">
          <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <h2 id="judul-tren" className="text-sm font-bold text-black">
              Total Omzet
            </h2>
            <span className="hidden h-4 w-px bg-pasir sm:block" aria-hidden="true" />
            <span className="flex items-center gap-1.5 text-xs text-jingga">
              <span className="size-1.5 rounded-full bg-jingga" aria-hidden="true" /> 7 hari ini
            </span>
            <span className="flex items-center gap-1.5 text-xs text-[#7f97c2]">
              <span className="size-1.5 rounded-full bg-[#9FB4D8]" aria-hidden="true" /> Minggu lalu
            </span>
            <span className="ml-auto inline-flex min-h-8 items-center gap-2 rounded-full bg-jingga px-3.5 text-xs font-semibold text-black">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              {formatTanggalPanjang(hariIni)}
            </span>
          </div>
          {tren.isPending ? (
            <Skeleton className="h-60 w-full" />
          ) : tren.error ? (
            <StatusGalat galat={tren.error} saatCobaLagi={tren.refetch} />
          ) : (
            <GrafikOmzet data={tren.tren} mode="mingguan" tinggi={240} />
          )}
        </div>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_20rem] 2xl:items-start">
        <section className="rounded-3xl bg-kuning p-4 shadow-kartu lg:p-5" aria-labelledby="judul-terlaris">
          <h2 id="judul-terlaris" className="mb-4 inline-flex min-h-8 items-center rounded-full bg-krem px-4 text-sm font-bold text-tinta shadow-kolom">
            Produk Terlaris · 7 hari
          </h2>
          <TabelTerlaris data={terlaris.data} memuat={terlaris.isPending} galat={terlaris.error} saatCobaLagi={terlaris.refetch} petaStok={petaStok} />
        </section>
        <KartuStokMenipis />
      </div>
    </>
  )
}
