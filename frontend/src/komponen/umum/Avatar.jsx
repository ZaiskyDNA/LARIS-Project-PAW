import { UserRound } from 'lucide-react'
import { gabungKelas } from '../../utilitas/gabungKelas.js'

const UKURAN = {
  kecil: ['size-10', 'size-6'],
  sedang: ['size-18', 'size-11'],
  besar: ['size-28', 'size-18'],
}

export default function Avatar({ ukuran = 'kecil', className }) {
  const [lingkar, ikon] = UKURAN[ukuran]
  return (
    <div className={gabungKelas('flex shrink-0 items-center justify-center rounded-full bg-jingga text-krem', lingkar, className)} aria-hidden="true">
      <UserRound className={ikon} fill="currentColor" strokeWidth={0} />
    </div>
  )
}
