const Produk = require('../model/Produk');
const MutasiStok = require('../model/MutasiStok');
const { bersihkanCacheLaporan } = require('../konfigurasi/cache');

const prosesPenguranganStokTransaksi = async (items, userId, refId) => {
  for (const item of items) {
    const produk = await Produk.findOne({ _id: item.productId, isAktif: true });
    if (!produk) {
      throw new Error(`Produk dengan ID ${item.productId} tidak ditemukan`);
    }
    if (produk.stok < item.qty) {
      const err = new Error(`Stok ${produk.nama} tidak mencukupi (tersisa ${produk.stok})`);
      err.kodeGalat = 'STOK_TIDAK_CUKUP';
      throw err;
    }
  }

  const resMutasi = [];
  for (const item of items) {
    const produk = await Produk.findOneAndUpdate(
      { _id: item.productId, stok: { $gte: item.qty } },
      { $inc: { stok: -item.qty } },
      { new: true }
    );

    if (!produk) {
      const err = new Error(`Stok produk tidak mencukupi saat proses transaksi`);
      err.kodeGalat = 'STOK_TIDAK_CUKUP';
      throw err;
    }

    const stokSebelum = produk.stok + item.qty;
    const stokSesudah = produk.stok;

    const mutasi = await MutasiStok.create({
      productId: produk._id,
      namaProduk: produk.nama,
      tipe: 'keluar',
      jumlah: item.qty,
      stokSebelum,
      stokSesudah,
      alasan: 'penjualan',
      refId,
      userId,
    });
    resMutasi.push(mutasi);
  }

  bersihkanCacheLaporan();
  return resMutasi;
};

const prosesStokOpname = async (productId, stokFisik, alasan, userId) => {
  const produk = await Produk.findById(productId);
  if (!produk || !produk.isAktif) {
    const err = new Error('Produk tidak ditemukan');
    err.statusCode = 404;
    err.kodeGalat = 'TIDAK_DITEMUKAN';
    throw err;
  }

  const stokSebelum = produk.stok;
  const stokSesudah = Number(stokFisik);
  const selisih = stokSesudah - stokSebelum;

  if (selisih === 0) {
    return { produk, mutasi: null };
  }

  produk.stok = stokSesudah;
  await produk.save();

  const tipe = selisih > 0 ? 'masuk' : 'koreksi';
  const jumlah = Math.abs(selisih);

  const mutasi = await MutasiStok.create({
    productId: produk._id,
    namaProduk: produk.nama,
    tipe,
    jumlah,
    stokSebelum,
    stokSesudah,
    alasan: alasan || 'opname',
    userId,
  });

  bersihkanCacheLaporan();
  return { produk, mutasi };
};

module.exports = {
  prosesPenguranganStokTransaksi,
  prosesStokOpname,
};
