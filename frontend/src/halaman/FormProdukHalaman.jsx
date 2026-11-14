import { useNavigate, useParams } from 'react-router-dom'
import KepalaHalaman from '../komponen/tataletak/KepalaHalaman.jsx'
import Skeleton from '../komponen/umum/Skeleton.jsx'
import { StatusGalat } from '../komponen/umum/StatusData.jsx'
import FormProduk from '../komponen/produk/FormProduk.jsx'
import { gunakanKategori, gunakanProduk, gunakanTambahProduk, gunakanUbahProduk } from '../hook/gunakanProduk.js'
import { gunakanPengaturan } from '../hook/gunakanPengaturan.js'

export default function FormProdukHalaman() {
  const { id } = useParams()
  const navigate = useNavigate()
  const modeUbah = Boolean(id)

  const produk = gunakanProduk(id)
  const pengaturan = gunakanPengaturan()
  const { semuaKategori } = gunakanKategori()
  const tambah = gunakanTambahProduk()
  const ubah = gunakanUbahProduk()

  const kembali = () => navigate('/produk')
  const simpan = (data, saatGalat) => {
    const opsi = { onSuccess: kembali, onError: saatGalat }
    if (modeUbah) ubah.mutate({ id, data }, opsi)
    else tambah.mutate(data, opsi)
  }

  const menungguData = (modeUbah && produk.isPending) || pengaturan.isPending

  return (
    <>
      <KepalaHalaman judul={modeUbah ? 'Ubah Produk' : 'Tambah Produk'} kembali="/produk" />
      {modeUbah && produk.error ? (
        <div className="max-w-3xl rounded-3xl bg-kuning">
          <StatusGalat galat={produk.error} saatCobaLagi={produk.refetch} />
        </div>
      ) : menungguData ? (
        <Skeleton className="h-[520px] max-w-3xl rounded-3xl" />
      ) : (
        <FormProduk
          key={id ?? 'baru'}
          produk={modeUbah ? produk.data : null}
          stokMinimumDefault={pengaturan.data?.stokMinimumDefault}
          semuaKategori={semuaKategori}
          memuat={tambah.isPending || ubah.isPending}
          saatSimpan={simpan}
          saatBatal={kembali}
        />
      )}
    </>
  )
}
