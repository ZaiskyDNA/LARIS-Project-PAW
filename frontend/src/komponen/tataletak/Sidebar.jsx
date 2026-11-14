import { Link, useLocation } from 'react-router-dom'
import Avatar from '../umum/Avatar.jsx'
import { gabungKelas } from '../../utilitas/gabungKelas.js'
import { LABEL_PERAN } from '../../utilitas/konstanta.js'
import { gunakanAuth } from '../../hook/gunakanAuth.js'
import { MENU_SAMPING_PEMILIK, menuAktif } from './navigasi.js'

export default function Sidebar() {
  const { pathname } = useLocation()
  const { pengguna } = gunakanAuth()
  const diProfil = pathname === '/profil'

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col bg-kuning px-5 py-8 print:hidden lg:flex">
      <Link to="/" className="mb-8 self-center text-[40px] font-extrabold leading-none tracking-tight text-black">
        LARIS
      </Link>
      <nav aria-label="Navigasi utama" className="flex-1">
        <ul className="flex flex-col gap-3.5">
          {MENU_SAMPING_PEMILIK.map((item) => {
            const aktif = menuAktif(item, pathname)
            return (
              <li key={item.ke}>
                <Link
                  to={item.ke}
                  aria-current={aktif ? 'page' : undefined}
                  className={gabungKelas(
                    'flex min-h-11 items-center gap-5 rounded-full px-7 text-lg font-bold text-black transition-colors',
                    aktif ? 'bg-jingga' : 'hover:bg-kuning-tua',
                  )}
                >
                  <item.ikon className="size-5 shrink-0" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <Link
        to="/profil"
        aria-current={diProfil ? 'page' : undefined}
        className={gabungKelas(
          'mx-3 block rounded-2xl bg-krem px-4 py-4 shadow-kartu transition-transform hover:-translate-y-0.5',
          diProfil && 'outline-2 outline-offset-4 outline-jingga',
        )}
      >
        <p className="text-lg font-bold text-black">Profile</p>
        <div className="mt-3 flex items-center gap-4 px-1">
          <Avatar />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-black">{pengguna?.nama}</p>
            <p className="text-[11px] text-zaitun">{LABEL_PERAN[pengguna?.role]}</p>
          </div>
        </div>
      </Link>
    </aside>
  )
}
