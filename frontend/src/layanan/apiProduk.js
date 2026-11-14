import klienApi, { ambilData, ambilDataMeta } from './klienApi.js'

const bersihkan = (params) =>
  Object.fromEntries(Object.entries(params).filter(([, nilai]) => nilai !== '' && nilai != null))

export const ambilDaftarProduk = (params = {}) =>
  klienApi.get('/produk', { params: bersihkan(params) }).then(ambilDataMeta)
export const ambilProduk = (id) => klienApi.get(`/produk/${id}`).then(ambilData)
export const ambilProdukBarcode = (kode) =>
  klienApi.get(`/produk/barcode/${encodeURIComponent(kode)}`).then(ambilData)
export const ambilStokMenipis = () => klienApi.get('/produk/stok-menipis').then(ambilData)
export const tambahProduk = (data) => klienApi.post('/produk', data).then(ambilData)
export const ubahProduk = (id, data) => klienApi.put(`/produk/${id}`, data).then(ambilData)
export const hapusProduk = (id) => klienApi.delete(`/produk/${id}`)
export const simpanOpname = (id, data) => klienApi.post(`/produk/${id}/opname`, data).then(ambilData)
export const ambilMutasi = (id) => klienApi.get(`/produk/${id}/mutasi`).then(ambilData)
