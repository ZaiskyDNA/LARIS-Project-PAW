import klienApi, { ambilData, ambilDataMeta } from './klienApi.js'

export const buatTransaksi = (data) => klienApi.post('/transaksi', data).then(ambilData)
export const ambilDaftarTransaksi = (params = {}) =>
  klienApi.get('/transaksi', { params }).then(ambilDataMeta)
export const ambilTransaksi = (id) => klienApi.get(`/transaksi/${id}`).then(ambilData)
export const buatSesiQris = (id) => klienApi.post(`/transaksi/${id}/bayar-qris`).then(ambilData)
export const cekStatusQris = (id) => klienApi.post(`/transaksi/${id}/cek-status`).then(ambilData)
export const batalkanQris = (id) => klienApi.post(`/transaksi/${id}/batalkan`).then(ambilData)
export const simulasiBayarQris = (id) => klienApi.post(`/transaksi/${id}/simulasi-bayar`).then(ambilData)
