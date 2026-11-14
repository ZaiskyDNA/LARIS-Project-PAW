import { Link } from 'react-router-dom'
import { Plus, SearchX } from 'lucide-react'
import Tabel from '../umum/Tabel.jsx'
import { BadgeStok } from '../umum/Lencana.jsx'
import { StatusKosong } from '../umum/StatusData.jsx'
import { formatAngka, formatRupiah } from '../../utilitas/formatRupiah.js'

const KELAS_DASAR_AKSI = 'rounded px-1 py-1 font-bold hover:underline'
const KELAS_AKSI = `${KELAS_DASAR_AKSI} text-cokelat`
const KELAS_TAUTAN_TAMBAH = 'inline-flex min-h-11 items-center gap-2 rounded-xl bg-jingga px-5 text-sm font-bold text-black hover:bg-jingga-tua'

function Aksi({ produk, saatOpname, saatHapus }) {
  return (
    <span className="inline-flex items-center justify-center whitespace-nowrap text-xs">
      <Link to={`/produk/${produk._id}/ubah`} className={KELAS_AKSI}>
        Ubah
      </Link>
      <span aria-hidden="true" className="text-cokelat">·</span>
      <button type="button" onClick={() => saatOpname(produk)} className={KELAS_AKSI}>
        Opname
      </button>
      <span aria-hidden="true" className="text-cokelat">·</span>
      <Link to={`/produk/${produk._id}/mutasi`} className={KELAS_AKSI}>
        Mutasi
      </Link>
      <span aria-hidden="true" className="text-cokelat">·</span>
      <button type="button" onClick={() => saatHapus(produk)} className={`${KELAS_DASAR_AKSI} text-merah`} aria-label={`Hapus ${produk.nama}`}>
        Hapus
      </button>
    </span>
  )
}

export default function TabelProduk({ kueri, nomorAwal, adaFilter, saatOpname, saatHapus, saatPilihKartu, kaki }) {
  const kolom = [
    { kunci: 'no', judul: 'No.', render: (_, nomor) => nomor, kelas: 'w-14 angka' },
    { kunci: 'nama', judul: 'Nama Produk', render: (p) => <span className="font-semibold">{p.nama}</span> },
    { kunci: 'kategori', judul: 'Kategori' },
    { kunci: 'harga', judul: 'Harga', render: (p) => formatRupiah(p.harga), kelas: 'angka' },
    { kunci: 'stok', judul: 'Stok', render: (p) => formatAngka(p.stok), kelas: 'angka' },
    { kunci: 'status', judul: 'Status', render: (p) => <BadgeStok status={p.statusStok} /> },
    { kunci: 'aksi', judul: 'Aksi', render: (p) => <Aksi produk={p} saatOpname={saatOpname} saatHapus={saatHapus} /> },
  ]

  const kosong = adaFilter ? (
    <StatusKosong ikon={SearchX} judul="Produk tidak ditemukan" pesan="Coba kata kunci lain atau ubah filter kategori." />
  ) : (
    <StatusKosong
      judul="Belum ada produk"
      pesan="Tambahkan produk pertama agar bisa dijual di kasir."
      aksi={
        <Link to="/produk/tambah" className={KELAS_TAUTAN_TAMBAH}>
          <Plus className="size-4" aria-hidden="true" /> Tambah Produk
        </Link>
      }
    />
  )

  return (
    <Tabel
      kolom={kolom}
      data={kueri.data?.data}
      memuat={kueri.isPending}
      galat={kueri.error}
      saatCobaLagi={kueri.refetch}
      nomorAwal={nomorAwal}
      kosong={kosong}
      kaki={kaki}
      renderKartu={(p) => (
        <button type="button" onClick={() => saatPilihKartu(p)} className="flex w-full items-center justify-between gap-3 rounded-2xl bg-kuning px-5 py-4 text-left transition-colors hover:bg-kuning-tua">
          <span className="min-w-0">
            <span className="block truncate text-base font-bold text-tinta">{p.nama}</span>
            <span className="angka block text-xs text-tinta">
              {p.kategori} · {formatRupiah(p.harga)}
            </span>
          </span>
          <span className="flex shrink-0 flex-col items-center gap-1.5">
            <BadgeStok status={p.statusStok} />
            <span className="angka text-xs font-bold text-tinta">Stok {formatAngka(p.stok)}</span>
          </span>
        </button>
      )}
    />
  )
}
