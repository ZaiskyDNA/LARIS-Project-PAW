import klienApi, { ambilData } from './klienApi.js'

export const ambilPengaturan = () => klienApi.get('/pengaturan').then(ambilData)
export const ubahPengaturan = (data) => klienApi.put('/pengaturan', data).then(ambilData)
