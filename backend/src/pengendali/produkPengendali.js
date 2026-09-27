const Produk = require('../model/Produk');
const MutasiStok = require('../model/MutasiStok');
const { prosesStokOpname } = require('../layanan/layananStok');
const { sukses, gagal } = require('../utilitas/formatResponsApi');

const daftarProduk = async (req, res, next) => {
  try {
    const { cari, kategori, statusStok, halaman = 1, perHalaman = 20 } = req.query;

    const query = { isAktif: true };

    if (cari) {
      query.nama = { $regex: cari, $options: 'i' };
    }

    if (kategori) {
      query.kategori = kategori;
    }

    const page = parseInt(halaman, 10);
    const limit = parseInt(perHalaman, 10);
    const skip = (page - 1) * limit;

    let produkList = await Produk.find(query).sort({ createdAt: -1 });

    if (statusStok) {
      produkList = produkList.filter((p) => p.statusStok === statusStok);
    }

    const total = produkList.length;
    const paginatedProduk = produkList.slice(skip, skip + limit);

    return sukses(res, 200, 'Berhasil mengambil daftar produk', paginatedProduk, {
      halaman: page,
      perHalaman: limit,
      total,
    });
  } catch (error) {
    next(error);
  }
};

const detailProduk = async (req, res, next) => {
  try {
    const { id } = req.params;
    const produk = await Produk.findOne({ _id: id, isAktif: true });
    if (!produk) {
      return gagal(res, 404, 'Produk tidak ditemukan', 'TIDAK_DITEMUKAN');
    }
    return sukses(res, 200, 'Berhasil mengambil detail produk', produk);
  } catch (error) {
    next(error);
  }
};

const produkStokMenipis = async (req, res, next) => {
  try {
    const produkList = await Produk.find({ isAktif: true }).sort({ stok: 1 });
    const menipis = produkList.filter((p) => p.stok <= p.stokMinimum);
    return sukses(res, 200, 'Berhasil mengambil daftar produk stok menipis', menipis);
  } catch (error) {
    next(error);
  }
};

const produkBarcode = async (req, res, next) => {
  try {
    const { kode } = req.params;
    const produk = await Produk.findOne({ barcode: kode, isAktif: true });
    if (!produk) {
      return gagal(res, 404, 'Produk dengan barcode tersebut tidak ditemukan', 'TIDAK_DITEMUKAN');
    }
    return sukses(res, 200, 'Berhasil menemukan produk', produk);
  } catch (error) {
    next(error);
  }
};

const tambahProduk = async (req, res, next) => {
  try {
    const { nama, kategori, harga, stok, stokMinimum, satuan, barcode } = req.body;

    if (!nama || !kategori || harga === undefined) {
      return gagal(res, 400, 'Nama, kategori, dan harga wajib diisi', 'VALIDASI_GAGAL');
    }

    if (harga < 0) {
      return gagal(res, 400, 'Harga tidak boleh negatif', 'VALIDASI_GAGAL');
    }

    if (stok !== undefined && stok < 0) {
      return gagal(res, 400, 'Stok tidak boleh negatif', 'VALIDASI_GAGAL');
    }

    const existingName = await Produk.findOne({
      nama: { $regex: `^${nama}$`, $options: 'i' },
      isAktif: true,
    });

    if (existingName) {
      return gagal(res, 409, 'Nama produk sudah terdaftar', 'DATA_DUPLIKAT');
    }

    if (barcode) {
      const existingBarcode = await Produk.findOne({ barcode, isAktif: true });
      if (existingBarcode) {
        return gagal(res, 409, 'Barcode sudah dipakai produk lain', 'DATA_DUPLIKAT');
      }
    }

    const produkBaru = await Produk.create({
      nama,
      kategori,
      harga,
      stok: stok !== undefined ? stok : 0,
      stokMinimum: stokMinimum !== undefined ? stokMinimum : 5,
      satuan: satuan || 'pcs',
      barcode: barcode || undefined,
    });

    return sukses(res, 201, 'Produk berhasil ditambahkan', produkBaru);
  } catch (error) {
    next(error);
  }
};

const ubahProduk = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nama, kategori, harga, stok, stokMinimum, satuan, barcode } = req.body;

    const produk = await Produk.findOne({ _id: id, isAktif: true });
    if (!produk) {
      return gagal(res, 404, 'Produk tidak ditemukan', 'TIDAK_DITEMUKAN');
    }

    if (nama && nama !== produk.nama) {
      const existingName = await Produk.findOne({
        nama: { $regex: `^${nama}$`, $options: 'i' },
        isAktif: true,
        _id: { $ne: id },
      });
      if (existingName) {
        return gagal(res, 409, 'Nama produk sudah terdaftar', 'DATA_DUPLIKAT');
      }
      produk.nama = nama;
    }

    if (barcode && barcode !== produk.barcode) {
      const existingBarcode = await Produk.findOne({ barcode, isAktif: true, _id: { $ne: id } });
      if (existingBarcode) {
        return gagal(res, 409, 'Barcode sudah dipakai produk lain', 'DATA_DUPLIKAT');
      }
      produk.barcode = barcode;
    }

    if (kategori !== undefined) produk.kategori = kategori;
    if (harga !== undefined) {
      if (harga < 0) return gagal(res, 400, 'Harga tidak boleh negatif', 'VALIDASI_GAGAL');
      produk.harga = harga;
    }
    if (stok !== undefined) {
      if (stok < 0) return gagal(res, 400, 'Stok tidak boleh negatif', 'VALIDASI_GAGAL');
      produk.stok = stok;
    }
    if (stokMinimum !== undefined) produk.stokMinimum = stokMinimum;
    if (satuan !== undefined) produk.satuan = satuan;

    await produk.save();
    return sukses(res, 200, 'Produk berhasil diperbarui', produk);
  } catch (error) {
    next(error);
  }
};

const hapusProduk = async (req, res, next) => {
  try {
    const { id } = req.params;
    const produk = await Produk.findById(id);

    if (!produk || !produk.isAktif) {
      return gagal(res, 404, 'Produk tidak ditemukan', 'TIDAK_DITEMUKAN');
    }

    produk.isAktif = false;
    await produk.save();

    return sukses(res, 200, 'Produk berhasil dihapus (soft delete)');
  } catch (error) {
    next(error);
  }
};

const stokOpname = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stokFisik, jumlah, alasan } = req.body;

    const valStok = stokFisik !== undefined ? stokFisik : jumlah;

    if (valStok === undefined || isNaN(valStok) || valStok < 0) {
      return gagal(res, 400, 'Stok fisik tidak valid', 'VALIDASI_GAGAL');
    }

    const { produk, mutasi } = await prosesStokOpname(id, valStok, alasan, req.user._id);

    return sukses(res, 200, 'Stok opname berhasil disimpan', { produk, mutasi });
  } catch (error) {
    if (error.statusCode) {
      return gagal(res, error.statusCode, error.message, error.kodeGalat);
    }
    next(error);
  }
};

const riwayatMutasi = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mutasiList = await MutasiStok.find({ productId: id }).sort({ createdAt: -1 });
    return sukses(res, 200, 'Berhasil mengambil riwayat mutasi stok', mutasiList);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  daftarProduk,
  detailProduk,
  produkStokMenipis,
  produkBarcode,
  tambahProduk,
  ubahProduk,
  hapusProduk,
  stokOpname,
  riwayatMutasi,
};
