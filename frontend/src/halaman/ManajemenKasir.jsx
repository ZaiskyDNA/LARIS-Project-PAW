import { useState } from 'react'
import { Plus, Users } from 'lucide-react'
import KepalaHalaman from '../komponen/tataletak/KepalaHalaman.jsx'
import Tabel from '../komponen/umum/Tabel.jsx'
import Tombol from '../komponen/umum/Tombol.jsx'
import DialogKonfirmasi from '../komponen/umum/DialogKonfirmasi.jsx'
import { Lencana } from '../komponen/umum/Lencana.jsx'
import { StatusKosong } from '../komponen/umum/StatusData.jsx'
import FormKasir from '../komponen/pengguna/FormKasir.jsx'
import { gunakanDaftarKasir, gunakanUbahStatusKasir } from '../hook/gunakanPengguna.js'
import { pesanGalat } from '../utilitas/galatApi.js'
import toast from 'react-hot-toast'

const KELAS_AKSI = 'rounded px-1 py-1 font-bold hover:underline disabled:opacity-50'

const LencanaStatus = ({ aktif }) => <Lencana kelas={aktif ? 'bg-hijau-muda text-hijau' : 'bg-pasir text-zaitun'}>{aktif ? 'Aktif' : 'Nonaktif'}</Lencana>

export default function ManajemenKasir() {
  const kasir = gunakanDaftarKasir()
  const ubahStatus = gunakanUbahStatusKasir()
  const [form, setForm] = useState({ buka: false, akun: null })
  const [akunNonaktif, setAkunNonaktif] = useState(null)

  const bukaForm = (akun = null) => setForm({ buka: true, akun })
  const setStatus = (akun, isAktif, opsi = {}) =>
    ubahStatus.mutate({ id: akun._id, isAktif }, { onError: (error) => toast.error(pesanGalat(error)), ...opsi })
  // Menonaktifkan perlu konfirmasi; mengaktifkan kembali tidak destruktif
  const tanganiStatus = (akun) => (akun.isAktif ? setAkunNonaktif(akun) : setStatus(akun, true))

  const kolom = [
    { kunci: 'no', judul: 'No.', render: (_, nomor) => nomor, kelas: 'w-14 angka' },
    { kunci: 'nama', judul: 'Nama', render: (a) => <span className="font-semibold">{a.nama}</span> },
    { kunci: 'email', judul: 'Email' },
    { kunci: 'status', judul: 'Status', render: (a) => <LencanaStatus aktif={a.isAktif} /> },
    {
      kunci: 'aksi',
      judul: 'Aksi',
      render: (a) => (
        <span className="inline-flex items-center whitespace-nowrap text-xs">
          <button type="button" onClick={() => bukaForm(a)} className={`${KELAS_AKSI} text-cokelat`}>
            Ubah
          </button>
          <span aria-hidden="true" className="text-cokelat">·</span>
          <button type="button" onClick={() => tanganiStatus(a)} disabled={ubahStatus.isPending} className={`${KELAS_AKSI} ${a.isAktif ? 'text-merah' : 'text-hijau'}`}>
            {a.isAktif ? 'Nonaktifkan' : 'Aktifkan'}
          </button>
        </span>
      ),
    },
  ]

  return (
    <>
      <KepalaHalaman
        judul={<><span className="lg:hidden">Manajemen </span>Kasir</>}
        kembali="/profil"
        aksi={
          <div className="hidden md:block">
            <Tombol ikon={Plus} onClick={() => bukaForm()} className="min-h-12 px-6 shadow-kartu">
              Buat Akun Kasir
            </Tombol>
          </div>
        }
      />

      <Tabel
        kolom={kolom}
        data={kasir.data}
        memuat={kasir.isPending}
        galat={kasir.error}
        saatCobaLagi={kasir.refetch}
        kosong={
          <StatusKosong
            ikon={Users}
            judul="Belum ada akun kasir"
            pesan="Buat akun agar karyawan dapat melayani transaksi dengan akunnya sendiri."
            aksi={<Tombol ikon={Plus} onClick={() => bukaForm()}>Buat Akun Kasir</Tombol>}
          />
        }
        renderKartu={(a) => (
          <div className="rounded-2xl bg-kuning px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-tinta">{a.nama}</p>
                <p className="truncate text-sm text-tinta">{a.email}</p>
              </div>
              <LencanaStatus aktif={a.isAktif} />
            </div>
            <div className="mt-3 flex gap-3">
              <Tombol varian="terang" ukuran="kecil" onClick={() => bukaForm(a)} className="min-h-10 px-7">
                Ubah
              </Tombol>
              <Tombol varian={a.isAktif ? 'bahaya' : 'sekunder'} ukuran="kecil" onClick={() => tanganiStatus(a)} disabled={ubahStatus.isPending} className={`min-h-10 px-6 ${a.isAktif ? '' : 'bg-hijau-muda text-hijau'}`}>
                {a.isAktif ? 'Nonaktifkan' : 'Aktifkan'}
              </Tombol>
            </div>
          </div>
        )}
      />

      <div className="fixed bottom-24 right-4 z-20 md:hidden">
        <Tombol ikon={Plus} ukuran="besar" onClick={() => bukaForm()} className="rounded-full px-8 shadow-kartu">
          Buat Akun
        </Tombol>
      </div>

      <FormKasir buka={form.buka} akun={form.akun} saatTutup={() => setForm((lama) => ({ ...lama, buka: false }))} />

      <DialogKonfirmasi
        buka={Boolean(akunNonaktif)}
        judul="Nonaktifkan akun?"
        pesan={`${akunNonaktif?.nama ?? 'Kasir'} tidak akan bisa masuk lagi. Riwayat transaksinya tetap tersimpan, dan akun dapat diaktifkan kembali kapan saja.`}
        labelSetuju="Nonaktifkan"
        memuat={ubahStatus.isPending}
        saatSetuju={() => setStatus(akunNonaktif, false, { onSettled: () => setAkunNonaktif(null) })}
        saatBatal={() => setAkunNonaktif(null)}
      />
    </>
  )
}
