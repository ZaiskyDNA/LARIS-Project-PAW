import { Link, useLocation } from 'react-router-dom'
import { gabungKelas } from '../../utilitas/gabungKelas.js'
import { menuAktif } from './navigasi.js'

// Navigasi bawah untuk HP & tablet; ikon aktif dibungkus pil jingga
export default function NavBawah({ menu }) {
  const { pathname } = useLocation()
  return (
    <nav aria-label="Navigasi utama" className="aman-bawah fixed inset-x-0 bottom-0 z-30 bg-kuning pt-2 print:hidden lg:hidden">
      <ul className="mx-auto flex max-w-xl items-stretch justify-around">
        {menu.map((item) => {
          const aktif = menuAktif(item, pathname)
          return (
            <li key={item.ke} className="flex-1">
              <Link to={item.ke} aria-current={aktif ? 'page' : undefined} className="group flex min-h-14 flex-col items-center justify-center gap-1">
                <span className={gabungKelas('flex h-8 w-14 items-center justify-center rounded-full transition-colors', aktif ? 'bg-jingga text-black' : 'text-black group-hover:bg-kuning-tua')}>
                  <item.ikon className="size-5" aria-hidden="true" />
                </span>
                <span className="text-xs font-bold text-black">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
