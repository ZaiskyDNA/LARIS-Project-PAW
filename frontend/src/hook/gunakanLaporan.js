import { useMemo, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import * as apiLaporan from '../layanan/apiLaporan.js'
import { geserHari, hariIniIso, selisihHari } from '../utilitas/formatTanggal.js'
import { pesanGalat } from '../utilitas/galatApi.js'

const KUNCI = 'laporan'

export const gunakanRingkasan = () =>
  useQuery({ queryKey: [KUNCI, 'ringkasan'], queryFn: apiLaporan.ambilRingkasan })

export const gunakanOmzetHarian = (rentang) =>
  useQuery({
    queryKey: [KUNCI, 'omzet', rentang],
    queryFn: () => apiLaporan.ambilOmzetHarian(rentang),
    placeholderData: keepPreviousData,
  })

export const gunakanProdukTerlaris = (params) =>
  useQuery({
    queryKey: [KUNCI, 'terlaris', params],
    queryFn: () => apiLaporan.ambilProdukTerlaris(params),
    placeholderData: keepPreviousData,
  })

// Server hanya mengirim hari yang punya transaksi; hari kosong diisi 0 agar grafik utuh
export const lengkapiHari = (data = [], tanggalMulai, tanggalAkhir) => {
  const peta = new Map(data.map((baris) => [baris.tanggal, baris]))
  const jumlahHari = selisihHari(tanggalMulai, tanggalAkhir)
  return Array.from({ length: jumlahHari + 1 }, (_, i) => {
    const tanggal = geserHari(tanggalMulai, i)
    return peta.get(tanggal) ?? { tanggal, totalOmzet: 0, jumlahTransaksi: 0 }
  })
}

export const hitungTotal = (data = []) => {
  const totalOmzet = data.reduce((jumlah, baris) => jumlah + baris.totalOmzet, 0)
  const jumlahTransaksi = data.reduce((jumlah, baris) => jumlah + baris.jumlahTransaksi, 0)
  return {
    totalOmzet,
    jumlahTransaksi,
    rataRata: jumlahTransaksi > 0 ? Math.round(totalOmzet / jumlahTransaksi) : 0,
  }
}

// Tren 7 hari terakhir dibandingkan 7 hari sebelumnya (FR-30)
export const gunakanTrenMingguan = () => {
  const hariIni = hariIniIso()
  const rentang = useMemo(() => ({ tanggalMulai: geserHari(hariIni, -13), tanggalAkhir: hariIni }), [hariIni])
  const kueri = gunakanOmzetHarian(rentang)

  const tren = useMemo(() => {
    if (!kueri.data) return []
    const lengkap = lengkapiHari(kueri.data, rentang.tanggalMulai, rentang.tanggalAkhir)
    return lengkap.slice(7).map((baris, i) => ({
      tanggal: baris.tanggal,
      omzet: baris.totalOmzet,
      omzetMingguLalu: lengkap[i].totalOmzet,
    }))
  }, [kueri.data, rentang])

  return { ...kueri, tren }
}

export const gunakanEkspor = () => {
  const [formatBerjalan, setFormatBerjalan] = useState(null)

  const ekspor = async (format, { tanggalMulai, tanggalAkhir }) => {
    setFormatBerjalan(format)
    try {
      const berkas = await apiLaporan.unduhEkspor({ format, tanggalMulai, tanggalAkhir })
      const url = URL.createObjectURL(berkas)
      const tautan = document.createElement('a')
      tautan.href = url
      tautan.download = `laporan-laris-${tanggalMulai}_${tanggalAkhir}.${format}`
      document.body.appendChild(tautan)
      tautan.click()
      tautan.remove()
      URL.revokeObjectURL(url)
      toast.success(`Laporan ${format.toUpperCase()} berhasil diunduh`)
    } catch (error) {
      toast.error(error.response ? 'Gagal membuat berkas laporan. Coba lagi.' : pesanGalat(error))
    } finally {
      setFormatBerjalan(null)
    }
  }

  return { ekspor, formatBerjalan }
}
