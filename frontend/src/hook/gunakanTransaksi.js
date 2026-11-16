import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as apiTransaksi from '../layanan/apiTransaksi.js'

const KUNCI = 'transaksi'

export const gunakanDaftarTransaksi = (params) =>
  useQuery({
    queryKey: [KUNCI, 'daftar', params],
    queryFn: () => apiTransaksi.ambilDaftarTransaksi(params),
    placeholderData: keepPreviousData,
  })

export const gunakanDetailTransaksi = (id, opsi = {}) =>
  useQuery({
    queryKey: [KUNCI, 'detail', id],
    queryFn: () => apiTransaksi.ambilTransaksi(id),
    enabled: Boolean(id),
    ...opsi,
  })

// Stok & laporan ikut berubah setiap transaksi tersimpan
export const gunakanSegarkanSetelahTransaksi = () => {
  const klienQuery = useQueryClient()
  return () => {
    klienQuery.invalidateQueries({ queryKey: [KUNCI] })
    klienQuery.invalidateQueries({ queryKey: ['produk'] })
    klienQuery.invalidateQueries({ queryKey: ['laporan'] })
  }
}

export const gunakanBuatTransaksi = () => {
  const segarkan = gunakanSegarkanSetelahTransaksi()
  return useMutation({ mutationFn: apiTransaksi.buatTransaksi, onSettled: segarkan })
}

