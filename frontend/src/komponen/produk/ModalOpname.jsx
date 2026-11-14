import { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import Modal from '../umum/Modal.jsx'
import Tombol from '../umum/Tombol.jsx'
import { KolomAngka, KolomInput, KolomPilih } from '../umum/KolomInput.jsx'
import { gunakanOpname } from '../../hook/gunakanProduk.js'
import { skemaOpname } from '../../skema/skemaProduk.js'
import { ALASAN_OPNAME } from '../../utilitas/konstanta.js'
import { pesanGalat, terapkanGalatForm } from '../../utilitas/galatApi.js'
import { gabungKelas } from '../../utilitas/gabungKelas.js'

const NILAI_AWAL = { stokFisik: '', alasan: '', catatan: '' }

const teksSelisih = (selisih) => (selisih > 0 ? `+${selisih}` : selisih < 0 ? `−${Math.abs(selisih)}` : '0')

// Stok opname (US-13): stok fisik → selisih terhadap sistem → alasan wajib
export default function ModalOpname({ produk, saatTutup }) {
  const opname = gunakanOpname()
  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(skemaOpname), defaultValues: NILAI_AWAL })

  useEffect(() => {
    if (produk) reset({ ...NILAI_AWAL, stokFisik: produk.stok })
  }, [produk, reset])

  const stokFisik = useWatch({ control, name: 'stokFisik' })
  const selisih = produk && stokFisik !== '' ? stokFisik - produk.stok : null

  const kirim = (data) => {
    const muatan = { stokFisik: data.stokFisik, alasan: data.alasan, ...(data.catatan && { catatan: data.catatan }) }
    opname.mutate(
      { id: produk._id, data: muatan },
      {
        onSuccess: saatTutup,
        onError: (error) => {
          if (!terapkanGalatForm(error, setError)) toast.error(pesanGalat(error))
        },
      },
    )
  }

  return (
    <Modal buka={Boolean(produk)} saatTutup={saatTutup} judul="Stok Opname" subjudul={produk?.nama} terkunci={opname.isPending}>
      <form onSubmit={handleSubmit(kirim)} noValidate className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4 rounded-2xl bg-kuning px-6 py-4 shadow-kolom">
          <div>
            <p className="text-xs font-bold text-tinta">Stok di sistem</p>
            <p className="angka text-2xl font-extrabold text-tinta">{produk?.stok}</p>
          </div>
          <div aria-live="polite">
            <p className="text-xs font-bold text-tinta">Selisih</p>
            <p className={gabungKelas('angka text-2xl font-extrabold', selisih > 0 ? 'text-hijau' : selisih < 0 ? 'text-merah' : 'text-tinta')}>
              {selisih === null ? '–' : teksSelisih(selisih)}
            </p>
          </div>
        </div>

        <Controller
          name="stokFisik"
          control={control}
          render={({ field }) => <KolomAngka label="Stok fisik (hasil hitung)" galat={errors.stokFisik?.message} autoFocus {...field} />}
        />
        <KolomPilih label="Alasan selisih (wajib)" galat={errors.alasan?.message} {...register('alasan')}>
          <option value="">Pilih alasan…</option>
          {ALASAN_OPNAME.map((alasan) => (
            <option key={alasan.nilai} value={alasan.nilai}>
              {alasan.label}
            </option>
          ))}
        </KolomPilih>
        <KolomInput label="Catatan (opsional)" placeholder="mis. Kemasan sobek 2 pcs" maxLength={200} galat={errors.catatan?.message} {...register('catatan')} />

        <p className="text-xs text-zaitun">Setiap penyesuaian tercatat di riwayat mutasi beserta nama Anda dan waktunya.</p>

        <div className="grid grid-cols-2 gap-4 pb-2">
          <Tombol varian="sekunder" ukuran="besar" onClick={saatTutup} disabled={opname.isPending} className="rounded-xl">
            Batal
          </Tombol>
          <Tombol type="submit" ukuran="besar" memuat={opname.isPending} disabled={selisih === 0} className="rounded-xl">
            Simpan Opname
          </Tombol>
        </div>
      </form>
    </Modal>
  )
}
