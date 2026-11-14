import { gabungKelas } from '../../utilitas/gabungKelas.js'
import { STATUS_STOK } from '../../utilitas/konstanta.js'

export function Lencana({ kelas, className, children }) {
  return (
    <span
      className={gabungKelas(
        'inline-flex min-w-18 items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold',
        kelas,
        className,
      )}
    >
      {children}
    </span>
  )
}

export function BadgeStok({ status, className }) {
  const konfigurasi = STATUS_STOK[status] ?? STATUS_STOK.aman
  return (
    <Lencana kelas={konfigurasi.kelas} className={className}>
      {konfigurasi.label}
    </Lencana>
  )
}

// Bulatan merah berisi jumlah, mis. hitungan stok menipis pada tab
export function LencanaJumlah({ jumlah, className }) {
  if (!jumlah) return null
  return (
    <span
      className={gabungKelas(
        'angka inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-merah px-1.5 text-xs font-bold text-white',
        className,
      )}
    >
      {jumlah}
    </span>
  )
}
