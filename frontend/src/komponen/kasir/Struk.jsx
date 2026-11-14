import { gunakanPengaturan } from '../../hook/gunakanPengaturan.js'
import { formatRupiah } from '../../utilitas/formatRupiah.js'
import { formatTanggalJam } from '../../utilitas/formatTanggal.js'
import { METODE_BAYAR } from '../../utilitas/konstanta.js'
import { gabungKelas } from '../../utilitas/gabungKelas.js'

function Baris({ label, nilai, tebal = false }) {
  return (
    <div className={gabungKelas('flex justify-between gap-4', tebal ? 'text-base font-extrabold' : 'text-sm')}>
      <span>{label}</span>
      <span className="angka">{nilai}</span>
    </div>
  )
}

// Struk transaksi (FR-27). Elemen ber-kelas `area-cetak` adalah satu-satunya yang ikut tercetak.
export default function Struk({ transaksi, className }) {
  const { data: toko } = gunakanPengaturan()
  const tunai = transaksi.metodeBayar === 'tunai'

  return (
    <article className={gabungKelas('area-cetak w-full rounded-3xl border-2 border-kuning-tua bg-white px-7 py-7 text-tinta', className)} aria-label={`Struk ${transaksi.nomorTransaksi}`}>
      <header className="text-center">
        <h3 className="text-lg font-extrabold">{toko?.namaToko ?? 'Toko Kelontong Berkah'}</h3>
        {toko?.alamat && <p className="text-xs">{toko.alamat}</p>}
        {toko?.telepon && <p className="angka text-xs">{toko.telepon}</p>}
        <p className="angka mt-4 text-xs text-zaitun">
          {transaksi.nomorTransaksi} · {formatTanggalJam(transaksi.createdAt)}
        </p>
        <p className="text-xs text-zaitun">Kasir: {transaksi.namaKasir}</p>
      </header>

      <ul className="my-5 flex flex-col gap-3 border-y border-dashed border-zaitun py-5">
        {transaksi.items.map((item) => (
          <li key={item.productId} className="flex justify-between gap-4 text-sm">
            <span className="min-w-0">
              {item.nama} <span className="angka whitespace-nowrap">x{item.qty}</span>
            </span>
            <span className="angka shrink-0 font-bold">{formatRupiah(item.subtotal)}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-1.5">
        <Baris label="Total" nilai={formatRupiah(transaksi.total)} tebal />
        <Baris label={METODE_BAYAR[transaksi.metodeBayar]?.label ?? transaksi.metodeBayar} nilai={formatRupiah(transaksi.nominalBayar ?? transaksi.total)} />
        {tunai && <Baris label="Kembali" nilai={formatRupiah(transaksi.kembalian)} />}
      </div>

      <p className="mt-8 text-center text-xs font-bold">Terima kasih sudah berbelanja!</p>
    </article>
  )
}
