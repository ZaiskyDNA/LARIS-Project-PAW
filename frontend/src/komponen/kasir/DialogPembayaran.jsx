import { useState } from 'react'
import Modal from '../umum/Modal.jsx'
import PanelTunai from './PanelTunai.jsx'
import PanelQris from './PanelQris.jsx'
import { gunakanBuatTransaksi } from '../../hook/gunakanTransaksi.js'
import { gunakanPembayaranQris } from '../../hook/gunakanPembayaranQris.js'
import { formatRupiah } from '../../utilitas/formatRupiah.js'
import { pesanGalat } from '../../utilitas/galatApi.js'
import { gabungKelas } from '../../utilitas/gabungKelas.js'

const METODE = [
  { nilai: 'tunai', label: 'Tunai' },
  { nilai: 'qris', label: 'QRIS' },
]

// Isi dialog dipisah agar state-nya otomatis tereset setiap dialog dibuka ulang
function IsiPembayaran({ items, total, saatBerhasil, saatKunci }) {
  const [metode, setMetode] = useState('tunai')
  const [galatTunai, setGalatTunai] = useState(null)
  const transaksiTunai = gunakanBuatTransaksi()
  const qris = gunakanPembayaranQris({ items, saatBerhasil })
  const terkunci = transaksiTunai.isPending || qris.sedangMembuat || Boolean(qris.sesi)

  const bayarTunai = (nominalBayar) => {
    setGalatTunai(null)
    saatKunci(true)
    transaksiTunai.mutate(
      { items: items.map(({ productId, qty }) => ({ productId, qty })), metodeBayar: 'tunai', nominalBayar },
      {
        onSuccess: saatBerhasil,
        onError: (error) => setGalatTunai(pesanGalat(error)),
        onSettled: () => saatKunci(false),
      },
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div role="tablist" aria-label="Metode pembayaran" className="flex rounded-full bg-kuning sm:w-fit">
        {METODE.map(({ nilai, label }) => (
          <button
            key={nilai}
            type="button"
            role="tab"
            aria-selected={metode === nilai}
            disabled={terkunci && metode !== nilai}
            onClick={() => setMetode(nilai)}
            className={gabungKelas(
              'min-h-11 flex-1 rounded-full px-10 text-sm font-bold text-black transition-colors disabled:cursor-not-allowed disabled:opacity-40',
              metode === nilai ? 'bg-jingga' : 'hover:bg-kuning-tua',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {!(metode === 'qris' && qris.sesi) && (
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-bold text-tinta">Total tagihan</span>
          <span className="angka text-4xl font-extrabold leading-none tracking-tight text-tinta">{formatRupiah(total)}</span>
        </div>
      )}

      {metode === 'tunai' ? (
        <PanelTunai total={total} memuat={transaksiTunai.isPending} galat={galatTunai} saatSelesai={bayarTunai} />
      ) : (
        <PanelQris total={total} qris={qris} saatBatalkan={qris.batalkan} />
      )}
    </div>
  )
}

export default function DialogPembayaran({ buka, items, total, saatTutup, saatBerhasil }) {
  const [terkunci, setTerkunci] = useState(false)
  return (
    <Modal buka={buka} saatTutup={saatTutup} judul="Pembayaran" terkunci={terkunci}>
      <IsiPembayaran items={items} total={total} saatBerhasil={saatBerhasil} saatKunci={setTerkunci} />
    </Modal>
  )
}
