import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import * as apiPengaturan from '../layanan/apiPengaturan.js'

const KUNCI = ['pengaturan']

export const gunakanPengaturan = () =>
  useQuery({ queryKey: KUNCI, queryFn: apiPengaturan.ambilPengaturan, staleTime: 5 * 60_000 })

export const gunakanUbahPengaturan = () => {
  const klienQuery = useQueryClient()
  return useMutation({
    mutationFn: apiPengaturan.ubahPengaturan,
    onSuccess: (pengaturan) => {
      klienQuery.setQueryData(KUNCI, pengaturan)
      toast.success('Pengaturan toko tersimpan')
    },
  })
}
