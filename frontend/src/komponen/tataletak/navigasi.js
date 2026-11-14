import { Ellipsis, FileChartColumn, History, LayoutDashboard, Package, Settings, Users, WalletCards } from 'lucide-react'

// `cocok`: awalan path lain yang juga menandai menu ini aktif
export const MENU_SAMPING_PEMILIK = [
  { ke: '/', label: 'Dashboard', ikon: LayoutDashboard, persis: true },
  { ke: '/produk', label: 'Produk & Stok', ikon: Package },
  { ke: '/laporan', label: 'Laporan', ikon: FileChartColumn },
  { ke: '/pengguna', label: 'Kasir', ikon: Users },
  { ke: '/pengaturan', label: 'Pengaturan', ikon: Settings },
]

export const MENU_BAWAH_PEMILIK = [
  { ke: '/', label: 'Dashboard', ikon: LayoutDashboard, persis: true },
  { ke: '/produk', label: 'Produk', ikon: Package },
  { ke: '/laporan', label: 'Laporan', ikon: FileChartColumn },
  { ke: '/profil', label: 'Lainnya', ikon: Ellipsis, cocok: ['/pengguna', '/pengaturan'] },
]

export const MENU_KASIR = [
  { ke: '/kasir', label: 'Transaksi', ikon: WalletCards },
  { ke: '/transaksi', label: 'Riwayat', ikon: History },
]

export const MENU_DASHBOARD = { ke: '/', label: 'Dashboard', ikon: LayoutDashboard, persis: true }

export const menuAktif = (menu, pathname) => {
  if (menu.persis) return pathname === menu.ke
  return [menu.ke, ...(menu.cocok ?? [])].some((awalan) => pathname === awalan || pathname.startsWith(`${awalan}/`))
}
