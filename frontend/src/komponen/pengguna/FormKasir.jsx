import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import Modal from '../umum/Modal.jsx'
import Tombol from '../umum/Tombol.jsx'
import { KolomInput } from '../umum/KolomInput.jsx'
import { gunakanBuatKasir, gunakanUbahKasir } from '../../hook/gunakanPengguna.js'
import { kekuatanKataSandi, skemaKasirBaru, skemaUbahKasir } from '../../skema/skemaPengguna.js'
import { pesanGalat, terapkanGalatForm, uraikanGalat } from '../../utilitas/galatApi.js'
import { gabungKelas } from '../../utilitas/gabungKelas.js'

const TINGKAT = [
  { label: 'Terlalu pendek', warna: 'bg-merah' },
  { label: 'Lemah', warna: 'bg-merah' },
  { label: 'Cukup', warna: 'bg-jingga' },
  { label: 'Kuat', warna: 'bg-hijau' },
  { label: 'Sangat kuat', warna: 'bg-hijau' },
]

function IndikatorKekuatan({ kataSandi }) {
  if (!kataSandi) return null
  const skor = kekuatanKataSandi(kataSandi)
  return (
    <div aria-live="polite">
      <div className="flex gap-1.5" aria-hidden="true">
        {[1, 2, 3, 4].map((langkah) => (
          <span key={langkah} className={gabungKelas('h-1.5 flex-1 rounded-full', langkah <= skor ? TINGKAT[skor].warna : 'bg-pasir')} />
        ))}
      </div>
      <p className="mt-1 text-xs font-semibold text-zaitun">Kekuatan kata sandi: {TINGKAT[skor].label}</p>
    </div>
  )
}

// `akun` terisi = mode ubah (hanya nama); kosong = buat akun kasir baru (US-07)
function IsiForm({ akun, saatTutup }) {
  const modeUbah = Boolean(akun)
  const buat = gunakanBuatKasir()
  const ubah = gunakanUbahKasir()
  const memuat = buat.isPending || ubah.isPending

  const {
    control,
    register,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(modeUbah ? skemaUbahKasir : skemaKasirBaru),
    mode: 'onTouched',
    defaultValues: { nama: akun?.nama ?? '', email: akun?.email ?? '', password: '' },
  })

  const kataSandi = useWatch({ control, name: 'password' })

  useEffect(() => setFocus('nama'), [setFocus])

  const tanganiGalat = (error) => {
    const { kode, pesan } = uraikanGalat(error)
    if (kode === 'DATA_DUPLIKAT') setError('email', { type: 'server', message: pesan }, { shouldFocus: true })
    else if (!terapkanGalatForm(error, setError)) toast.error(pesanGalat(error))
  }

  const kirim = (data) => {
    const opsi = { onSuccess: saatTutup, onError: tanganiGalat }
    if (modeUbah) ubah.mutate({ id: akun._id, data: { nama: data.nama } }, opsi)
    else buat.mutate({ nama: data.nama, email: data.email.toLowerCase(), password: data.password }, opsi)
  }

  return (
    <form onSubmit={handleSubmit(kirim)} noValidate className="flex flex-col gap-5">
      <KolomInput label="Nama" placeholder="mis. Rani Putri" autoComplete="off" galat={errors.nama?.message} {...register('nama')} />
      <KolomInput
        label="Email"
        type="email"
        inputMode="email"
        placeholder="nama@berkah.id"
        autoComplete="off"
        readOnly={modeUbah}
        bantuan={modeUbah ? 'Email tidak dapat diubah.' : undefined}
        galat={errors.email?.message}
        {...register('email')}
      />
      {!modeUbah && (
        <>
          <KolomInput label="Kata Sandi" type="password" autoComplete="new-password" bantuan="Minimal 8 karakter, mengandung huruf dan angka." galat={errors.password?.message} {...register('password')} />
          <IndikatorKekuatan kataSandi={kataSandi} />
        </>
      )}
      <div className="mt-1 grid grid-cols-2 gap-4 pb-2">
        <Tombol varian="sekunder" ukuran="besar" onClick={saatTutup} disabled={memuat} className="rounded-xl">
          Batal
        </Tombol>
        <Tombol type="submit" ukuran="besar" memuat={memuat} className="rounded-xl">
          {modeUbah ? 'Simpan' : 'Buat Akun'}
        </Tombol>
      </div>
    </form>
  )
}

export default function FormKasir({ buka, akun, saatTutup }) {
  return (
    <Modal buka={buka} saatTutup={saatTutup} judul={akun ? 'Ubah Akun Kasir' : 'Buat Akun Kasir'}>
      <IsiForm akun={akun} saatTutup={saatTutup} />
    </Modal>
  )
}
