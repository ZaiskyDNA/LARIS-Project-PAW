import { QRCodeSVG } from 'qrcode.react'
import { QrCode } from 'lucide-react'
import Tombol from '../umum/Tombol.jsx'
import { formatRupiah } from '../../utilitas/formatRupiah.js'
import { formatDurasi } from '../../utilitas/formatTanggal.js'
import { gabungKelas } from '../../utilitas/gabungKelas.js'

const PESAN_STATUS = {
  gagal: 'Pembayaran gagal. Stok tidak berubah.',
  dibatalkan: 'Pembayaran dibatalkan. Stok tidak berubah.',
  kedaluwarsa: 'Kode QR kedaluwarsa. Stok tidak berubah.',
}

function KodeQr({ sesi, redup }) {
  return (
    <div className={gabungKelas('rounded-3xl border-2 border-kuning-tua bg-white p-4', redup && 'opacity-25')}>
      {sesi.qrString ? (
        <QRCodeSVG value={sesi.qrString} size={208} level="M" marginSize={0} title="Kode QRIS pembayaran" />
      ) : (
        <img src={sesi.qrUrl} alt="Kode QRIS pembayaran" width={208} height={208} />
      )}
    </div>
  )
}

export default function PanelQris({ total, qris }) {
  const { sesi, status, sedangMembuat, sedangMembatalkan, sedangSimulasi, sedangMengecek, galat, sisaDetik, habisWaktu, buat, cekStatus, batalkan, simulasikanBayar } = qris

  if (!sesi) {
    return (
      <div className="flex flex-col items-center gap-4 pb-2 text-center">
        <div className="flex size-20 items-center justify-center rounded-3xl bg-kuning text-tinta">
          <QrCode className="size-10" aria-hidden="true" />
        </div>
        <p className="max-w-xs text-sm text-zaitun">Kode QRIS dibuat untuk tagihan ini. Stok baru berkurang setelah pembayaran pelanggan diterima.</p>
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

  const selesaiGagal = Boolean(PESAN_STATUS[status])
  const tidakAktif = selesaiGagal || habisWaktu
  let teksStatus = `Menunggu pembayaran… ${formatDurasi(sisaDetik)}`
  if (selesaiGagal) teksStatus = PESAN_STATUS[status]
  else if (habisWaktu) teksStatus = 'Waktu habis. Memastikan status ke gateway…'

  return (
    <div className="flex flex-col items-center gap-4 pb-2 text-center">
      <KodeQr sesi={sesi} redup={tidakAktif} />
      <p className="angka text-[28px] font-extrabold leading-none tracking-tight text-tinta">{formatRupiah(total)}</p>

      <p role="status" className={gabungKelas('angka rounded-full px-6 py-2.5 text-sm font-bold', tidakAktif ? 'bg-merah-muda text-merah' : 'bg-persik text-cokelat')}>
        {teksStatus}
      </p>

      {sesi.simulasi ? (
        !tidakAktif && (
          <div className="flex w-full flex-col gap-3 rounded-2xl bg-pasir p-4">
            <p className="text-xs font-semibold text-zaitun">Mode simulasi: kode ini tidak bisa dibayar sungguhan. Tandai sudah dibayar setelah pelanggan "membayar".</p>
            <Tombol varian="terang" penuh memuat={sedangSimulasi} onClick={simulasikanBayar}>
              Simulasikan Pembayaran Berhasil
            </Tombol>
          </div>
        )
      ) : (
        !tidakAktif && <p className="text-xs text-zaitun">Minta pelanggan scan QR dengan aplikasi e-wallet / m-banking</p>
      )}

      <div className="mt-2 grid w-full grid-cols-2 gap-4">
        <Tombol varian="sekunder" ukuran="besar" memuat={sedangMembatalkan} onClick={batalkan} className="rounded-xl">
          {selesaiGagal ? 'Kembali' : 'Batalkan'}
        </Tombol>
        {selesaiGagal ? (
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
