import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ClipboardCheck, History, Pencil, Plus, Trash2 } from 'lucide-react'
import KepalaHalaman from '../komponen/tataletak/KepalaHalaman.jsx'
import PilTab from '../komponen/umum/PilTab.jsx'
import KolomCari from '../komponen/umum/KolomCari.jsx'
import Paginasi from '../komponen/umum/Paginasi.jsx'
import Modal from '../komponen/umum/Modal.jsx'
import Tombol from '../komponen/umum/Tombol.jsx'
import DialogKonfirmasi from '../komponen/umum/DialogKonfirmasi.jsx'
import { KolomPilih } from '../komponen/umum/KolomInput.jsx'
import { LencanaJumlah } from '../komponen/umum/Lencana.jsx'
import TabelProduk from '../komponen/produk/TabelProduk.jsx'
import TabelStokMenipis from '../komponen/produk/TabelStokMenipis.jsx'
import ModalOpname from '../komponen/produk/ModalOpname.jsx'
import { gunakanDaftarProduk, gunakanHapusProduk, gunakanKategori, gunakanStokMenipis } from '../hook/gunakanProduk.js'
import { gunakanDebounce } from '../hook/gunakanDebounce.js'
import { PER_HALAMAN } from '../utilitas/konstanta.js'

const TAB = { SEMUA: 'semua', MENIPIS: 'menipis' }
const KELAS_TAMBAH = 'items-center justify-center gap-1.5 bg-jingga font-bold text-black shadow-kartu transition-colors hover:bg-jingga-tua'

export default function ManajemenProduk() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === TAB.MENIPIS ? TAB.MENIPIS : TAB.SEMUA
  const kategori = params.get('kategori') ?? ''
  const halaman = Math.max(1, Number(params.get('halaman')) || 1)

  const [cari, setCari] = useState('')
  const cariTertunda = gunakanDebounce(cari.trim())
  const [produkOpname, setProdukOpname] = useState(null)
  const [produkHapus, setProdukHapus] = useState(null)
  const [produkAksi, setProdukAksi] = useState(null)

  const { kategoriTerpakai } = gunakanKategori()
  const daftar = gunakanDaftarProduk(
    { cari: cariTertunda, kategori, halaman: cariTertunda ? 1 : halaman, perHalaman: PER_HALAMAN },
    { enabled: tab === TAB.SEMUA },
  )
  const menipis = gunakanStokMenipis()
  const penghapus = gunakanHapusProduk()

  const ubahParam = (perubahan) => {
    const baru = new URLSearchParams(params)
    Object.entries(perubahan).forEach(([kunci, nilai]) => (nilai ? baru.set(kunci, nilai) : baru.delete(kunci)))
    setParams(baru, { replace: true })
  }

  const meta = daftar.data?.meta ?? {}
  const pilihanTab = [
    { nilai: TAB.SEMUA, label: 'Semua produk' },
    { nilai: TAB.MENIPIS, label: 'Stok menipis', akhiran: <LencanaJumlah jumlah={menipis.data?.length} /> },
  ]

  const jalankanAksi = (aksi) => {
    const produk = produkAksi
    setProdukAksi(null)
    aksi(produk)
  }

  return (
    <>
      <KepalaHalaman judul="Produk & Stok" />

      <PilTab label="Tampilan produk" pilihan={pilihanTab} aktif={tab} saatPilih={(nilai) => ubahParam({ tab: nilai === TAB.SEMUA ? '' : nilai, halaman: '' })} className="mb-4" />

      {tab === TAB.SEMUA ? (
        <>
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
            <KolomCari nilai={cari} saatUbah={setCari} placeholder="Cari nama produk…" label="Cari produk" className="md:w-96" />
            <KolomPilih aria-label="Filter kategori" value={kategori} onChange={(e) => ubahParam({ kategori: e.target.value, halaman: '' })} className="md:w-52 [&_select]:min-h-12 [&_select]:rounded-full [&_select]:font-bold [&_select]:shadow-none">
              <option value="">Semua kategori</option>
              {kategoriTerpakai.map((nama) => (
                <option key={nama} value={nama}>
                  {nama}
                </option>
              ))}
            </KolomPilih>
            <Link to="/produk/tambah" className={`${KELAS_TAMBAH} ml-auto hidden min-h-12 rounded-xl px-6 text-sm md:inline-flex`}>
              <Plus className="size-4" strokeWidth={3} aria-hidden="true" /> Tambah Produk
            </Link>
          </div>

          <TabelProduk
            kueri={daftar}
            nomorAwal={((meta.halaman ?? 1) - 1) * PER_HALAMAN + 1}
            adaFilter={Boolean(cariTertunda || kategori)}
            saatOpname={setProdukOpname}
            saatHapus={setProdukHapus}
            saatPilihKartu={setProdukAksi}
            kaki={<Paginasi halaman={meta.halaman} totalHalaman={meta.totalHalaman} total={meta.total} saatGanti={(nomor) => ubahParam({ halaman: nomor > 1 ? String(nomor) : '' })} />}
          />

          <Link to="/produk/tambah" className={`${KELAS_TAMBAH} fixed bottom-24 right-4 z-20 inline-flex min-h-14 rounded-full px-7 text-base md:hidden`}>
            <Plus className="size-5" strokeWidth={3} aria-hidden="true" /> Tambah Produk
          </Link>
        </>
      ) : (
        <TabelStokMenipis kueri={menipis} saatOpname={setProdukOpname} />
      )}

      <Modal buka={Boolean(produkAksi)} saatTutup={() => setProdukAksi(null)} judul={produkAksi?.nama ?? ''} lebar="kecil">
        <div className="flex flex-col gap-2.5 pb-2">
          <Tombol varian="sekunder" ukuran="besar" ikon={Pencil} onClick={() => jalankanAksi((p) => navigate(`/produk/${p._id}/ubah`))}>
            Ubah produk
          </Tombol>
          <Tombol varian="sekunder" ukuran="besar" ikon={ClipboardCheck} onClick={() => jalankanAksi(setProdukOpname)}>
            Stok opname
          </Tombol>
          <Tombol varian="sekunder" ukuran="besar" ikon={History} onClick={() => jalankanAksi((p) => navigate(`/produk/${p._id}/mutasi`))}>
            Riwayat mutasi
          </Tombol>
          <Tombol varian="bahaya" ukuran="besar" ikon={Trash2} onClick={() => jalankanAksi(setProdukHapus)}>
            Hapus produk
          </Tombol>
        </div>
      </Modal>

      <ModalOpname produk={produkOpname} saatTutup={() => setProdukOpname(null)} />

      <DialogKonfirmasi
        buka={Boolean(produkHapus)}
        judul="Hapus produk?"
        pesan={`${produkHapus?.nama ?? 'Produk'} akan hilang dari katalog dan kasir. Riwayat penjualannya tetap tersimpan di laporan.`}
        labelSetuju="Hapus"
        memuat={penghapus.isPending}
        saatSetuju={() => penghapus.hapus(produkHapus, { onSettled: () => setProdukHapus(null) })}
        saatBatal={() => setProdukHapus(null)}
      />
    </>
  )
}
