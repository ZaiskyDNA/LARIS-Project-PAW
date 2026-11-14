import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import * as apiPengguna from '../layanan/apiPengguna.js'
import { PERAN } from '../utilitas/konstanta.js'

const KUNCI = 'pengguna'

export const gunakanDaftarKasir = () =>
  useQuery({
    queryKey: [KUNCI, PERAN.KASIR],
    queryFn: () => apiPengguna.ambilDaftarPengguna({ role: PERAN.KASIR }),
  })

const gunakanMutasi = (fungsi, pesanSukses) => {
  const klienQuery = useQueryClient()
  return useMutation({
    mutationFn: fungsi,
    onSuccess: (hasil) => {
      klienQuery.invalidateQueries({ queryKey: [KUNCI] })
      toast.success(pesanSukses(hasil))
    },
  })
}

export const gunakanBuatKasir = () =>
  gunakanMutasi(
    (data) => apiPengguna.buatPengguna({ ...data, role: PERAN.KASIR }),
    (akun) => `Akun kasir ${akun.nama} berhasil dibuat`,
  )

export const gunakanUbahKasir = () =>
  gunakanMutasi(
    ({ id, data }) => apiPengguna.ubahPengguna(id, data),
    (akun) => `Akun ${akun.nama} diperbarui`,
  )

export const gunakanUbahStatusKasir = () =>
  gunakanMutasi(
    ({ id, isAktif }) => apiPengguna.ubahPengguna(id, { isAktif }),
    (akun) => `Akun ${akun.nama} ${akun.isAktif ? 'diaktifkan kembali' : 'dinonaktifkan'}`,
  )
