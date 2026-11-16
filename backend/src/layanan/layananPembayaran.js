const crypto = require('crypto');
const Transaksi = require('../model/Transaksi');
const { coreApi, midtransAktif, serverKey } = require('../konfigurasi/midtrans');
const { prosesPenguranganStokTransaksi } = require('./layananStok');

const DURASI_QRIS_MENIT = 5;
// Toleransi sebelum transaksi yang tidak pernah dikonfirmasi gateway dianggap kedaluwarsa
const TENGGANG_KEDALUWARSA_MS = (DURASI_QRIS_MENIT + 1) * 60 * 1000;

// Status Midtrans → statusBayar LARIS
const PETA_STATUS = {
  settlement: 'berhasil',
  capture: 'berhasil',
  deny: 'gagal',
  failure: 'gagal',
  cancel: 'dibatalkan',
  expire: 'kedaluwarsa',
};

const galatBisnis = (statusCode, pesan, kodeGalat) => Object.assign(new Error(pesan), { statusCode, kodeGalat });

/**
 * Mengubah transaksi berstatus `menunggu` secara atomik. Klaim status lebih dulu
 * mencegah stok terpotong dua kali bila webhook dan cek status datang bersamaan.
 */
const terapkanStatus = async (transaksiId, statusBaru) => {
  if (!statusBaru) return Transaksi.findById(transaksiId);

  const diklaim = await Transaksi.findOneAndUpdate(
    { _id: transaksiId, statusBayar: 'menunggu' },
    { $set: { statusBayar: statusBaru } },
    { returnDocument: 'after' }
  );
  if (!diklaim) return Transaksi.findById(transaksiId);
  if (statusBaru !== 'berhasil') return diklaim;

  // BR-12: stok QRIS baru berkurang setelah pembayaran berhasil
  try {
    await prosesPenguranganStokTransaksi(diklaim.items, diklaim.kasirId, diklaim._id);
    return diklaim;
  } catch (error) {
    if (error.kodeGalat !== 'STOK_TIDAK_CUKUP') throw error;
    diklaim.statusBayar = 'gagal';
    await diklaim.save();
    throw galatBisnis(422, `Pembayaran diterima tetapi ${error.message}. Transaksi ditandai gagal.`, 'PEMBAYARAN_GAGAL');
  }
};

const buatSesiQris = async (transaksi, namaPelanggan) => {
  const orderId = `${transaksi.nomorTransaksi}-${Date.now()}`;

  // Degradasi anggun (US-11 kriteria 5): tanpa kunci gateway, QR simulasi dibuat
  if (!midtransAktif) {
    transaksi.midtransOrderId = orderId;
    await transaksi.save();
    return {
      simulasi: true,
      midtransOrderId: orderId,
      qrString: `LARIS-SIMULASI:${orderId}`,
      qrUrl: null,
      kedaluwarsaPada: new Date(Date.now() + DURASI_QRIS_MENIT * 60 * 1000),
    };
  }

  let respons;
  try {
    respons = await coreApi.charge({
      payment_type: 'qris',
      transaction_details: { order_id: orderId, gross_amount: transaksi.total },
      customer_details: { first_name: namaPelanggan },
      qris: { acquirer: 'gopay' },
      custom_expiry: { expiry_duration: DURASI_QRIS_MENIT, unit: 'minute' },
    });
  } catch (error) {
    throw galatBisnis(422, `Gateway pembayaran menolak permintaan: ${error.message}`, 'PEMBAYARAN_GAGAL');
  }

  transaksi.midtransOrderId = orderId;
  await transaksi.save();

  const aksiQr = (respons.actions || []).find((aksi) => aksi.name === 'generate-qr-code');
  return {
    simulasi: false,
    midtransOrderId: orderId,
    qrString: respons.qr_string || null,
    qrUrl: aksiQr ? aksiQr.url : null,
    kedaluwarsaPada: respons.expiry_time ? new Date(`${respons.expiry_time.replace(' ', 'T')}+07:00`) : null,
  };
};

// Dipakai tombol "Cek Status": menanyakan langsung ke Midtrans, tidak bergantung pada webhook
const sinkronkanStatus = async (transaksi) => {
  if (transaksi.statusBayar !== 'menunggu') return transaksi;

  if (midtransAktif && transaksi.midtransOrderId) {
    try {
      const status = await coreApi.transaction.status(transaksi.midtransOrderId);
      return terapkanStatus(transaksi._id, PETA_STATUS[status.transaction_status]);
    } catch (error) {
      // 404 = belum pernah sampai ke gateway; diperlakukan seperti mode simulasi di bawah
      if (error.httpStatusCode !== 404 && error.httpStatusCode !== '404') throw error;
    }
  }

  const umur = Date.now() - new Date(transaksi.updatedAt).getTime();
  return umur > TENGGANG_KEDALUWARSA_MS ? terapkanStatus(transaksi._id, 'kedaluwarsa') : transaksi;
};

const batalkanQris = async (transaksi) => {
  if (transaksi.statusBayar !== 'menunggu') {
    throw galatBisnis(400, 'Hanya transaksi yang menunggu pembayaran yang dapat dibatalkan', 'VALIDASI_GAGAL');
  }
  if (midtransAktif && transaksi.midtransOrderId) {
    try {
      await coreApi.transaction.cancel(transaksi.midtransOrderId);
    } catch {
      // Order yang belum tercatat di gateway tetap dibatalkan di sisi LARIS
    }
  }
  return terapkanStatus(transaksi._id, 'dibatalkan');
};

// Hanya untuk mode simulasi (tanpa kunci Midtrans): kasir menandai QR sudah dibayar saat demo
const simulasikanBayar = async (transaksi) => {
  if (midtransAktif) {
    throw galatBisnis(403, 'Simulasi pembayaran tidak tersedia karena gateway Midtrans aktif', 'AKSES_DITOLAK');
  }
  if (transaksi.metodeBayar !== 'qris' || transaksi.statusBayar !== 'menunggu') {
    throw galatBisnis(400, 'Transaksi ini tidak menunggu pembayaran QRIS', 'VALIDASI_GAGAL');
  }
  return terapkanStatus(transaksi._id, 'berhasil');
};

const tandaTanganValid = ({ order_id, status_code, gross_amount, signature_key }) => {
  if (!serverKey || !order_id || !status_code || !gross_amount || !signature_key) return false;
  const harapan = crypto
    .createHash('sha512')
    .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
    .digest('hex');
  return harapan === signature_key;
};

module.exports = {
  PETA_STATUS,
  terapkanStatus,
  buatSesiQris,
  sinkronkanStatus,
  batalkanQris,
  simulasikanBayar,
  tandaTanganValid,
};
