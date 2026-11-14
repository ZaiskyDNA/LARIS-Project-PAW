import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, History } from 'lucide-react'
import KepalaHalaman from '../komponen/tataletak/KepalaHalaman.jsx'
import Tabel from '../komponen/umum/Tabel.jsx'
import { Lencana } from '../komponen/umum/Lencana.jsx'
import { StatusKosong } from '../komponen/umum/StatusData.jsx'
import { gunakanMutasiStok, gunakanProduk } from '../hook/gunakanProduk.js'
import { TIPE_MUTASI } from '../utilitas/konstanta.js'
import { formatTanggalJamPendek } from '../utilitas/formatTanggal.js'
import { gabungKelas } from '../utilitas/gabungKelas.js'

const awalKapital = (teks = '') => teks.charAt(0).toUpperCase() + teks.slice(1)

const teksAlasan = (mutasi) => {
  if (mutasi.alasan === 'penjualan') return 'Penjualan'
  const alasan = awalKapital(mutasi.alasan)
  return mutasi.catatan ? `${alasan} — ${mutasi.catatan}` : alasan
}

// Arah perubahan dibaca dari stok sebelum/sesudah, bukan dari tipe
const teksJumlah = (mutasi) => (mutasi.stokSesudah >= mutasi.stokSebelum ? `+${mutasi.jumlah}` : `−${mutasi.jumlah}`)

function LencanaTipe({ tipe }) {
  const konfigurasi = TIPE_MUTASI[tipe] ?? TIPE_MUTASI.koreksi
  return <Lencana kelas={konfigurasi.kelas}>{konfigurasi.label}</Lencana>
}

const KOLOM = [
  { kunci: 'waktu', judul: 'Waktu', render: (m) => formatTanggalJamPendek(m.createdAt), kelas: 'angka whitespace-nowrap' },
  { kunci: 'tipe', judul: 'Tipe', render: (m) => <LencanaTipe tipe={m.tipe} /> },
  { kunci: 'jumlah', judul: 'Jumlah', render: (m) => <span className="font-bold">{teksJumlah(m)}</span>, kelas: 'angka' },
  { kunci: 'stok', judul: 'Stok', render: (m) => `${m.stokSebelum} → ${m.stokSesudah}`, kelas: 'angka whitespace-nowrap' },
  { kunci: 'alasan', judul: 'Alasan', render: teksAlasan },
  { kunci: 'oleh', judul: 'Oleh', render: (m) => m.userId?.nama ?? '–' },
]

export default function RiwayatMutasi() {
  const { id } = useParams()
  const produk = gunakanProduk(id)
  const mutasi = gunakanMutasiStok(id)
  const keterangan = produk.data ? `${produk.data.nama} · Stok saat ini: ${produk.data.stok}` : produk.isPending ? 'Memuat produk…' : undefined

  return (
    <>
      <KepalaHalaman
        judul="Riwayat Mutasi"
        keterangan={keterangan}
        kembali="/produk"
        aksi={
          <Link to="/produk" className="hidden min-h-11 items-center gap-1 rounded-xl bg-kuning px-8 text-sm font-bold text-tinta transition-colors hover:bg-kuning-tua lg:inline-flex">
            <ChevronLeft className="size-4" strokeWidth={3} aria-hidden="true" /> Kembali
          </Link>
        }
      />
      <Tabel
        kolom={KOLOM}
        data={mutasi.data}
        memuat={mutasi.isPending}
        galat={mutasi.error}
        saatCobaLagi={mutasi.refetch}
        kosong={<StatusKosong ikon={History} judul="Belum ada mutasi stok" pesan="Penjualan, stok masuk, dan koreksi opname produk ini akan tercatat di sini." />}
        renderKartu={(m) => (
          <div className="flex items-start justify-between gap-3 rounded-2xl bg-kuning px-5 py-4">
            <div className="min-w-0">
              <LencanaTipe tipe={m.tipe} />
              <p className="mt-2 text-sm font-bold text-tinta">{teksAlasan(m)}</p>
              <p className="angka text-xs text-zaitun">
                {formatTanggalJamPendek(m.createdAt)} · {m.userId?.nama ?? '–'}
              </p>
            </div>
            <p className={gabungKelas('angka shrink-0 text-xl font-extrabold text-tinta')}>{teksJumlah(m)}</p>
          </div>
        )}
      />
    </>
  )
}
