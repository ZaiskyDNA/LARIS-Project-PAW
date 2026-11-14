import { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import KepalaHalaman from '../komponen/tataletak/KepalaHalaman.jsx'
import Tombol from '../komponen/umum/Tombol.jsx'
import Skeleton from '../komponen/umum/Skeleton.jsx'
import { KolomAngka, KolomInput } from '../komponen/umum/KolomInput.jsx'
import { StatusGalat } from '../komponen/umum/StatusData.jsx'
import { gunakanPengaturan, gunakanUbahPengaturan } from '../hook/gunakanPengaturan.js'
import { skemaPengaturan } from '../skema/skemaPengaturan.js'
import { pesanGalat, terapkanGalatForm } from '../utilitas/galatApi.js'

const keNilaiForm = (pengaturan) => ({
  namaToko: pengaturan?.namaToko ?? '',
  alamat: pengaturan?.alamat ?? '',
  telepon: pengaturan?.telepon ?? '',
  stokMinimumDefault: pengaturan?.stokMinimumDefault ?? 5,
})

function PratinjauStruk({ namaToko, alamat, telepon }) {
  return (
    <aside className="rounded-3xl bg-kuning p-5 lg:p-6" aria-label="Pratinjau struk">
      <h2 className="mb-4 text-center text-sm font-bold text-tinta">Pratinjau Struk</h2>
      <div className="min-h-44 rounded-lg border border-kuning-tua bg-white px-4 py-5 text-center text-tinta lg:min-h-64">
        <p className="break-words text-sm font-extrabold">{namaToko || 'Nama toko'}</p>
        <p className="break-words text-[11px]">{alamat || 'Alamat toko'}</p>
        {telepon && <p className="angka text-[11px]">{telepon}</p>}
        <div className="mx-auto mt-4 flex max-w-40 flex-col gap-2 border-t border-dashed border-khaki pt-4" aria-hidden="true">
          <span className="h-1.5 rounded bg-pasir" />
          <span className="h-1.5 w-2/3 rounded bg-pasir" />
          <span className="h-1.5 w-4/5 rounded bg-pasir" />
        </div>
      </div>
    </aside>
  )
}

export default function Pengaturan() {
  const pengaturan = gunakanPengaturan()
  const ubah = gunakanUbahPengaturan()
  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm({ resolver: zodResolver(skemaPengaturan), mode: 'onTouched', defaultValues: keNilaiForm() })

  useEffect(() => {
    if (pengaturan.data) reset(keNilaiForm(pengaturan.data))
  }, [pengaturan.data, reset])

  const [namaToko, alamat, telepon] = useWatch({ control, name: ['namaToko', 'alamat', 'telepon'] })

  const kirim = (data) =>
    ubah.mutate(data, {
      onError: (error) => {
        if (!terapkanGalatForm(error, setError)) toast.error(pesanGalat(error))
      },
    })

  return (
    <>
      <KepalaHalaman judul="Pengaturan Toko" kembali="/profil" />
      {pengaturan.error ? (
        <div className="rounded-3xl bg-kuning">
          <StatusGalat galat={pengaturan.error} saatCobaLagi={pengaturan.refetch} />
        </div>
      ) : pengaturan.isPending ? (
        <Skeleton className="h-[480px] max-w-2xl rounded-3xl" />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start lg:gap-8">
          <form onSubmit={handleSubmit(kirim)} noValidate className="lg:rounded-3xl lg:bg-kuning lg:p-9">
            <div className="flex flex-col gap-5">
              <KolomInput label="Nama Toko" galat={errors.namaToko?.message} {...register('namaToko')} />
              <KolomInput label="Alamat" galat={errors.alamat?.message} {...register('alamat')} />
              <KolomInput label="Nomor Telepon" type="tel" inputMode="tel" placeholder="mis. 0812-3456-7890" galat={errors.telepon?.message} {...register('telepon')} />
              <Controller
                name="stokMinimumDefault"
                control={control}
                render={({ field }) => <KolomAngka label="Stok Minimum Default" galat={errors.stokMinimumDefault?.message} className="lg:max-w-64" {...field} />}
              />
            </div>
            <p className="mt-5 text-xs leading-relaxed text-zaitun">
              Dipakai sebagai batas peringatan stok menipis untuk produk baru yang stok minimumnya tidak diisi. Nama, alamat, dan telepon tercetak di struk.
            </p>
            <Tombol type="submit" ukuran="besar" memuat={ubah.isPending} disabled={!isDirty} className="mt-8 w-full rounded-xl lg:w-44">
              Simpan
            </Tombol>
          </form>
          <PratinjauStruk namaToko={namaToko} alamat={alamat} telepon={telepon} />
        </div>
      )}
    </>
  )
}
