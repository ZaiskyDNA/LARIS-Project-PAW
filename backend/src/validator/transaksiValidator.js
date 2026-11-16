const { adalahIdValid, adalahBilanganBulat } = require('../utilitas/validasi');

// Menggabungkan item ber-productId sama dan memvalidasi bentuk keranjang
const normalisasiItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return { galat: 'Keranjang masih kosong' };
  }

  const gabungan = new Map();
  for (const item of items) {
    if (!item || !adalahIdValid(item.productId)) {
      return { galat: 'Produk tidak ditemukan', field: 'items[].productId' };
    }
    if (!adalahBilanganBulat(item.qty) || item.qty < 1) {
      return { galat: 'Kuantitas harus bilangan bulat minimal 1', field: 'items[].qty' };
    }
    const kunci = String(item.productId);
    gabungan.set(kunci, (gabungan.get(kunci) || 0) + item.qty);
  }

  return { items: [...gabungan].map(([productId, qty]) => ({ productId, qty })) };
};

module.exports = {
  normalisasiItems,
};
