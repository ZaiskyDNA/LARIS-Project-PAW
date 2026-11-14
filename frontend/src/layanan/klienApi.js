import axios from 'axios'
import { KUNCI_TOKEN, PERISTIWA_SESI_HABIS } from '../utilitas/konstanta.js'

const klienApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 20_000,
})

klienApi.interceptors.request.use((konfigurasi) => {
  const token = localStorage.getItem(KUNCI_TOKEN)
  if (token) konfigurasi.headers.Authorization = `Bearer ${token}`
  return konfigurasi
})

klienApi.interceptors.response.use(
  (respons) => respons,
  (error) => {
    const kode = error.response?.data?.kodeGalat
    if (error.response?.status === 401 && kode !== 'KREDENSIAL_SALAH') {
      window.dispatchEvent(new CustomEvent(PERISTIWA_SESI_HABIS))
    }
    return Promise.reject(error)
  },
)

// Respons API selalu { sukses, pesan, data, meta }
export const ambilData = (respons) => respons.data.data
export const ambilDataMeta = (respons) => ({ data: respons.data.data ?? [], meta: respons.data.meta ?? {} })

export default klienApi
