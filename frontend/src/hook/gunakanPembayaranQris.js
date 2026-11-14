import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import * as apiTransaksi from '../layanan/apiTransaksi.js'
import { gunakanDetailTransaksi, gunakanSegarkanSetelahTransaksi } from './gunakanTransaksi.js'
import { DURASI_QRIS_DETIK, JEDA_CEK_QRIS_MS } from '../utilitas/konstanta.js'
import { pesanGalat } from '../utilitas/galatApi.js'

/**
 * Alur QRIS (US-11): buat transaksi berstatus `menunggu` → minta sesi ke gateway →
 * pantau status berkala. Stok baru berkurang di server setelah status `berhasil`.
 */
export const gunakanPembayaranQris = ({ items, saatBerhasil }) => {
  const segarkan = gunakanSegarkanSetelahTransaksi()
  const [sesi, setSesi] = useState(null) // { transaksi, token, redirect_url, mock, midtransOrderId }
  const [sedangMembuat, setSedangMembuat] = useState(false)
  const [galat, setGalat] = useState(null)
  const [sisaDetik, setSisaDetik] = useState(DURASI_QRIS_DETIK)

  const kedaluwarsa = sisaDetik <= 0
  const idTransaksi = sesi?.transaksi._id
  const pantauan = gunakanDetailTransaksi(idTransaksi, {
    refetchInterval: (kueri) => (kueri.state.data?.statusBayar === 'menunggu' && !kedaluwarsa ? JEDA_CEK_QRIS_MS : false),
    staleTime: 0,
  })
  const status = pantauan.data?.statusBayar ?? (sesi ? 'menunggu' : null)

  useEffect(() => {
    if (!sesi || status !== 'menunggu') return undefined
    const pengatur = setInterval(() => setSisaDetik((detik) => Math.max(0, detik - 1)), 1000)
    return () => clearInterval(pengatur)
  }, [sesi, status])

  useEffect(() => {
    if (status === 'berhasil' && pantauan.data) {
      segarkan()
      saatBerhasil(pantauan.data)
    }
    // hanya bereaksi pada perubahan status
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const buat = async () => {
    setSedangMembuat(true)
    setGalat(null)
    try {
      const transaksi = await apiTransaksi.buatTransaksi({
        items: items.map(({ productId, qty }) => ({ productId, qty })),
        metodeBayar: 'qris',
      })
      const sesiGateway = await apiTransaksi.buatSesiQris(transaksi._id)
      setSisaDetik(DURASI_QRIS_DETIK)
      setSesi({ transaksi, ...sesiGateway })
    } catch (error) {
      setGalat(pesanGalat(error))
      segarkan()
    } finally {
      setSedangMembuat(false)
    }
  }

  const cekStatus = async () => {
    const { data, error } = await pantauan.refetch()
    if (error) toast.error(pesanGalat(error))
    else if (data?.statusBayar === 'menunggu') toast('Pembayaran belum diterima', { icon: '⏳' })
  }

  const batalkan = () => {
    setSesi(null)
    setGalat(null)
  }

  return { sesi, status, sedangMembuat, sedangMengecek: pantauan.isFetching, galat, sisaDetik, kedaluwarsa, buat, cekStatus, batalkan }
}
