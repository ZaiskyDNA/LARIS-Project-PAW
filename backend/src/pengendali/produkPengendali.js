const Produk = require('../model/Produk');
const MutasiStok = require('../model/MutasiStok');
const Pengaturan = require('../model/Pengaturan');
const { prosesStokOpname } = require('../layanan/layananStok');
const { bersihkanCacheLaporan } = require('../konfigurasi/cache');
const { sukses, gagal } = require('../utilitas/formatResponsApi');
const { adalahIdValid, escapeRegex, parsePaginasi } = require('../utilitas/validasi');
const { STATUS_STOK, validasiProduk, validasiOpname } = require('../validator/produkValidator');

const daftarProduk = async (req, res, next) => {
  try {
    const { cari, kategori, statusStok } = req.query;

    if (statusStok && !STATUS_STOK.includes(statusStok)) {
      return gagal(res, 400, 'Validasi gagal', 'VALIDASI_GAGAL', [
        { field: 'statusStok', pesan: `statusStok harus salah satu dari: ${STATUS_STOK.join(', ')}` },
      ]);
    }

    const query = { isAktif: true };

    if (cari) {
      query.nama = { $regex: escapeRegex(cari), $options: 'i' };
    }

    if (kategori) {
      query.kategori = kategori;
    }

    const { page, limit, skip } = parsePaginasi(req.query.halaman, req.query.perHalaman);

    let produkList = await Produk.find(query).sort({ nama: 1 });

    if (statusStok) {
      produkList = produkList.filter((p) => p.statusStok === statusStok);
    }

    const total = produkList.length;
    const paginatedProduk = produkList.slice(skip, skip + limit);

    return sukses(res, 200, 'Berhasil mengambil daftar produk', paginatedProduk, {
      halaman: page,
      perHalaman: limit,
      total,
      totalHalaman: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

const detailProduk = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!adalahIdValid(id)) {
      return gagal(res, 404, 'Produk tidak ditemukan', 'TIDAK_DITEMUKAN');
    }
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
    return sukses(res, 200, 'Berhasil mengambil daftar produk stok menipis', menipis, {
      total: menipis.length,
    });
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

    const galat = validasiProduk(req.body, true);
    if (galat.length > 0) {
      return gagal(res, 400, 'Validasi gagal', 'VALIDASI_GAGAL', galat);
    }

    const existingName = await Produk.findOne({
      nama: { $regex: `^${escapeRegex(nama.trim())}$`, $options: 'i' },
      isAktif: true,
    });

    if (existingName) {
      return gagal(res, 409, 'Nama produk sudah terdaftar', 'DATA_DUPLIKAT');
    }

    if (barcode) {
      const existingBarcode = await Produk.findOne({ barcode });
      if (existingBarcode) {
        return gagal(res, 409, 'Barcode sudah dipakai produk lain', 'DATA_DUPLIKAT');
      }
    }

    let minimum = stokMinimum;
    if (minimum === undefined) {
      const pengaturan = await Pengaturan.findOne();
      minimum = pengaturan ? pengaturan.stokMinimumDefault : 5;
    }

    const produkBaru = await Produk.create({
      nama: nama.trim(),
      kategori: kategori.trim(),
      harga,
      stok: stok !== undefined ? stok : 0,
      stokMinimum: minimum,
      satuan: satuan ? satuan.trim() : 'pcs',
      barcode: barcode || undefined,
    });

    bersihkanCacheLaporan();
    return sukses(res, 201, 'Produk berhasil ditambahkan', produkBaru);
  } catch (error) {
    next(error);
  }
};

const ubahProduk = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nama, kategori, harga, stok, stokMinimum, satuan, barcode } = req.body;

    if (!adalahIdValid(id)) {
      return gagal(res, 404, 'Produk tidak ditemukan', 'TIDAK_DITEMUKAN');
    }

    const produk = await Produk.findOne({ _id: id, isAktif: true });
    if (!produk) {
      return gagal(res, 404, 'Produk tidak ditemukan', 'TIDAK_DITEMUKAN');
    }

    const galat = validasiProduk(req.body, false);
    if (galat.length > 0) {
      return gagal(res, 400, 'Validasi gagal', 'VALIDASI_GAGAL', galat);
    }

    if (nama !== undefined && nama.trim().toLowerCase() !== produk.nama.toLowerCase()) {
      const existingName = await Produk.findOne({
        nama: { $regex: `^${escapeRegex(nama.trim())}$`, $options: 'i' },
        isAktif: true,
        _id: { $ne: id },
      });
      if (existingName) {
        return gagal(res, 409, 'Nama produk sudah terdaftar', 'DATA_DUPLIKAT');
      }
    }
    if (nama !== undefined) produk.nama = nama.trim();

    if (barcode && barcode !== produk.barcode) {
      const existingBarcode = await Produk.findOne({ barcode, _id: { $ne: id } });
      if (existingBarcode) {
        return gagal(res, 409, 'Barcode sudah dipakai produk lain', 'DATA_DUPLIKAT');
      }
      produk.barcode = barcode;
    }

    if (kategori !== undefined) produk.kategori = kategori.trim();
    if (harga !== undefined) produk.harga = harga;
    if (stokMinimum !== undefined) produk.stokMinimum = stokMinimum;
    if (satuan !== undefined) produk.satuan = satuan.trim();

    const stokSebelum = produk.stok;
    if (stok !== undefined && stok !== stokSebelum) {
      produk.stok = stok;
    }

    await produk.save();

    if (stok !== undefined && stok !== stokSebelum) {
      await MutasiStok.create({
        productId: produk._id,
        namaProduk: produk.nama,
        tipe: stok > stokSebelum ? 'masuk' : 'koreksi',
        jumlah: Math.abs(stok - stokSebelum),
        stokSebelum,
        stokSesudah: stok,
        alasan: 'lain-lain',
        userId: req.user._id,
      });
    }

    bersihkanCacheLaporan();
    return sukses(res, 200, 'Produk berhasil diperbarui', produk);
  } catch (error) {
    next(error);
  }
};

