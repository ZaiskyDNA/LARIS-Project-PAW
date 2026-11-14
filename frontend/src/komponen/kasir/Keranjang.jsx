import { useState } from 'react'
import { Minus, Plus, ShoppingBasket, Trash2 } from 'lucide-react'
import Tombol from '../umum/Tombol.jsx'
import { StatusKosong } from '../umum/StatusData.jsx'
import { formatRupiah } from '../../utilitas/formatRupiah.js'
import { gabungKelas } from '../../utilitas/gabungKelas.js'

const KELAS_TOMBOL_QTY = 'flex size-11 items-center justify-center rounded-full bg-latar text-tinta transition-colors hover:bg-krem disabled:cursor-not-allowed disabled:opacity-40'

function BarisKeranjang({ item, terkunci, saatUbahQty, saatHapus }) {
  // `draf` hanya terisi selama kasir mengetik; di luar itu kolom mengikuti kuantitas keranjang
  const [draf, setDraf] = useState(null)
  const [pesan, setPesan] = useState(null)
  const melebihiStok = item.qty > item.stok

  const terapkan = (qty) => {
    const terpangkas = saatUbahQty(item.productId, qty)
    setPesan(terpangkas ? `Kuantitas melebihi stok (tersisa ${item.stok})` : null)
  }

  const selesaiKetik = () => {
    const angka = parseInt(draf, 10)
    if (!Number.isNaN(angka) && angka >= 1) terapkan(angka)
    setDraf(null)
  }

  const diBatas = item.qty >= item.stok

  return (
    <li className="py-3">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 text-sm font-bold leading-5 text-tinta">{item.nama}</p>
        <p className="angka shrink-0 text-sm font-bold text-tinta">{formatRupiah(item.harga * item.qty)}</p>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <button type="button" aria-label={`Kurangi ${item.nama}`} disabled={terkunci || item.qty <= 1} onClick={() => terapkan(item.qty - 1)} className={KELAS_TOMBOL_QTY}>
          <Minus className="size-4" strokeWidth={3} aria-hidden="true" />
        </button>
        <input
          type="text"
          inputMode="numeric"
          aria-label={`Kuantitas ${item.nama}`}
          value={draf ?? String(item.qty)}
          disabled={terkunci}
          onChange={(e) => setDraf(e.target.value.replace(/\D/g, '').slice(0, 5))}
          onFocus={(e) => e.currentTarget.select()}
          onBlur={selesaiKetik}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          className="angka h-11 w-14 rounded-xl bg-latar text-center text-sm font-bold text-tinta focus:outline-2 focus:outline-jingga"
        />
        <button type="button" aria-label={`Tambah ${item.nama}`} disabled={terkunci || diBatas} onClick={() => terapkan(item.qty + 1)} className={KELAS_TOMBOL_QTY}>
          <Plus className="size-4" strokeWidth={3} aria-hidden="true" />
        </button>
        <span className="angka ml-1 text-xs text-zaitun">× {formatRupiah(item.harga)}</span>
        <button type="button" aria-label={`Hapus ${item.nama} dari keranjang`} disabled={terkunci} onClick={() => saatHapus(item.productId)} className="ml-auto flex size-11 items-center justify-center rounded-full text-merah transition-colors hover:bg-merah-muda disabled:opacity-40">
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>
      {(pesan || melebihiStok || diBatas) && (
        <p role={pesan || melebihiStok ? 'alert' : undefined} className="angka mt-1 text-xs font-bold text-merah">
          {melebihiStok ? `Stok tidak lagi mencukupi (tersisa ${item.stok})` : (pesan ?? `Stok tersisa ${item.stok}`)}
        </p>
      )}
    </li>
  )
}

export default function Keranjang({ keranjang, terkunci = false, saatBayar, tanpaJudul = false, className }) {
  const { items, total, jumlahItem, adaMelebihiStok, ubahQty, hapus, kosongkan } = keranjang

  return (
    <section className={gabungKelas('flex min-h-0 flex-col', className)} aria-label="Keranjang">
      {!tanpaJudul && <h2 className="text-xl font-extrabold tracking-tight text-tinta">Keranjang</h2>}
      {items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <StatusKosong ikon={ShoppingBasket} judul="Keranjang masih kosong" pesan="Ketuk produk untuk menambahkannya." />
        </div>
      ) : (
        <ul className="-mr-2 min-h-0 flex-1 divide-y divide-kuning-tua overflow-y-auto pr-2">
          {items.map((item) => (
            <BarisKeranjang key={item.productId} item={item} terkunci={terkunci} saatUbahQty={ubahQty} saatHapus={hapus} />
          ))}
        </ul>
      )}
      <div className="mt-3 shrink-0 border-t-2 border-kuning-tua pt-5">
        <div className="mb-5 flex items-baseline justify-between gap-3">
          <span className="text-base font-bold text-tinta">
            Total <span className="angka text-xs font-semibold text-zaitun">· {jumlahItem} item</span>
          </span>
          <span className="angka text-[28px] font-extrabold leading-none tracking-tight text-tinta" aria-live="polite">
            {formatRupiah(total)}
          </span>
        </div>
        <Tombol ukuran="besar" penuh className="min-h-15 rounded-xl text-lg" disabled={items.length === 0 || adaMelebihiStok || terkunci} onClick={saatBayar}>
          Bayar
        </Tombol>
        <button type="button" onClick={kosongkan} disabled={items.length === 0 || terkunci} className="mx-auto mt-3 flex min-h-11 items-center px-4 text-xs font-bold text-merah hover:underline disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline">
          Kosongkan keranjang
        </button>
      </div>
    </section>
  )
}
