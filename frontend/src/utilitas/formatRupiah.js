const pemformat = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 })

export const formatAngka = (nilai) => pemformat.format(Number(nilai) || 0)

export const formatRupiah = (nilai) => `Rp${formatAngka(nilai)}`

// Bentuk ringkas untuk sumbu grafik & kartu sempit: Rp12,45 jt
export const formatRupiahRingkas = (nilai) => {
  const angka = Number(nilai) || 0
  const ringkas = (pembagi, akhiran) =>
    `${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(angka / pembagi)} ${akhiran}`
  if (Math.abs(angka) >= 1_000_000_000) return `Rp${ringkas(1_000_000_000, 'M')}`
  if (Math.abs(angka) >= 1_000_000) return `Rp${ringkas(1_000_000, 'jt')}`
  if (Math.abs(angka) >= 10_000) return `Rp${ringkas(1_000, 'rb')}`
  return formatRupiah(angka)
}

export const hanyaAngka = (teks) => {
  const digit = String(teks ?? '').replace(/\D/g, '')
  return digit === '' ? '' : Number(digit)
}
