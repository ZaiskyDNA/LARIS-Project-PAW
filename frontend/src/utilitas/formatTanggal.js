const ZONA = 'Asia/Jakarta'

const buat = (opsi) => new Intl.DateTimeFormat('id-ID', { timeZone: ZONA, ...opsi })

const pemformatIso = new Intl.DateTimeFormat('en-CA', { timeZone: ZONA })
const pemformatTanggal = buat({ day: 'numeric', month: 'short', year: 'numeric' })
const pemformatTanggalPanjang = buat({ day: 'numeric', month: 'long', year: 'numeric' })
const pemformatTanggalPendek = buat({ day: 'numeric', month: 'short' })
const pemformatJam = buat({ hour: '2-digit', minute: '2-digit', hour12: false })
const pemformatHari = buat({ weekday: 'short' })

// String YYYY-MM-DD dianggap tanggal kalender Jakarta, bukan tengah malam UTC
const keDate = (nilai) =>
  typeof nilai === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(nilai)
    ? new Date(`${nilai}T00:00:00+07:00`)
    : new Date(nilai)

const jam = (nilai) => pemformatJam.format(keDate(nilai)).replace('.', ':')

export const tanggalIso = (nilai = new Date()) => pemformatIso.format(keDate(nilai))
export const hariIniIso = () => tanggalIso(new Date())

export const geserHari = (iso, jumlah) => {
  const tanggal = keDate(iso)
  tanggal.setUTCDate(tanggal.getUTCDate() + jumlah)
  return tanggalIso(tanggal)
}

export const awalBulanIso = (iso = hariIniIso()) => `${iso.slice(0, 8)}01`

export const formatTanggal = (nilai) => pemformatTanggal.format(keDate(nilai))
export const formatTanggalPanjang = (nilai) => pemformatTanggalPanjang.format(keDate(nilai))
export const formatTanggalPendek = (nilai) => pemformatTanggalPendek.format(keDate(nilai))
export const formatJam = (nilai) => jam(nilai)
export const formatHari = (nilai) => pemformatHari.format(keDate(nilai))
export const formatTanggalJam = (nilai) => `${formatTanggal(nilai)} · ${jam(nilai)}`
export const formatTanggalJamPendek = (nilai) => `${formatTanggalPendek(nilai)} ${jam(nilai)}`

export const formatRentang = (mulai, akhir) =>
  mulai === akhir
    ? formatTanggal(mulai)
    : `${mulai.slice(0, 4) === akhir.slice(0, 4) ? formatTanggalPendek(mulai) : formatTanggal(mulai)} – ${formatTanggal(akhir)}`

export const selisihHari = (mulai, akhir) =>
  Math.round((keDate(akhir) - keDate(mulai)) / 86_400_000)

export const formatDurasi = (detik) =>
  `${String(Math.floor(detik / 60)).padStart(2, '0')}:${String(detik % 60).padStart(2, '0')}`
