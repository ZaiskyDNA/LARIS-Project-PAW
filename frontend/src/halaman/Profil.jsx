import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import Avatar from '../komponen/umum/Avatar.jsx'
import Tombol from '../komponen/umum/Tombol.jsx'
import DialogKonfirmasi from '../komponen/umum/DialogKonfirmasi.jsx'
import { KolomInput } from '../komponen/umum/KolomInput.jsx'
import KepalaHalaman from '../komponen/tataletak/KepalaHalaman.jsx'
import { gunakanAuth } from '../hook/gunakanAuth.js'
import { gunakanPengaturan } from '../hook/gunakanPengaturan.js'
import { BERANDA_PERAN, LABEL_PERAN } from '../utilitas/konstanta.js'

const PINTASAN_PEMILIK = [
  { ke: '/pengguna', label: 'Manajemen Kasir' },
  { ke: '/pengaturan', label: 'Pengaturan Toko' },
  { ke: '/kasir', label: 'Buka Kasir (Transaksi)' },
  { ke: '/transaksi', label: 'Riwayat Transaksi' },
]

function DaftarPintasan({ pintasan }) {
  return (
    <ul className="flex flex-col gap-3 lg:gap-1">
      {pintasan.map((item) => (
        <li key={item.ke}>
          <Link
            to={item.ke}
            className="flex min-h-14 items-center justify-between rounded-2xl bg-kuning px-5 text-sm font-bold text-tinta transition-colors hover:bg-kuning-tua lg:min-h-9 lg:justify-start lg:gap-1 lg:rounded-lg lg:bg-transparent lg:px-0 lg:hover:bg-transparent lg:hover:text-cokelat"
          >
            {item.label}
            <ChevronRight className="size-5 lg:size-4" strokeWidth={3} aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default function Profil() {
  const { pengguna, adalahPemilik, keluar } = gunakanAuth()
  const { data: pengaturan } = gunakanPengaturan()
  const [konfirmasi, setKonfirmasi] = useState(false)
  const [sedangKeluar, setSedangKeluar] = useState(false)

  const tanganiKeluar = async () => {
    setSedangKeluar(true)
    await keluar()
  }

  const peran = LABEL_PERAN[pengguna.role]

  return (
    <>
      <KepalaHalaman judul="Profil" kembali={BERANDA_PERAN[pengguna.role]} className={adalahPemilik ? '' : '-mt-5 lg:mt-0'} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start lg:gap-8">
        <section className="lg:rounded-3xl lg:bg-kuning lg:p-9" aria-label="Data akun">
          <div className="flex flex-col items-center gap-1 py-6 text-center lg:flex-row lg:gap-8 lg:py-0 lg:text-left">
            <Avatar ukuran="sedang" />
            <div className="mt-3 lg:mt-0">
              <h2 className="text-2xl font-extrabold tracking-tight text-tinta lg:text-[28px]">{pengguna.nama}</h2>
              <p className="text-sm text-tinta">{peran}</p>
              <p className="mt-1 text-xs text-zaitun lg:hidden">{pengguna.email}</p>
            </div>
          </div>
          <div className="mt-7 hidden flex-col gap-5 lg:flex">
            <KolomInput label="Email" value={pengguna.email} readOnly />
            <KolomInput label="Toko" value={pengaturan?.namaToko ?? '…'} readOnly />
            <KolomInput label="Peran" value={peran} readOnly />
          </div>
        </section>

        <div className="flex flex-col gap-5 lg:flex-col-reverse">
          {adalahPemilik && (
            <section className="lg:rounded-3xl lg:bg-kuning lg:p-6" aria-labelledby="judul-pintasan">
              <h2 id="judul-pintasan" className="mb-2 hidden text-sm font-bold text-tinta lg:block">
                Pintasan
              </h2>
              <DaftarPintasan pintasan={PINTASAN_PEMILIK} />
            </section>
          )}
          <section className="lg:rounded-3xl lg:bg-kuning lg:p-6 lg:text-center">
            <h2 className="hidden text-base font-bold text-tinta lg:block">Keluar dari akun?</h2>
            <p className="mb-6 mt-2 hidden text-xs text-tinta lg:block">Sesi akan diakhiri di perangkat ini.</p>
            <Tombol varian="bahaya" ukuran="besar" penuh className="rounded-2xl lg:min-h-12" onClick={() => setKonfirmasi(true)}>
              Keluar
            </Tombol>
          </section>
        </div>
      </div>

      <DialogKonfirmasi
        buka={konfirmasi}
        judul="Keluar dari akun?"
        pesan="Sesi akan diakhiri di perangkat ini. Anda perlu masuk kembali untuk memakai LARIS."
        labelSetuju="Keluar"
        memuat={sedangKeluar}
        saatSetuju={tanganiKeluar}
        saatBatal={() => setKonfirmasi(false)}
      />
    </>
  )
}
