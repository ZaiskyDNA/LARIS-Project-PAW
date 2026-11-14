import { ChartNoAxesColumn } from 'lucide-react'
import Tabel from '../umum/Tabel.jsx'
import { StatusKosong } from '../umum/StatusData.jsx'
import { formatAngka, formatRupiah } from '../../utilitas/formatRupiah.js'

const kolomDasar = [
  { kunci: 'no', judul: 'No.', render: (_, nomor) => nomor, kelas: 'w-16 angka' },
  { kunci: 'namaProduk', judul: 'Produk' },
  { kunci: 'totalTerjual', judul: 'Terjual', render: (baris) => formatAngka(baris.totalTerjual), kelas: 'angka' },
]

const KOLOM_OMZET = { kunci: 'totalOmzet', judul: 'Total Omzet', render: (baris) => formatRupiah(baris.totalOmzet), kelas: 'angka' }

// `petaStok` (opsional): Map productId → stok, menampilkan kolom "Stok Tersisa" di dashboard
export default function TabelTerlaris({ data, memuat, galat, saatCobaLagi, petaStok }) {
  const kolom = petaStok
    ? [...kolomDasar, { kunci: 'stok', judul: 'Stok Tersisa', render: (baris) => petaStok.get(baris.productId) ?? '–', kelas: 'angka' }]
    : [...kolomDasar, KOLOM_OMZET]

  return (
    <Tabel
      kolom={kolom}
      data={data}
      kunciBaris={(baris) => baris.productId}
      memuat={memuat}
      galat={galat}
      saatCobaLagi={saatCobaLagi}
      polos
      kosong={<StatusKosong ikon={ChartNoAxesColumn} judul="Belum ada penjualan" pesan="Produk terlaris muncul setelah ada transaksi pada periode ini." />}
      renderKartu={(baris, i) => (
        <div className="flex items-center justify-between gap-3 py-1">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-tinta">
              {i + 1}. {baris.namaProduk}
            </p>
            <p className="angka text-xs text-zaitun">{formatAngka(baris.totalTerjual)} terjual</p>
          </div>
          <p className="angka shrink-0 text-sm font-bold text-tinta">
            {petaStok ? `Sisa ${petaStok.get(baris.productId) ?? '–'}` : formatRupiah(baris.totalOmzet)}
          </p>
        </div>
      )}
    />
  )
}
