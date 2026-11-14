import { Navigate, Outlet, useLocation } from 'react-router-dom'
import PemuatHalaman from '../komponen/tataletak/PemuatHalaman.jsx'
import { gunakanAuth } from '../hook/gunakanAuth.js'

// Penjaga rute: wajib login, dan (bila `peran` diisi) wajib berperan sesuai
export default function RuteTerproteksi({ peran }) {
  const { pengguna, sedangMemeriksa, keluarSengaja } = gunakanAuth()
  const lokasi = useLocation()

  if (sedangMemeriksa && !pengguna) return <PemuatHalaman layarPenuh />
  if (!pengguna) {
    const state = keluarSengaja ? undefined : { dari: lokasi.pathname + lokasi.search }
    return <Navigate to="/masuk" replace state={state} />
  }
  if (peran && !peran.includes(pengguna.role)) return <Navigate to="/akses-ditolak" replace />
  return <Outlet />
}
