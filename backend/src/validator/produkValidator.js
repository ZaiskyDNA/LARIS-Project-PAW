const { ALASAN_OPNAME, adalahBilanganBulat } = require('../utilitas/validasi');

const STATUS_STOK = ['aman', 'menipis', 'habis'];

const validasiProduk = (body, lengkap) => {
  const { nama, kategori, harga, stok, stokMinimum, satuan, barcode } = body;
  const galat = [];

  if (lengkap || nama !== undefined) {
    if (typeof nama !== 'string' || nama.trim().length < 2 || nama.trim().length > 100) {
      galat.push({ field: 'nama', pesan: 'Nama produk harus 2-100 karakter' });
    }
  }
  if (lengkap || kategori !== undefined) {
    if (typeof kategori !== 'string' || kategori.trim().length === 0) {
      galat.push({ field: 'kategori', pesan: 'Kategori wajib diisi' });
    } else if (kategori.trim().length > 40) {
      galat.push({ field: 'kategori', pesan: 'Kategori maksimal 40 karakter' });
    }
  }
  if (lengkap || harga !== undefined) {
    if (!adalahBilanganBulat(harga)) {
      galat.push({ field: 'harga', pesan: 'Harga harus berupa angka bulat' });
    } else if (harga < 0) {
      galat.push({ field: 'harga', pesan: 'Harga tidak boleh negatif' });
    } else if (harga > 100000000) {
      galat.push({ field: 'harga', pesan: 'Harga maksimal Rp 100.000.000' });
    }
  }
  if (stok !== undefined) {
    if (!adalahBilanganBulat(stok)) {
      galat.push({ field: 'stok', pesan: 'Stok harus berupa angka bulat' });
    } else if (stok < 0) {
      galat.push({ field: 'stok', pesan: 'Stok tidak boleh negatif' });
    }
  }
  if (stokMinimum !== undefined) {
    if (!adalahBilanganBulat(stokMinimum) || stokMinimum < 0 || stokMinimum > 10000) {
      galat.push({ field: 'stokMinimum', pesan: 'Stok minimum tidak valid' });
    }
  }
  if (satuan !== undefined && (typeof satuan !== 'string' || satuan.trim().length === 0 || satuan.length > 20)) {
    galat.push({ field: 'satuan', pesan: 'Satuan tidak valid' });
  }
  if (barcode !== undefined && barcode !== null && barcode !== '') {
    if (typeof barcode !== 'string' || !/^[A-Za-z0-9]{8,20}$/.test(barcode)) {
      galat.push({ field: 'barcode', pesan: 'Barcode harus 8-20 karakter alfanumerik' });
    }
  }

  return galat;
};

const validasiOpname = ({ stokFisik, alasan, catatan }) => {
  const galat = [];
  if (!adalahBilanganBulat(stokFisik) || stokFisik < 0) {
    galat.push({ field: 'stokFisik', pesan: 'Stok fisik harus bilangan bulat tidak negatif' });
  }
  if (!ALASAN_OPNAME.includes(alasan)) {
    galat.push({ field: 'alasan', pesan: `Alasan wajib salah satu dari: ${ALASAN_OPNAME.join(', ')}` });
  }
  if (catatan !== undefined && catatan !== null && (typeof catatan !== 'string' || catatan.length > 200)) {
    galat.push({ field: 'catatan', pesan: 'Catatan maksimal 200 karakter' });
  }
  return galat;
};

module.exports = {
  STATUS_STOK,
  validasiProduk,
  validasiOpname,
};
