import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import Tombol from '../umum/Tombol.jsx'
import { KolomAngka, KolomInput } from '../umum/KolomInput.jsx'
import { skemaProduk } from '../../skema/skemaProduk.js'
import { SATUAN_PRODUK } from '../../utilitas/konstanta.js'
import { pesanGalat, terapkanGalatForm, uraikanGalat } from '../../utilitas/galatApi.js'

const keNilaiForm = (produk, stokMinimumDefault) => ({
  nama: produk?.nama ?? '',
  kategori: produk?.kategori ?? '',
  barcode: produk?.barcode ?? '',
  harga: produk?.harga ?? '',
  stok: produk?.stok ?? '',
  stokMinimum: produk?.stokMinimum ?? stokMinimumDefault ?? '',
  satuan: produk?.satuan ?? 'pcs',
})

// Field kosong yang opsional tidak dikirim; stok hanya dikirim saat menambah produk
const keMuatan = (data, modeUbah) => ({
  nama: data.nama,
  kategori: data.kategori,
  harga: data.harga,
  ...(!modeUbah && { stok: data.stok }),
  ...(data.stokMinimum !== '' && { stokMinimum: data.stokMinimum }),
  ...(data.satuan && { satuan: data.satuan }),
  ...(data.barcode && { barcode: data.barcode }),
})

export default function FormProduk({ produk, stokMinimumDefault, semuaKategori, memuat, saatSimpan, saatBatal }) {
  const modeUbah = Boolean(produk)
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm({ resolver: zodResolver(skemaProduk), mode: 'onTouched', defaultValues: keNilaiForm(produk, stokMinimumDefault) })

  const tanganiGalat = (error) => {
    const { kode, pesan } = uraikanGalat(error)
    if (kode === 'DATA_DUPLIKAT') {
      setError(/barcode/i.test(pesan) ? 'barcode' : 'nama', { type: 'server', message: pesan }, { shouldFocus: true })
      return
    }
    if (!terapkanGalatForm(error, setError)) toast.error(pesanGalat(error))
  }

  const kirim = (data) => saatSimpan(keMuatan(data, modeUbah), tanganiGalat)

  return (
    <form onSubmit={handleSubmit(kirim)} noValidate className="max-w-3xl lg:rounded-3xl lg:bg-kuning lg:p-9">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <KolomInput label="Nama Produk" placeholder="mis. Beras Premium 5 kg" galat={errors.nama?.message} className="md:col-span-2" autoFocus={!modeUbah} {...register('nama')} />
        <KolomInput label="Kategori" list="daftar-kategori" placeholder="Pilih atau ketik kategori" autoComplete="off" galat={errors.kategori?.message} {...register('kategori')} />
        <datalist id="daftar-kategori">
          {semuaKategori.map((nama) => (
            <option key={nama} value={nama} />
          ))}
        </datalist>
        <KolomInput label="Barcode" placeholder="Opsional · 8–20 karakter" inputMode="numeric" autoComplete="off" galat={errors.barcode?.message} {...register('barcode')} />
        <Controller name="harga" control={control} render={({ field }) => <KolomAngka label="Harga Jual" awalan="Rp" placeholder="0" galat={errors.harga?.message} {...field} />} />
        <Controller
          name="stok"
          control={control}
          render={({ field }) => (
            <KolomAngka
              label={modeUbah ? 'Stok Saat Ini' : 'Stok Awal'}
              placeholder="0"
              readOnly={modeUbah}
              galat={errors.stok?.message}
              bantuan={modeUbah ? 'Ubah stok lewat Stok Opname agar alasannya tercatat.' : undefined}
              {...field}
            />
          )}
        />
        <Controller name="stokMinimum" control={control} render={({ field }) => <KolomAngka label="Stok Minimum" placeholder={String(stokMinimumDefault ?? 5)} galat={errors.stokMinimum?.message} {...field} />} />
        <KolomInput label="Satuan" list="daftar-satuan" placeholder="pcs" autoComplete="off" galat={errors.satuan?.message} {...register('satuan')} />
        <datalist id="daftar-satuan">
          {SATUAN_PRODUK.map((satuan) => (
            <option key={satuan} value={satuan} />
          ))}
        </datalist>
      </div>

      <div className="mt-6 flex flex-col gap-2 text-xs text-zaitun">
        <p>Nama dan barcode tidak boleh kembar. Harga dan stok tidak boleh negatif.</p>
        <p>Mengubah harga nanti tidak memengaruhi transaksi lama.</p>
      </div>

      <div className="mt-8 flex flex-col gap-3 md:flex-row md:gap-4">
        <Tombol type="submit" ukuran="besar" memuat={memuat} disabled={modeUbah && !isDirty} className="rounded-xl md:w-48">
          Simpan
        </Tombol>
        <Tombol varian="terang" ukuran="besar" onClick={saatBatal} disabled={memuat} className="rounded-xl md:w-48">
          Batal
        </Tombol>
      </div>
    </form>
  )
}
