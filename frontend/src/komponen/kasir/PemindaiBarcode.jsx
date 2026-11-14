import { useEffect, useId, useRef, useState } from 'react'
import Modal from '../umum/Modal.jsx'

const PESAN_KAMERA = 'Kamera tidak dapat diakses. Izinkan akses kamera di peramban, atau ketik barcode pada kolom pencarian lalu tekan Enter.'

// Pemindai kamera (FR-26). Pustaka html5-qrcode dimuat hanya saat dialog dibuka.
function AreaPindai({ saatTerbaca }) {
  const idElemen = useId().replace(/:/g, '')
  const [galat, setGalat] = useState(null)
  const refTerbaca = useRef(saatTerbaca)

  useEffect(() => {
    refTerbaca.current = saatTerbaca
  }, [saatTerbaca])

  useEffect(() => {
    let pemindai = null
    let batal = false
    let sudahTerbaca = false

    const hentikan = () => {
      if (!pemindai) return Promise.resolve()
      const p = pemindai
      pemindai = null
      return p.stop().then(() => p.clear()).catch(() => {})
    }

    import('html5-qrcode')
      .then(({ Html5Qrcode }) => {
        if (batal) return undefined
        pemindai = new Html5Qrcode(idElemen, { verbose: false })
        return pemindai.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 260, height: 140 } },
          (teks) => {
            if (sudahTerbaca) return
            sudahTerbaca = true
            hentikan().then(() => refTerbaca.current(teks.trim()))
          },
          () => {},
        )
      })
      .then(() => {
        if (batal) hentikan()
      })
      .catch(() => !batal && setGalat(PESAN_KAMERA))

    return () => {
      batal = true
      hentikan()
    }
  }, [idElemen])

  return (
    <div className="pb-2">
      {galat ? (
        <p role="alert" className="rounded-xl bg-merah-muda px-4 py-3 text-sm font-semibold text-merah">
          {galat}
        </p>
      ) : (
        <>
          <div id={idElemen} className="min-h-56 overflow-hidden rounded-2xl bg-tinta [&_video]:w-full" />
          <p className="mt-3 text-center text-xs text-zaitun">Arahkan kamera ke barcode produk. Scanner USB cukup dipindai ke kolom pencarian.</p>
        </>
      )}
    </div>
  )
}

export default function PemindaiBarcode({ buka, saatTutup, saatTerbaca }) {
  return (
    <Modal buka={buka} saatTutup={saatTutup} judul="Scan Barcode">
      {buka && <AreaPindai saatTerbaca={saatTerbaca} />}
    </Modal>
  )
}
