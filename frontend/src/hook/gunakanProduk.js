import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import * as apiProduk from '../layanan/apiProduk.js'
import { KATEGORI_PRODUK, PER_HALAMAN_KASIR } from '../utilitas/konstanta.js'
import { pesanGalat } from '../utilitas/galatApi.js'

const KUNCI = 'produk'

export const gunakanDaftarProduk = (params, opsi = {}) =>
  useQuery({
    queryKey: [KUNCI, 'daftar', params],
    queryFn: () => apiProduk.ambilDaftarProduk(params),
    placeholderData: keepPreviousData,
    ...opsi,
  })

export const gunakanProduk = (id) =>
  useQuery({
    queryKey: [KUNCI, 'detail', id],
    queryFn: () => apiProduk.ambilProduk(id),
    enabled: Boolean(id),
  })

export const gunakanStokMenipis = (opsi = {}) =>
  useQuery({ queryKey: [KUNCI, 'menipis'], queryFn: apiProduk.ambilStokMenipis, ...opsi })

export const gunakanMutasiStok = (id) =>
  useQuery({
    queryKey: [KUNCI, 'mutasi', id],
    queryFn: () => apiProduk.ambilMutasi(id),
    enabled: Boolean(id),
  })

// Daftar kategori = bawaan + kategori bebas yang sudah dipakai produk
export const gunakanKategori = () => {
  const { data } = useQuery({
    queryKey: [KUNCI, 'daftar', { perHalaman: PER_HALAMAN_KASIR }],
    queryFn: () => apiProduk.ambilDaftarProduk({ perHalaman: PER_HALAMAN_KASIR }),
    staleTime: 60_000,
  })
  const terpakai = new Set((data?.data ?? []).map((produk) => produk.kategori))
  const urutanBawaan = KATEGORI_PRODUK.filter((kategori) => terpakai.has(kategori))
  const tambahan = [...terpakai].filter((kategori) => !KATEGORI_PRODUK.includes(kategori)).sort()
  return {
    kategoriTerpakai: [...urutanBawaan, ...tambahan],
    semuaKategori: [...KATEGORI_PRODUK, ...tambahan],
  }
}

const gunakanMutasi = (fungsi, pesanSukses) => {
  const klienQuery = useQueryClient()
  return useMutation({
    mutationFn: fungsi,
    onSuccess: (hasil, variabel) => {
      klienQuery.invalidateQueries({ queryKey: [KUNCI] })
      klienQuery.invalidateQueries({ queryKey: ['laporan'] })
      const pesan = typeof pesanSukses === 'function' ? pesanSukses(hasil, variabel) : pesanSukses
      if (pesan) toast.success(pesan)
    },
  })
}

export const gunakanTambahProduk = () =>
  gunakanMutasi(apiProduk.tambahProduk, (produk) => `${produk.nama} berhasil ditambahkan`)

export const gunakanUbahProduk = () =>
  gunakanMutasi(({ id, data }) => apiProduk.ubahProduk(id, data), (produk) => `${produk.nama} berhasil diperbarui`)

export const gunakanHapusProduk = () => {
  const mutasi = gunakanMutasi(({ id }) => apiProduk.hapusProduk(id), (_, { nama }) => `${nama} dihapus dari katalog`)
  return { ...mutasi, hapus: (produk, opsi) => mutasi.mutate({ id: produk._id, nama: produk.nama }, { onError: (e) => toast.error(pesanGalat(e)), ...opsi }) }
}

export const gunakanOpname = () =>
  gunakanMutasi(
    ({ id, data }) => apiProduk.simpanOpname(id, data),
    (hasil) =>
      hasil.selisih === 0
        ? 'Stok sudah sesuai, tidak ada perubahan'
        : `Stok ${hasil.produk.nama} disesuaikan menjadi ${hasil.produk.stok}`,
  )
