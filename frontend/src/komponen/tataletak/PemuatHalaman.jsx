import { LoaderCircle } from 'lucide-react'

export default function PemuatHalaman({ layarPenuh = false }) {
  return (
    <div role="status" className={`flex items-center justify-center ${layarPenuh ? 'min-h-dvh bg-latar' : 'min-h-[50dvh]'}`}>
      <LoaderCircle className="size-8 animate-spin text-jingga" aria-hidden="true" />
      <span className="sr-only">Memuat halaman…</span>
    </div>
  )
}
