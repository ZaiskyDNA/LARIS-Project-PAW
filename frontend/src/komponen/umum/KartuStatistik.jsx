import { gabungKelas } from '../../utilitas/gabungKelas.js'
import Skeleton from './Skeleton.jsx'

export default function KartuStatistik({ label, nilai, keterangan, memuat = false, tekanan = false, className }) {
  return (
    <div className={gabungKelas('rounded-2xl bg-kuning px-5 py-4', className)}>
      <p className="text-xs font-bold text-tinta">{label}</p>
      {memuat ? (
        <Skeleton className="mt-2 h-8 w-32" />
      ) : (
        <p className={gabungKelas('angka mt-1 truncate text-2xl font-extrabold tracking-tight lg:text-[28px]', tekanan ? 'text-merah' : 'text-tinta')}>
          {nilai}
        </p>
      )}
      {keterangan && <p className="mt-0.5 text-xs text-zaitun">{keterangan}</p>}
    </div>
  )
}
