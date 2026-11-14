import { Plus, SearchX } from 'lucide-react'
import Skeleton from '../umum/Skeleton.jsx'
import { StatusGalat, StatusKosong } from '../umum/StatusData.jsx'
import { formatRupiah } from '../../utilitas/formatRupiah.js'
import { gabungKelas } from '../../utilitas/gabungKelas.js'

const KELAS_GRID = 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-4 xl:grid-cols-4'

function KartuProduk({ produk, qtyDiKeranjang, saatPilih }) {
  const habis = produk.stok === 0
  const menipis = produk.statusStok === 'menipis'
  return (
    <button
      type="button"
      onClick={() => saatPilih(produk)}
      aria-disabled={habis}
      aria-label={`${produk.nama}, ${formatRupiah(produk.harga)}, ${habis ? 'stok habis' : `stok ${produk.stok}`}`}
      className={gabungKelas(
        'relative flex h-full w-full flex-col rounded-3xl p-3 text-left transition-all duration-150',
        habis ? 'cursor-not-allowed bg-pasir' : 'bg-kuning hover:-translate-y-0.5 hover:shadow-kartu active:translate-y-0 active:bg-kuning-tua',
      )}
    >
      <span className={gabungKelas('flex h-14 w-full items-center justify-center rounded-2xl text-2xl font-extrabold lg:h-16', habis ? 'bg-latar/70 text-khaki' : 'bg-latar text-kuning-tua')} aria-hidden="true">
        {produk.nama.charAt(0).toUpperCase()}
      </span>
      <span className="mt-2.5 line-clamp-2 min-h-10 px-0.5 text-sm font-bold leading-5 text-tinta">{produk.nama}</span>
      <span className="angka mt-0.5 px-0.5 text-sm font-bold text-cokelat">{formatRupiah(produk.harga)}</span>
      <span className={gabungKelas('angka mt-0.5 px-0.5 text-xs font-bold', habis || menipis ? 'text-merah' : 'text-tinta')}>
        {habis ? 'Habis' : `Stok ${produk.stok}`}
      </span>
      {qtyDiKeranjang > 0 ? (
        <span className="angka absolute right-2 top-2 flex h-7 min-w-7 items-center justify-center rounded-full bg-jingga px-1.5 text-xs font-bold text-black shadow">
          {qtyDiKeranjang}
        </span>
      ) : (
        !habis && (
          <span className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-kuning text-zaitun" aria-hidden="true">
            <Plus className="size-4" strokeWidth={3} />
          </span>
        )
      )}
    </button>
  )
}

export default function GridProduk({ kueri, petaQty, adaFilter, saatPilih }) {
  if (kueri.isPending) {
    return (
      <div className={KELAS_GRID} role="status" aria-label="Memuat produk">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-40 rounded-3xl" />
        ))}
      </div>
    )
  }
  if (kueri.error) return <StatusGalat galat={kueri.error} saatCobaLagi={kueri.refetch} />

  const daftar = kueri.data?.data ?? []
  if (daftar.length === 0) {
    return adaFilter ? (
      <StatusKosong ikon={SearchX} judul="Produk tidak ditemukan" pesan="Coba kata kunci atau kategori lain." />
    ) : (
      <StatusKosong judul="Belum ada produk" pesan="Minta pemilik toko menambahkan produk terlebih dahulu." />
    )
  }

  return (
    <ul className={gabungKelas(KELAS_GRID, kueri.isPlaceholderData && 'opacity-60')}>
      {daftar.map((produk) => (
        <li key={produk._id}>
          <KartuProduk produk={produk} qtyDiKeranjang={petaQty.get(produk._id) ?? 0} saatPilih={saatPilih} />
        </li>
      ))}
    </ul>
  )
}
