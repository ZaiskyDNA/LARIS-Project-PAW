import klienApi, { ambilData } from './klienApi.js'

export const ambilDaftarPengguna = (params = {}) => klienApi.get('/users', { params }).then(ambilData)
export const buatPengguna = (data) => klienApi.post('/users', data).then(ambilData)
export const ubahPengguna = (id, data) => klienApi.patch(`/users/${id}`, data).then(ambilData)
