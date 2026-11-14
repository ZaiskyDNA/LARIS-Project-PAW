import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import RuteTerproteksi from './RuteTerproteksi.jsx'
import TataLetakPemilik from '../komponen/tataletak/TataLetakPemilik.jsx'
import TataLetakKasir from '../komponen/tataletak/TataLetakKasir.jsx'
import PemuatHalaman from '../komponen/tataletak/PemuatHalaman.jsx'
import Login from '../halaman/Login.jsx'
import { gunakanAuth } from '../hook/gunakanAuth.js'
import { PERAN } from '../utilitas/konstanta.js'

const Dashboard = lazy(() => import('../halaman/Dashboard.jsx'))
const Kasir = lazy(() => import('../halaman/Kasir.jsx'))
const ManajemenProduk = lazy(() => import('../halaman/ManajemenProduk.jsx'))
const FormProdukHalaman = lazy(() => import('../halaman/FormProdukHalaman.jsx'))
const RiwayatMutasi = lazy(() => import('../halaman/RiwayatMutasi.jsx'))
const RiwayatTransaksi = lazy(() => import('../halaman/RiwayatTransaksi.jsx'))
const Laporan = lazy(() => import('../halaman/Laporan.jsx'))
const ManajemenKasir = lazy(() => import('../halaman/ManajemenKasir.jsx'))
const Pengaturan = lazy(() => import('../halaman/Pengaturan.jsx'))
const Profil = lazy(() => import('../halaman/Profil.jsx'))
const AksesDitolak = lazy(() => import('../halaman/AksesDitolak.jsx'))
const TidakDitemukan = lazy(() => import('../halaman/TidakDitemukan.jsx'))

// "/" adalah Dashboard pemilik; kasir langsung diarahkan ke halaman Kasir (US-08)
function TataLetakBeranda() {
  const { adalahPemilik } = gunakanAuth()
  return adalahPemilik ? <TataLetakPemilik /> : <Navigate to="/kasir" replace />
}

function TataLetakProfil() {
  const { adalahPemilik } = gunakanAuth()
  return adalahPemilik ? <TataLetakPemilik /> : <TataLetakKasir />
}

export default function RuteAplikasi() {
  return (
    <Suspense fallback={<PemuatHalaman layarPenuh />}>
      <Routes>
        <Route path="/masuk" element={<Login />} />

        <Route element={<RuteTerproteksi />}>
          <Route element={<TataLetakBeranda />}>
            <Route index element={<Dashboard />} />
          </Route>
          <Route element={<TataLetakKasir />}>
            <Route path="/kasir" element={<Kasir />} />
            <Route path="/transaksi" element={<RiwayatTransaksi />} />
          </Route>
          <Route element={<TataLetakProfil />}>
            <Route path="/profil" element={<Profil />} />
          </Route>
        </Route>

        <Route element={<RuteTerproteksi peran={[PERAN.PEMILIK]} />}>
          <Route element={<TataLetakPemilik />}>
            <Route path="/produk" element={<ManajemenProduk />} />
            <Route path="/produk/opname" element={<Navigate to="/produk?tab=menipis" replace />} />
            <Route path="/produk/tambah" element={<FormProdukHalaman />} />
            <Route path="/produk/:id/ubah" element={<FormProdukHalaman />} />
            <Route path="/produk/:id/mutasi" element={<RiwayatMutasi />} />
            <Route path="/laporan" element={<Laporan />} />
            <Route path="/pengguna" element={<ManajemenKasir />} />
            <Route path="/pengaturan" element={<Pengaturan />} />
          </Route>
        </Route>

        <Route path="/akses-ditolak" element={<AksesDitolak />} />
        <Route path="*" element={<TidakDitemukan />} />
      </Routes>
    </Suspense>
  )
}
