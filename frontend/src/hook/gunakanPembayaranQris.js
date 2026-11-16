import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import * as apiTransaksi from '../layanan/apiTransaksi.js'
import { gunakanSegarkanSetelahTransaksi } from './gunakanTransaksi.js'
import { DURASI_QRIS_DETIK, JEDA_CEK_QRIS_MS } from '../utilitas/konstanta.js'
import { pesanGalat } from '../utilitas/galatApi.js'

const sisaDetikDari = (kedaluwarsaPada) =>
  kedaluwarsaPada
    ? Math.max(0, Math.round((new Date(kedaluwarsaPada).getTime() - Date.now()) / 1000))
    : DURASI_QRIS_DETIK

/**
 * Alur QRIS (US-11): buat transaksi `menunggu` → minta kode QR ke server → server menanyakan
 * status ke Midtrans secara berkala. Stok baru berkurang di server setelah status `berhasil`.
 */
export const gunakanPembayaranQris = ({ items, saatBerhasil }) => {
  const segarkan = gunakanSegarkanSetelahTransaksi()
  const klienQuery = useQueryClient()
  const [sedangSimulasi, setSedangSimulasi] = useState(false)
  const [sesi, setSesi] = useState(null) // { transaksi, qrString, qrUrl, simulasi, kedaluwarsaPada }
  const [sedangMembuat, setSedangMembuat] = useState(false)
  const [sedangMembatalkan, setSedangMembatalkan] = useState(false)
  const [galat, setGalat] = useState(null)
  const [sisaDetik, setSisaDetik] = useState(DURASI_QRIS_DETIK)
  const refBerhasil = useRef(saatBerhasil)

  useEffect(() => {
    refBerhasil.current = saatBerhasil
  }, [saatBerhasil])

  const idTransaksi = sesi?.transaksi._id
  const pantauan = useQuery({
    queryKey: ['transaksi', 'status-qris', idTransaksi],
    queryFn: () => apiTransaksi.cekStatusQris(idTransaksi),
    enabled: Boolean(idTransaksi),
    initialData: sesi?.transaksi,
    initialDataUpdatedAt: 0,
    refetchInterval: (kueri) => (kueri.state.data?.statusBayar === 'menunggu' ? JEDA_CEK_QRIS_MS : false),
    staleTime: 0,
    retry: false,
  })
  const status = sesi ? (pantauan.data?.statusBayar ?? 'menunggu') : null

  useEffect(() => {
    if (!sesi || status !== 'menunggu') return undefined
    const pengatur = setInterval(() => setSisaDetik(sisaDetikDari(sesi.kedaluwarsaPada)), 1000)
    return () => clearInterval(pengatur)
  }, [sesi, status])

  useEffect(() => {
    if (!status || status === 'menunggu') return
    segarkan()
    if (status === 'berhasil') refBerhasil.current(pantauan.data)
    // hanya bereaksi saat status berganti
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
      const sesiQr = await apiTransaksi.buatSesiQris(transaksi._id)
      setSisaDetik(sisaDetikDari(sesiQr.kedaluwarsaPada))
      setSesi({ transaksi, ...sesiQr })
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

  // Mode simulasi: menandai QR sudah dibayar; server memotong stok seperti pembayaran sungguhan
  const simulasikanBayar = async () => {
    setSedangSimulasi(true)
    try {
      const transaksi = await apiTransaksi.simulasiBayarQris(sesi.transaksi._id)
      klienQuery.setQueryData(['transaksi', 'status-qris', sesi.transaksi._id], transaksi)
    } catch (error) {
      toast.error(pesanGalat(error))
    } finally {
      setSedangSimulasi(false)
    }
  }

  // Transaksi yang belum dibayar ditandai `dibatalkan` di server agar tidak menggantung
  const batalkan = async () => {
    if (sesi && status === 'menunggu') {
      setSedangMembatalkan(true)
      try {
        await apiTransaksi.batalkanQris(sesi.transaksi._id)
        segarkan()
      } catch (error) {
        toast.error(pesanGalat(error))
        setSedangMembatalkan(false)
        return
      }
      setSedangMembatalkan(false)
    }
    setSesi(null)
    setGalat(null)
  }

  return {
    sesi,
    status,
    sedangMembuat,
    sedangMembatalkan,
    sedangSimulasi,
    sedangMengecek: pantauan.isFetching,
    galat,
    sisaDetik,
    habisWaktu: Boolean(sesi) && status === 'menunggu' && sisaDetik <= 0,
    buat,
    cekStatus,
    batalkan,
    simulasikanBayar,
  }
}
