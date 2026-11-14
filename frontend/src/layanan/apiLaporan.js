import klienApi, { ambilData } from './klienApi.js'

export const ambilRingkasan = () => klienApi.get('/laporan/ringkasan').then(ambilData)
export const ambilOmzetHarian = (params) =>
  klienApi.get('/laporan/omzet-harian', { params }).then(ambilData)
export const ambilProdukTerlaris = (params) =>
  klienApi.get('/laporan/produk-terlaris', { params }).then(ambilData)
export const unduhEkspor = (params) =>
  klienApi.get('/laporan/ekspor', { params, responseType: 'blob', timeout: 60_000 }).then((r) => r.data)
