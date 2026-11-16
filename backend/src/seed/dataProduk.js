/**
 * Katalog contoh Toko Kelontong Berkah.
 * - laku: bobot kemungkinan dibeli per transaksi
 * - qtyMaks: kuantitas maksimum per baris keranjang
 * - hargaLama: harga sebelum kenaikan 12 hari lalu (menguji BR-03 hargaSaat)
 * - akhir: kondisi akhir yang diinginkan untuk demo ('menipis' | 'habis')
 * - dihapus: produk yang di-soft-delete setelah sempat terjual (menguji BR-04)
 */
module.exports = [
  // Sembako
  { nama: 'Beras Pandan Wangi 5 kg', kategori: 'Sembako', harga: 72000, hargaLama: 68000, stokAwal: 20, stokMinimum: 5, satuan: 'karung', laku: 3, qtyMaks: 1 },
  { nama: 'Beras Rojolele 1 kg', kategori: 'Sembako', harga: 15000, stokAwal: 40, stokMinimum: 10, satuan: 'pcs', laku: 4, qtyMaks: 3 },
  { nama: 'Minyak Goreng Bimoli 2 L', kategori: 'Sembako', harga: 38000, hargaLama: 36000, stokAwal: 24, stokMinimum: 6, satuan: 'pouch', laku: 4, qtyMaks: 2 },
  { nama: 'Minyak Goreng Sania 1 L', kategori: 'Sembako', harga: 19500, stokAwal: 36, stokMinimum: 8, satuan: 'pouch', laku: 5, qtyMaks: 2 },
  { nama: 'Gula Pasir Gulaku 1 kg', kategori: 'Sembako', harga: 17500, stokAwal: 36, stokMinimum: 8, satuan: 'pcs', laku: 5, qtyMaks: 2 },
  { nama: 'Telur Ayam Negeri 1 kg', kategori: 'Sembako', harga: 29000, hargaLama: 27500, stokAwal: 25, stokMinimum: 5, satuan: 'kg', laku: 5, qtyMaks: 2 },
  { nama: 'Tepung Terigu Segitiga Biru 1 kg', kategori: 'Sembako', harga: 13000, stokAwal: 20, stokMinimum: 6, satuan: 'pcs', laku: 2, qtyMaks: 2 },
  { nama: 'Garam Dapur Refina 250 g', kategori: 'Sembako', harga: 4000, stokAwal: 24, stokMinimum: 6, satuan: 'pcs', laku: 2, qtyMaks: 2 },
  { nama: 'Kecap Manis Bango 220 ml', kategori: 'Sembako', harga: 10500, stokAwal: 20, stokMinimum: 5, satuan: 'pouch', laku: 3, qtyMaks: 2, akhir: 'menipis' },

  // Makanan
  { nama: 'Indomie Goreng Original', kategori: 'Makanan', harga: 3500, stokAwal: 120, stokMinimum: 24, satuan: 'pcs', laku: 12, qtyMaks: 5 },
  { nama: 'Indomie Kuah Ayam Bawang', kategori: 'Makanan', harga: 3300, stokAwal: 80, stokMinimum: 20, satuan: 'pcs', laku: 8, qtyMaks: 5 },
  { nama: 'Mie Sedaap Goreng', kategori: 'Makanan', harga: 3400, stokAwal: 80, stokMinimum: 20, satuan: 'pcs', laku: 7, qtyMaks: 5, akhir: 'menipis' },
  { nama: 'Sarimi Isi 2 Ayam Kecap', kategori: 'Makanan', harga: 4000, stokAwal: 40, stokMinimum: 10, satuan: 'pcs', laku: 3, qtyMaks: 3 },
  { nama: 'Roti Tawar Sari Roti', kategori: 'Makanan', harga: 17000, stokAwal: 12, stokMinimum: 4, satuan: 'pcs', laku: 3, qtyMaks: 1, akhir: 'habis' },
  { nama: 'Biskuit Roma Kelapa 300 g', kategori: 'Makanan', harga: 11000, stokAwal: 20, stokMinimum: 5, satuan: 'pcs', laku: 3, qtyMaks: 2 },
  { nama: 'Chitato Sapi Panggang 68 g', kategori: 'Makanan', harga: 11500, stokAwal: 24, stokMinimum: 6, satuan: 'pcs', laku: 3, qtyMaks: 2 },
  { nama: 'Sarden ABC Saus Tomat 155 g', kategori: 'Makanan', harga: 11000, stokAwal: 18, stokMinimum: 5, satuan: 'kaleng', laku: 2, qtyMaks: 2, akhir: 'menipis' },

  // Minuman
  { nama: 'Aqua Air Mineral 600 ml', kategori: 'Minuman', harga: 3500, stokAwal: 96, stokMinimum: 24, satuan: 'botol', laku: 10, qtyMaks: 4 },
  { nama: 'Teh Pucuk Harum 350 ml', kategori: 'Minuman', harga: 4000, stokAwal: 60, stokMinimum: 12, satuan: 'botol', laku: 7, qtyMaks: 3 },
  { nama: 'Kopi Kapal Api Special Mix', kategori: 'Minuman', harga: 15500, stokAwal: 20, stokMinimum: 5, satuan: 'renceng', laku: 4, qtyMaks: 1 },
  { nama: 'Kopi Good Day Cappuccino Sachet', kategori: 'Minuman', harga: 1700, stokAwal: 100, stokMinimum: 20, satuan: 'pcs', laku: 6, qtyMaks: 5 },
  { nama: 'Susu Kental Manis Frisian Flag 370 g', kategori: 'Minuman', harga: 13500, stokAwal: 20, stokMinimum: 5, satuan: 'kaleng', laku: 3, qtyMaks: 1 },
  { nama: 'Coca-Cola 390 ml', kategori: 'Minuman', harga: 5500, stokAwal: 48, stokMinimum: 12, satuan: 'botol', laku: 4, qtyMaks: 3, akhir: 'menipis' },
  { nama: 'Ultra Milk Cokelat 200 ml', kategori: 'Minuman', harga: 6000, stokAwal: 48, stokMinimum: 12, satuan: 'pcs', laku: 5, qtyMaks: 3 },
  { nama: 'Teh Kotak Sosro 200 ml', kategori: 'Minuman', harga: 4500, stokAwal: 36, stokMinimum: 10, satuan: 'pcs', laku: 4, qtyMaks: 3, dihapus: true },

  // Rumah Tangga
  { nama: 'Sabun Cuci Piring Sunlight 755 ml', kategori: 'Rumah Tangga', harga: 16500, stokAwal: 15, stokMinimum: 4, satuan: 'pouch', laku: 2, qtyMaks: 1 },
  { nama: 'Deterjen Rinso Anti Noda 770 g', kategori: 'Rumah Tangga', harga: 23500, stokAwal: 15, stokMinimum: 4, satuan: 'pcs', laku: 2, qtyMaks: 1 },
  { nama: 'Pewangi Molto Pink 900 ml', kategori: 'Rumah Tangga', harga: 14500, stokAwal: 15, stokMinimum: 4, satuan: 'pouch', laku: 2, qtyMaks: 1 },
  { nama: 'Tisu Paseo 250 Lembar', kategori: 'Rumah Tangga', harga: 14000, stokAwal: 15, stokMinimum: 4, satuan: 'pcs', laku: 2, qtyMaks: 1 },
  { nama: 'Baterai ABC Alkaline AA (2 pcs)', kategori: 'Rumah Tangga', harga: 9000, stokAwal: 12, stokMinimum: 4, satuan: 'pcs', laku: 1, qtyMaks: 1, akhir: 'menipis' },
  { nama: 'Obat Nyamuk Baygon Bakar', kategori: 'Rumah Tangga', harga: 8500, stokAwal: 15, stokMinimum: 4, satuan: 'pcs', laku: 1, qtyMaks: 1 },

  // Kebutuhan Diri
  { nama: 'Pasta Gigi Pepsodent 190 g', kategori: 'Kebutuhan Diri', harga: 12500, stokAwal: 15, stokMinimum: 5, satuan: 'pcs', laku: 2, qtyMaks: 1, akhir: 'habis' },
  { nama: 'Sabun Mandi Lifebuoy 75 g', kategori: 'Kebutuhan Diri', harga: 4500, stokAwal: 40, stokMinimum: 10, satuan: 'pcs', laku: 3, qtyMaks: 3 },
  { nama: 'Shampoo Clear Sachet', kategori: 'Kebutuhan Diri', harga: 6500, stokAwal: 20, stokMinimum: 5, satuan: 'renceng', laku: 2, qtyMaks: 1 },
  { nama: 'Pembalut Charm Bodyfit (8 pcs)', kategori: 'Kebutuhan Diri', harga: 9500, stokAwal: 12, stokMinimum: 3, satuan: 'pcs', laku: 1, qtyMaks: 1 },
];
