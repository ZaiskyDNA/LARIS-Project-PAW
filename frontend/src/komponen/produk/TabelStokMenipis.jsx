import { Link } from 'react-router-dom'
import { PackageCheck } from 'lucide-react'
import Tabel from '../umum/Tabel.jsx'
import Tombol from '../umum/Tombol.jsx'
import { BadgeStok } from '../umum/Lencana.jsx'
import { StatusKosong } from '../umum/StatusData.jsx'
import { formatAngka } from '../../utilitas/formatRupiah.js'
import { gabungKelas } from '../../utilitas/gabungKelas.js'

const KELAS_AKSI = 'rounded px-1 py-1 font-bold text-cokelat hover:underline'

export default function TabelStokMenipis({ kueri, saatOpname }) {
  const data = kueri.data ?? []
  const jumlahHabis = data.filter((p) => p.stok === 0).length

  const kolom = [
    { kunci: 'no', judul: 'No.', render: (_, nomor) => nomor, kelas: 'w-14 angka' },
    { kunci: 'nama', judul: 'Nama Produk', render: (p) => <span className="font-semibold">{p.nama}</span> },
    { kunci: 'kategori', judul: 'Kategori' },
    { kunci: 'stok', judul: 'Stok', render: (p) => formatAngka(p.stok), kelas: 'angka' },
    { kunci: 'stokMinimum', judul: 'Minimum', render: (p) => formatAngka(p.stokMinimum), kelas: 'angka' },
    { kunci: 'status', judul: 'Status', render: (p) => <BadgeStok status={p.statusStok} /> },
    {
      kunci: 'aksi',
      judul: 'Aksi',
      render: (p) => (
        <span className="inline-flex items-center whitespace-nowrap text-xs">
          <button type="button" onClick={() => saatOpname(p)} className={KELAS_AKSI}>
            Opname
          </button>
          <span aria-hidden="true" className="text-cokelat">·</span>
          <Link to={`/produk/${p._id}/mutasi`} className={KELAS_AKSI}>
            Mutasi
          </Link>
        </span>
      ),
    },
  ]

  return (
    <>
      {data.length > 0 && (
        <p role="status" className="mb-4 rounded-2xl bg-persik px-6 py-3.5 text-sm font-bold text-cokelat">
          {data.length} produk perlu restock.{jumlahHabis > 0 && ` ${jumlahHabis} produk sudah habis.`}
        </p>
      )}
      <Tabel
        kolom={kolom}
        data={data}
        memuat={kueri.isPending}
        galat={kueri.error}
        saatCobaLagi={kueri.refetch}
        kosong={<StatusKosong ikon={PackageCheck} judul="Semua stok aman" pesan="Tidak ada produk dengan stok di bawah batas minimum." />}
        renderKartu={(p) => (
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-kuning px-5 py-4">
            <Link to={`/produk/${p._id}/mutasi`} className="min-w-0">
              <span className="block truncate text-base font-bold text-tinta">{p.nama}</span>
              <span className={gabungKelas('angka block text-xs font-bold', p.stok === 0 ? 'text-merah' : 'text-cokelat')}>
                Sisa {formatAngka(p.stok)} · Minimum {formatAngka(p.stokMinimum)}
              </span>
            </Link>
            <Tombol ukuran="kecil" onClick={() => saatOpname(p)} className="min-h-10 px-4">
              Opname
            </Tombol>
          </div>
        )}
      />
    </>
  )
}
