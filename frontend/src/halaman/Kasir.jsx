import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Check, ScanBarcode } from 'lucide-react'
import KolomCari from '../komponen/umum/KolomCari.jsx'
import PilTab from '../komponen/umum/PilTab.jsx'
import Tombol from '../komponen/umum/Tombol.jsx'
import Modal from '../komponen/umum/Modal.jsx'
import GridProduk from '../komponen/kasir/GridProduk.jsx'
import Keranjang from '../komponen/kasir/Keranjang.jsx'
import DialogPembayaran from '../komponen/kasir/DialogPembayaran.jsx'
import PemindaiBarcode from '../komponen/kasir/PemindaiBarcode.jsx'
import Struk from '../komponen/kasir/Struk.jsx'
import { gunakanDaftarProduk, gunakanKategori } from '../hook/gunakanProduk.js'
import { gunakanDebounce } from '../hook/gunakanDebounce.js'
import { gunakanKeranjang, HASIL_TAMBAH } from '../hook/gunakanKeranjang.js'
import { ambilProdukBarcode } from '../layanan/apiProduk.js'
import { formatRupiah } from '../utilitas/formatRupiah.js'
import { PER_HALAMAN_KASIR, POLA_BARCODE } from '../utilitas/konstanta.js'
import { pesanGalat } from '../utilitas/galatApi.js'

function LayarBerhasil({ transaksi, saatBaru }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center pb-4 pt-2">
      <div className="flex size-20 items-center justify-center rounded-full bg-hijau-muda text-hijau print:hidden">
        <Check className="size-10" strokeWidth={4} aria-hidden="true" />
      </div>
      <h1 className="mb-6 mt-3 text-3xl font-extrabold tracking-tight text-tinta print:hidden">Transaksi Berhasil</h1>
      <Struk transaksi={transaksi} />
      <div className="mt-6 grid w-full grid-cols-2 gap-4 print:hidden">
        <Tombol varian="sekunder" ukuran="besar" onClick={() => window.print()} className="rounded-xl">
          Cetak Struk
        </Tombol>
        <Tombol ukuran="besar" onClick={saatBaru} autoFocus className="rounded-xl">
          Transaksi Baru
        </Tombol>
      </div>
    </div>
  )
}

