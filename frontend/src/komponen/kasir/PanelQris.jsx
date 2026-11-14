import { QRCodeSVG } from 'qrcode.react'
import { QrCode } from 'lucide-react'
import Tombol from '../umum/Tombol.jsx'
import { formatRupiah } from '../../utilitas/formatRupiah.js'
import { formatDurasi } from '../../utilitas/formatTanggal.js'
import { gabungKelas } from '../../utilitas/gabungKelas.js'

const PESAN_STATUS = {
  gagal: 'Pembayaran gagal. Transaksi tidak tersimpan dan stok tidak berubah.',
  dibatalkan: 'Pembayaran dibatalkan. Stok tidak berubah.',
}

export default function PanelQris({ total, qris, saatBatalkan }) {
  const { sesi, status, sedangMembuat, sedangMengecek, galat, sisaDetik, kedaluwarsa, buat, cekStatus } = qris

  if (!sesi) {
    return (
      <div className="flex flex-col items-center gap-4 pb-2 text-center">
        <div className="flex size-20 items-center justify-center rounded-3xl bg-kuning text-tinta">
          <QrCode className="size-10" aria-hidden="true" />
        </div>
        <p className="max-w-xs text-sm text-zaitun">Kode QR dibuat untuk tagihan ini. Stok baru berkurang setelah pembayaran pelanggan diterima.</p>
        {galat && (
          <p role="alert" className="w-full rounded-xl bg-merah-muda px-4 py-3 text-left text-sm font-semibold text-merah">
            {galat} Pembayaran tunai tetap dapat digunakan.
          </p>
        )}
        <Tombol ukuran="besar" penuh memuat={sedangMembuat} onClick={buat} className="min-h-15 rounded-xl text-lg">
          {sedangMembuat ? 'Membuat kode…' : 'Buat Kode QR'}
        </Tombol>
      </div>
    )
  }

  const selesaiGagal = status === 'gagal' || status === 'dibatalkan'
  const tidakAktif = selesaiGagal || kedaluwarsa
  const isiQr = sesi.redirect_url || `LARIS-QRIS:${sesi.midtransOrderId}`

  return (
    <div className="flex flex-col items-center gap-4 pb-2 text-center">
      <div className={gabungKelas('rounded-3xl border-2 border-kuning-tua bg-white p-4', tidakAktif && 'opacity-25')}>
        <QRCodeSVG value={isiQr} size={208} level="M" marginSize={0} title="Kode QR pembayaran" />
      </div>
      <p className="angka text-[28px] font-extrabold leading-none tracking-tight text-tinta">{formatRupiah(total)}</p>

      <p role="status" className={gabungKelas('angka rounded-full px-6 py-2.5 text-sm font-bold', tidakAktif ? 'bg-merah-muda text-merah' : 'bg-persik text-cokelat')}>
        {selesaiGagal ? PESAN_STATUS[status] : kedaluwarsa ? 'Kode QR kedaluwarsa. Buat kode baru untuk melanjutkan.' : `Menunggu pembayaran… ${formatDurasi(sisaDetik)}`}
      </p>

      {sesi.mock ? (
        <p className="rounded-xl bg-pasir px-4 py-3 text-xs font-semibold text-zaitun">
          Mode simulasi: gateway Midtrans belum terhubung, jadi kode ini belum bisa dibayar sungguhan.
        </p>
      ) : (
        !tidakAktif && <p className="text-xs text-zaitun">Minta pelanggan scan QR dengan aplikasi e-wallet / m-banking</p>
      )}

      <div className="mt-2 grid w-full grid-cols-2 gap-4">
        <Tombol varian="sekunder" ukuran="besar" onClick={saatBatalkan} className="rounded-xl">
          {tidakAktif ? 'Kembali' : 'Batalkan'}
        </Tombol>
        {tidakAktif ? (
          <Tombol ukuran="besar" memuat={sedangMembuat} onClick={buat} className="rounded-xl">
            Buat Kode Baru
          </Tombol>
        ) : (
          <Tombol ukuran="besar" memuat={sedangMengecek} onClick={cekStatus} className="rounded-xl">
            Cek Status
          </Tombol>
        )}
      </div>
    </div>
  )
}
