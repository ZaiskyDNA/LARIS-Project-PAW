import { gabungKelas } from '../../utilitas/gabungKelas.js'
import Skeleton, { SkeletonDaftar } from './Skeleton.jsx'
import { StatusGalat, StatusKosong } from './StatusData.jsx'

const RATA = { kiri: 'text-left', tengah: 'text-center', kanan: 'text-right' }

/**
 * Tabel generik. `kolom`: [{ kunci, judul, render?(baris, indeks), rata?, kelas? }].
 * `renderKartu` (opsional) menggantikan tabel dengan daftar kartu pada layar HP.
 * `polos` menghilangkan kartu kuning pembungkus (bila tabel sudah berada di dalam kartu).
 * Menangani empat status: memuat, galat, kosong, dan berisi.
 */
export default function Tabel({
  kolom,
  data = [],
  kunciBaris = (baris) => baris._id,
  memuat = false,
  galat = null,
  saatCobaLagi,
  kosong,
  renderKartu,
  nomorAwal = 1,
  kaki,
  polos = false,
  className,
}) {
  const adaKartu = Boolean(renderKartu)
  let isi

  if (memuat) {
    isi = (
      <div className="p-2">
        <SkeletonDaftar jumlah={6} tinggi="h-12" />
      </div>
    )
  } else if (galat) {
    isi = <StatusGalat galat={galat} saatCobaLagi={saatCobaLagi} />
  } else if (data.length === 0) {
    isi = kosong ?? <StatusKosong judul="Belum ada data" />
  } else {
    isi = (
      <>
        {adaKartu && (
          <ul className="flex flex-col gap-3 md:hidden">
            {data.map((baris, i) => (
              <li key={kunciBaris(baris)}>{renderKartu(baris, i)}</li>
            ))}
          </ul>
        )}
        <div className={gabungKelas('overflow-x-auto', adaKartu && 'hidden md:block')}>
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="bg-jingga text-black">
                {kolom.map((k) => (
                  <th key={k.kunci} scope="col" className={gabungKelas('px-3 py-3.5 text-xs font-bold', RATA[k.rata ?? 'tengah'], k.kelas)}>
                    {k.judul}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((baris, i) => (
                <tr key={kunciBaris(baris)} className="border border-kuning-tua bg-latar transition-colors hover:bg-krem">
                  {kolom.map((k) => (
                    <td key={k.kunci} className={gabungKelas('px-3 py-3 text-tinta', RATA[k.rata ?? 'tengah'], k.kelas)}>
                      {k.render ? k.render(baris, nomorAwal + i) : baris[k.kunci]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    )
  }

  return (
    <div className={gabungKelas(!polos && (adaKartu ? 'md:rounded-3xl md:bg-kuning md:p-3' : 'rounded-3xl bg-kuning p-3'), className)}>
      {isi}
      {kaki}
    </div>
  )
}

export function SkeletonTabel() {
  return <Skeleton className="h-72 w-full rounded-3xl" />
}
