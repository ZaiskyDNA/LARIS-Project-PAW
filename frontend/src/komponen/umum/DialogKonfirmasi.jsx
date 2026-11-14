import Modal from './Modal.jsx'
import Tombol from './Tombol.jsx'

export default function DialogKonfirmasi({
  buka,
  judul,
  pesan,
  labelSetuju = 'Ya, lanjutkan',
  varianSetuju = 'bahaya',
  memuat = false,
  saatSetuju,
  saatBatal,
}) {
  return (
    <Modal buka={buka} saatTutup={saatBatal} judul={judul} lebar="kecil" terkunci={memuat}>
      <p className="text-sm leading-relaxed text-zaitun">{pesan}</p>
      <div className="mt-6 grid grid-cols-2 gap-3 pb-2">
        <Tombol varian="sekunder" onClick={saatBatal} disabled={memuat}>
          Batal
        </Tombol>
        <Tombol varian={varianSetuju} onClick={saatSetuju} memuat={memuat}>
          {labelSetuju}
        </Tombol>
      </div>
    </Modal>
  )
}
