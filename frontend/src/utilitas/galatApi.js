const PESAN_JARINGAN = 'Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.'
const PESAN_UMUM = 'Terjadi kesalahan. Silakan coba lagi.'

// Menyeragamkan galat Axios menjadi { pesan, kode, status, galat[] }
export const uraikanGalat = (error) => {
  const respons = error?.response
  if (!respons) {
    return { pesan: PESAN_JARINGAN, kode: 'JARINGAN', status: 0, galat: [] }
  }
  const data = respons.data || {}
  return {
    pesan: data.pesan || PESAN_UMUM,
    kode: data.kodeGalat || 'GALAT_SERVER',
    status: respons.status,
    galat: Array.isArray(data.galat) ? data.galat : [],
  }
}

export const pesanGalat = (error) => {
  const { pesan, galat } = uraikanGalat(error)
  return galat.length > 0 && pesan === 'Validasi gagal' ? galat[0].pesan : pesan
}

// Menempelkan galat validasi server ke field React Hook Form yang sesuai
export const terapkanGalatForm = (error, setError, petaField = {}) => {
  const { galat } = uraikanGalat(error)
  let adaYangCocok = false
  galat.forEach(({ field, pesan }) => {
    const nama = petaField[field] || field
    if (nama) {
      setError(nama, { type: 'server', message: pesan })
      adaYangCocok = true
    }
  })
  return adaYangCocok
}
