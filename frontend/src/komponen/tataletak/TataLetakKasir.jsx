import { Suspense } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import Avatar from '../umum/Avatar.jsx'
import NavBawah from './NavBawah.jsx'
import PemuatHalaman from './PemuatHalaman.jsx'
import { gabungKelas } from '../../utilitas/gabungKelas.js'
import { LABEL_PERAN } from '../../utilitas/konstanta.js'
import { gunakanAuth } from '../../hook/gunakanAuth.js'
import { MENU_DASHBOARD, MENU_KASIR, menuAktif } from './navigasi.js'

// Bilah atas kasir; pemilik yang membuka kasir mendapat jalan pulang ke Dashboard
export default function TataLetakKasir() {
  const { pathname } = useLocation()
  const { pengguna, adalahPemilik } = gunakanAuth()
  const menu = adalahPemilik ? [...MENU_KASIR, MENU_DASHBOARD] : MENU_KASIR

  return (
    <div className="flex min-h-dvh flex-col bg-latar">
      <header className="sticky top-0 z-30 bg-kuning print:hidden">
        <div className="mx-auto flex h-18 max-w-[1440px] items-center gap-8 px-5 lg:px-10">
          <Link to="/kasir" className="text-3xl font-extrabold tracking-tight text-tinta">
            LARIS
          </Link>
          <nav aria-label="Navigasi utama" className="hidden flex-1 lg:block">
            <ul className="flex items-center gap-2">
              {menu.map((item) => {
                const aktif = menuAktif(item, pathname)
                return (
                  <li key={item.ke}>
                    <Link
                      to={item.ke}
                      aria-current={aktif ? 'page' : undefined}
                      className={gabungKelas(
                        'flex min-h-11 items-center rounded-full px-8 text-sm font-bold text-black transition-colors',
                        aktif ? 'bg-jingga' : 'hover:bg-kuning-tua',
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
          <Link to="/profil" className="ml-auto flex items-center gap-3 rounded-full py-1 pl-1 pr-1 transition-colors hover:bg-kuning-tua lg:pr-5" aria-label={`Profil ${pengguna?.nama ?? ''}`}>
            <Avatar />
            <span className="hidden min-w-0 lg:block">
              <span className="block max-w-40 truncate text-sm font-bold text-tinta">{pengguna?.nama}</span>
              <span className="block text-[11px] text-zaitun">{LABEL_PERAN[pengguna?.role]}</span>
            </span>
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 pb-28 pt-5 lg:px-10 lg:pb-10 lg:pt-7">
        <Suspense fallback={<PemuatHalaman />}>
          <Outlet />
        </Suspense>
      </main>
      <NavBawah menu={menu} />
    </div>
  )
}
