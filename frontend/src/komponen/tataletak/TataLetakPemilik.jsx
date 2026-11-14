import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import NavBawah from './NavBawah.jsx'
import PemuatHalaman from './PemuatHalaman.jsx'
import { MENU_BAWAH_PEMILIK } from './navigasi.js'

export default function TataLetakPemilik() {
  return (
    <div className="min-h-dvh bg-latar lg:pl-72">
      <Sidebar />
      <main className="mx-auto max-w-[1240px] px-4 pb-28 lg:px-10 lg:pb-12 lg:pt-10">
        <Suspense fallback={<PemuatHalaman />}>
          <Outlet />
        </Suspense>
      </main>
      <NavBawah menu={MENU_BAWAH_PEMILIK} />
    </div>
  )
}
