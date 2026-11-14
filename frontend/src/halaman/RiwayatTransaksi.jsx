import { useState } from 'react'
import { ReceiptText } from 'lucide-react'
import Tabel from '../komponen/umum/Tabel.jsx'
import Paginasi from '../komponen/umum/Paginasi.jsx'
import Modal from '../komponen/umum/Modal.jsx'
import Tombol from '../komponen/umum/Tombol.jsx'
import PilihTanggal from '../komponen/umum/PilihTanggal.jsx'
import { Lencana } from '../komponen/umum/Lencana.jsx'
import { StatusKosong } from '../komponen/umum/StatusData.jsx'
import Struk from '../komponen/kasir/Struk.jsx'
import { gunakanAuth } from '../hook/gunakanAuth.js'
import { gunakanDaftarTransaksi } from '../hook/gunakanTransaksi.js'
import { formatRupiah } from '../utilitas/formatRupiah.js'
import { formatJam, formatTanggalJamPendek, hariIniIso } from '../utilitas/formatTanggal.js'
import { METODE_BAYAR, PER_HALAMAN, STATUS_BAYAR } from '../utilitas/konstanta.js'

const jumlahItem = (transaksi) => transaksi.items.reduce((jumlah, item) => jumlah + item.qty, 0)

const LencanaMetode = ({ metode }) => <Lencana kelas={METODE_BAYAR[metode]?.kelas}>{METODE_BAYAR[metode]?.label ?? metode}</Lencana>
const LencanaStatus = ({ status }) => <Lencana kelas={STATUS_BAYAR[status]?.kelas}>{STATUS_BAYAR[status]?.label ?? status}</Lencana>

function ModalDetail({ transaksi, saatTutup }) {
  return (
    <Modal buka={Boolean(transaksi)} saatTutup={saatTutup} judul="Detail Transaksi">
      {transaksi && (
        <div className="flex flex-col gap-4 pb-2">
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-kuning px-5 py-3.5 print:hidden">
            <span className="text-sm font-bold text-tinta">Status pembayaran</span>
            <LencanaStatus status={transaksi.statusBayar} />
          </div>
          <Struk transaksi={transaksi} />
          <Tombol ukuran="besar" penuh onClick={() => window.print()} className="rounded-xl print:hidden">
            Cetak Ulang Struk
          </Tombol>
        </div>
      )}
    </Modal>
  )
}

export default function RiwayatTransaksi() {
  const { adalahPemilik } = gunakanAuth()
  const hariIni = hariIniIso()
  const [rentang, setRentang] = useState({ tanggalMulai: hariIni, tanggalAkhir: hariIni })
  const [halaman, setHalaman] = useState(1)
  const [terpilih, setTerpilih] = useState(null)

  const kueri = gunakanDaftarTransaksi({ ...rentang, halaman, perHalaman: PER_HALAMAN })
  const meta = kueri.data?.meta ?? {}
  const satuHari = rentang.tanggalMulai === rentang.tanggalAkhir
  const formatWaktu = satuHari ? formatJam : formatTanggalJamPendek

  const gantiRentang = (baru) => {
    setRentang(baru)
    setHalaman(1)
  }

  const kolom = [
    { kunci: 'nomorTransaksi', judul: 'No. Transaksi', render: (t) => <span className="font-semibold">{t.nomorTransaksi}</span>, kelas: 'angka whitespace-nowrap' },
    { kunci: 'waktu', judul: 'Waktu', render: (t) => formatWaktu(t.createdAt), kelas: 'angka whitespace-nowrap' },
    ...(adalahPemilik ? [{ kunci: 'namaKasir', judul: 'Kasir' }] : []),
    { kunci: 'jumlahItem', judul: 'Jumlah Item', render: (t) => `${jumlahItem(t)} item`, kelas: 'angka whitespace-nowrap' },
    { kunci: 'total', judul: 'Total', render: (t) => formatRupiah(t.total), kelas: 'angka' },
    { kunci: 'metode', judul: 'Metode', render: (t) => <LencanaMetode metode={t.metodeBayar} /> },
    { kunci: 'status', judul: 'Status', render: (t) => <LencanaStatus status={t.statusBayar} /> },
    {
      kunci: 'aksi',
      judul: 'Aksi',
      render: (t) => (
        <button type="button" onClick={() => setTerpilih(t)} className="rounded px-2 py-1 text-xs font-bold text-cokelat hover:underline" aria-label={`Detail ${t.nomorTransaksi}`}>
          Detail
        </button>
      ),
    },
  ]

  return (
    <>
      <header className="mb-5 flex flex-col gap-4 lg:mb-6 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-tinta lg:text-[40px] lg:leading-tight">Riwayat Transaksi</h1>
        <PilihTanggal tanggalMulai={rentang.tanggalMulai} tanggalAkhir={rentang.tanggalAkhir} saatUbah={gantiRentang} rataPanel="kanan" className="lg:w-72" />
      </header>

      <Tabel
        kolom={kolom}
        data={kueri.data?.data}
        memuat={kueri.isPending}
        galat={kueri.error}
        saatCobaLagi={kueri.refetch}
        kosong={
          <StatusKosong
            ikon={ReceiptText}
            judul={satuHari && rentang.tanggalMulai === hariIni ? 'Belum ada transaksi hari ini' : 'Tidak ada transaksi pada periode ini'}
            pesan={adalahPemilik ? 'Transaksi dari semua kasir akan muncul di sini.' : 'Transaksi yang Anda buat akan muncul di sini.'}
          />
        }
        kaki={<Paginasi halaman={meta.halaman} totalHalaman={meta.totalHalaman} total={meta.total} saatGanti={setHalaman} />}
        renderKartu={(t) => (
          <button type="button" onClick={() => setTerpilih(t)} className="flex w-full items-center justify-between gap-3 rounded-2xl bg-kuning px-5 py-4 text-left transition-colors hover:bg-kuning-tua">
            <span className="min-w-0">
              <span className="angka block truncate text-base font-bold text-tinta">{t.nomorTransaksi}</span>
              <span className="angka block text-xs text-tinta">
                {formatWaktu(t.createdAt)} · {jumlahItem(t)} item{adalahPemilik && ` · ${t.namaKasir}`}
              </span>
            </span>
            <span className="flex shrink-0 flex-col items-end gap-1.5">
              <span className="angka text-base font-bold text-tinta">{formatRupiah(t.total)}</span>
              {t.statusBayar === 'berhasil' ? <LencanaMetode metode={t.metodeBayar} /> : <LencanaStatus status={t.statusBayar} />}
            </span>
          </button>
        )}
      />

      <ModalDetail transaksi={terpilih} saatTutup={() => setTerpilih(null)} />
    </>
  )
}