export default function Kasir() {
  const [cari, setCari] = useState('')
  const [kategori, setKategori] = useState('')
  const [dialog, setDialog] = useState(null) // 'bayar' | 'pindai' | 'keranjang'
  const [transaksiSelesai, setTransaksiSelesai] = useState(null)

  const cariTertunda = gunakanDebounce(cari.trim())
  const { kategoriTerpakai } = gunakanKategori()
  const produk = gunakanDaftarProduk({ cari: cariTertunda, kategori, perHalaman: PER_HALAMAN_KASIR })
  const keranjang = gunakanKeranjang()
  const { sinkronkan } = keranjang

  useEffect(() => {
    if (produk.data?.data) sinkronkan(produk.data.data)
  }, [produk.data, sinkronkan])

  const petaQty = useMemo(() => new Map(keranjang.items.map((item) => [item.productId, item.qty])), [keranjang.items])
  const pilihanKategori = [{ nilai: '', label: 'Semua' }, ...kategoriTerpakai.map((nama) => ({ nilai: nama, label: nama }))]

  const tambahKeKeranjang = (item) => {
    const hasil = keranjang.tambah(item)
    if (hasil === HASIL_TAMBAH.HABIS) toast.error(`Stok ${item.nama} habis`)
    else if (hasil === HASIL_TAMBAH.MAKS) toast.error(`Stok ${item.nama} hanya tersisa ${item.stok}`)
    return hasil
  }

  const tambahDariBarcode = async (kode) => {
    setDialog(null)
    try {
      const item = await ambilProdukBarcode(kode)
      if (tambahKeKeranjang(item) === HASIL_TAMBAH.OK) {
        toast.success(`${item.nama} ditambahkan`)
        setCari('')
      }
    } catch (error) {
      toast.error(error.response?.status === 404 ? `Barcode ${kode} tidak terdaftar` : pesanGalat(error))
    }
  }

  // Scanner USB mengetik barcode lalu menekan Enter pada kolom pencarian
  const tanganiEnterCari = (peristiwa) => {
    const kode = cari.trim()
    if (peristiwa.key === 'Enter' && POLA_BARCODE.test(kode) && /\d/.test(kode)) {
      peristiwa.preventDefault()
      tambahDariBarcode(kode)
    }
  }

  const tanganiBerhasil = (transaksi) => {
    setDialog(null)
    keranjang.kosongkan()
    setTransaksiSelesai(transaksi)
    toast.success(`${transaksi.nomorTransaksi} · ${formatRupiah(transaksi.total)}`)
  }

  if (transaksiSelesai) return <LayarBerhasil transaksi={transaksiSelesai} saatBaru={() => setTransaksiSelesai(null)} />

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_25rem]">
      <section aria-label="Katalog produk" className="min-w-0 pb-24 lg:pb-0">
        <div className="mb-4 flex gap-3">
          <KolomCari nilai={cari} saatUbah={setCari} onKeyDown={tanganiEnterCari} placeholder="Cari nama produk…" label="Cari produk atau pindai barcode" className="flex-1" />
          <Tombol ikon={ScanBarcode} onClick={() => setDialog('pindai')} className="min-h-12 shrink-0 rounded-xl px-4 sm:px-6" aria-label="Scan barcode">
            <span className="hidden sm:inline">Scan Barcode</span>
            <span className="sm:hidden">Scan</span>
          </Tombol>
        </div>
        <PilTab label="Kategori produk" pilihan={pilihanKategori} aktif={kategori} saatPilih={setKategori} className="mb-4" />
        <GridProduk kueri={produk} petaQty={petaQty} adaFilter={Boolean(cariTertunda || kategori)} saatPilih={tambahKeKeranjang} />
      </section>

      <div className="sticky top-24 hidden lg:block">
        <Keranjang keranjang={keranjang} saatBayar={() => setDialog('bayar')} className="h-[calc(100dvh-7.75rem)] rounded-3xl bg-kuning p-6" />
      </div>

      {/* Ringkasan lengket di HP: total selalu terlihat (US-10) */}
      <div className="fixed inset-x-3 bottom-[5.25rem] z-20 flex items-center gap-3 rounded-3xl border-2 border-kuning-tua bg-white p-2.5 pl-5 shadow-kartu print:hidden lg:hidden">
        <button type="button" onClick={() => setDialog('keranjang')} className="min-h-12 min-w-0 flex-1 text-left" aria-label={`Lihat keranjang, ${keranjang.jumlahItem} item, total ${formatRupiah(keranjang.total)}`}>
          <span className="angka block text-xs font-bold text-tinta">{keranjang.jumlahItem} item · lihat keranjang</span>
          <span className="angka block truncate text-xl font-extrabold tracking-tight text-tinta">{formatRupiah(keranjang.total)}</span>
        </button>
        <Tombol ukuran="besar" disabled={keranjang.items.length === 0 || keranjang.adaMelebihiStok} onClick={() => setDialog('bayar')} className="rounded-2xl px-9 text-lg">
          Bayar
        </Tombol>
      </div>

      <Modal buka={dialog === 'keranjang'} saatTutup={() => setDialog(null)} judul="Keranjang">
        <Keranjang keranjang={keranjang} tanpaJudul saatBayar={() => setDialog('bayar')} className="max-h-[70dvh] pb-2" />
      </Modal>
      <DialogPembayaran buka={dialog === 'bayar'} items={keranjang.items} total={keranjang.total} saatTutup={() => setDialog(null)} saatBerhasil={tanganiBerhasil} />
      <PemindaiBarcode buka={dialog === 'pindai'} saatTutup={() => setDialog(null)} saatTerbaca={tambahDariBarcode} />
    </div>
  )
}
