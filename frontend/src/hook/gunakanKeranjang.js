import { useCallback, useMemo, useState } from 'react'

export const HASIL_TAMBAH = { OK: 'ok', HABIS: 'habis', MAKS: 'maks' }

const dariProduk = (produk) => ({
  productId: produk._id,
  nama: produk.nama,
  harga: produk.harga,
  stok: produk.stok,
  satuan: produk.satuan,
})

// Logika keranjang kasir: kuantitas tidak pernah melebihi stok (US-09)
export const gunakanKeranjang = () => {
  const [items, setItems] = useState([])

  const tambah = useCallback(
    (produk) => {
      if (produk.stok <= 0) return HASIL_TAMBAH.HABIS
      const ada = items.find((item) => item.productId === produk._id)
      if (ada && ada.qty >= produk.stok) return HASIL_TAMBAH.MAKS
      setItems((lama) =>
        lama.some((item) => item.productId === produk._id)
          ? lama.map((item) =>
              item.productId === produk._id
                ? { ...item, ...dariProduk(produk), qty: Math.min(item.qty + 1, produk.stok) }
                : item,
            )
          : [...lama, { ...dariProduk(produk), qty: 1 }],
      )
      return HASIL_TAMBAH.OK
    },
    [items],
  )

  // Mengembalikan true bila kuantitas terpaksa dipangkas ke batas stok
  const ubahQty = useCallback(
    (productId, qtyBaru) => {
      const item = items.find((baris) => baris.productId === productId)
      if (!item) return false
      const qty = Math.max(1, Math.min(Math.floor(Number(qtyBaru) || 1), item.stok))
      setItems((lama) => lama.map((baris) => (baris.productId === productId ? { ...baris, qty } : baris)))
      return Number(qtyBaru) > item.stok
    },
    [items],
  )

  const hapus = useCallback(
    (productId) => setItems((lama) => lama.filter((item) => item.productId !== productId)),
    [],
  )

  const kosongkan = useCallback(() => setItems([]), [])

  // Menyelaraskan stok & harga keranjang dengan data produk terbaru dari server
  const sinkronkan = useCallback((daftarProduk) => {
    const peta = new Map(daftarProduk.map((produk) => [produk._id, produk]))
    setItems((lama) => {
      let berubah = false
      const baru = lama.map((item) => {
        const produk = peta.get(item.productId)
        if (!produk || (produk.stok === item.stok && produk.harga === item.harga)) return item
        berubah = true
        return { ...item, stok: produk.stok, harga: produk.harga }
      })
      return berubah ? baru : lama
    })
  }, [])

  const ringkasan = useMemo(
    () => ({
      total: items.reduce((jumlah, item) => jumlah + item.harga * item.qty, 0),
      jumlahItem: items.reduce((jumlah, item) => jumlah + item.qty, 0),
      adaMelebihiStok: items.some((item) => item.qty > item.stok),
    }),
    [items],
  )

  return { items, ...ringkasan, tambah, ubahQty, hapus, kosongkan, sinkronkan }
}
