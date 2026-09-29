const Produk = require('../model/Produk');
const MutasiStok = require('../model/MutasiStok');
const { bersihkanCacheLaporan } = require('../konfigurasi/cache');

const galatStok = (pesan) => {
  const err = new Error(pesan);
  err.kodeGalat = 'STOK_TIDAK_CUKUP';
  return err;
};

const pulihkanStok = async (itemTerkurangi) => {
  for (const item of itemTerkurangi) {
    await Produk.updateOne({ _id: item.productId }, { $inc: { stok: item.qty } });
  }
};

const kurangiStokAtomik = async (items) => {
  const terkurangi = [];
  for (const item of items) {
    const produk = await Produk.findOneAndUpdate(
      { _id: item.productId, isAktif: true, stok: { $gte: item.qty } },
      { $inc: { stok: -item.qty } },
      { new: true }
    );

    if (!produk) {
      await pulihkanStok(terkurangi);
      const terkini = await Produk.findById(item.productId);
      const sisa = terkini ? terkini.stok : 0;
      throw galatStok(`Stok ${item.nama || 'produk'} tidak mencukupi (tersisa ${sisa})`);
    }

    terkurangi.push({
      productId: produk._id,
      nama: produk.nama,
      qty: item.qty,
      stokSesudah: produk.stok,
    });
  }
  return terkurangi;
};

const catatMutasiPenjualan = async (terkurangi, userId, refId) => {
  const dokumen = terkurangi.map((item) => ({
    productId: item.productId,
    namaProduk: item.nama,
    tipe: 'keluar',
    jumlah: item.qty,
    stokSebelum: item.stokSesudah + item.qty,
    stokSesudah: item.stokSesudah,
    alasan: 'penjualan',
    refId,
    userId,
  }));
  return MutasiStok.insertMany(dokumen);
};

const prosesPenguranganStokTransaksi = async (items, userId, refId) => {
  const terkurangi = await kurangiStokAtomik(items);
  try {
    const mutasi = await catatMutasiPenjualan(terkurangi, userId, refId);
    bersihkanCacheLaporan();
    return mutasi;
  } catch (error) {
    await pulihkanStok(terkurangi);
    throw error;
  }
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

  const mutasi = await MutasiStok.create({
    productId: produk._id,
    namaProduk: produk.nama,
    tipe,
    jumlah: Math.abs(selisih),
    stokSebelum,
    stokSesudah,
    alasan,
    userId,
  });

  bersihkanCacheLaporan();
  return { produk, mutasi };
};

module.exports = {
  kurangiStokAtomik,
  pulihkanStok,
  catatMutasiPenjualan,
  prosesPenguranganStokTransaksi,
  prosesStokOpname,
};