const hapusProduk = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!adalahIdValid(id)) {
      return gagal(res, 404, 'Produk tidak ditemukan', 'TIDAK_DITEMUKAN');
    }
    const produk = await Produk.findById(id);

    if (!produk || !produk.isAktif) {
      return gagal(res, 404, 'Produk tidak ditemukan', 'TIDAK_DITEMUKAN');
    }

    produk.isAktif = false;
    await produk.save();

    bersihkanCacheLaporan();
    return sukses(res, 200, 'Produk berhasil dihapus (soft delete)');
  } catch (error) {
    next(error);
  }
};

const stokOpname = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stokFisik, alasan, catatan } = req.body;

    if (!adalahIdValid(id)) {
      return gagal(res, 404, 'Produk tidak ditemukan', 'TIDAK_DITEMUKAN');
    }

    const galat = validasiOpname(req.body);
    if (galat.length > 0) {
      return gagal(res, 400, 'Validasi gagal', 'VALIDASI_GAGAL', galat);
    }

    const { produk, mutasi } = await prosesStokOpname(id, stokFisik, alasan, req.user._id, catatan);

    return sukses(res, 200, 'Stok opname berhasil disimpan', {
      produk,
      mutasi,
      selisih: mutasi ? mutasi.stokSesudah - mutasi.stokSebelum : 0,
    });
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
    if (!adalahIdValid(id)) {
      return gagal(res, 404, 'Produk tidak ditemukan', 'TIDAK_DITEMUKAN');
    }
    const produk = await Produk.findById(id);
    if (!produk) {
      return gagal(res, 404, 'Produk tidak ditemukan', 'TIDAK_DITEMUKAN');
    }
    const mutasiList = await MutasiStok.find({ productId: id })
      .populate('userId', 'nama')
      .sort({ createdAt: -1 });
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
