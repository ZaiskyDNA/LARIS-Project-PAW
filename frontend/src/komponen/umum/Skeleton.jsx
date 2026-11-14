import { gabungKelas } from '../../utilitas/gabungKelas.js'

export default function Skeleton({ className }) {
  return <div aria-hidden="true" className={gabungKelas('animate-pulse rounded-xl bg-kuning-tua/60', className)} />
}

export function SkeletonDaftar({ jumlah = 5, tinggi = 'h-16' }) {
  return (
    <div className="flex flex-col gap-3" role="status" aria-label="Memuat data">
      {Array.from({ length: jumlah }, (_, i) => (
        <Skeleton key={i} className={gabungKelas('w-full', tinggi)} />
      ))}
    </div>
  )
}
