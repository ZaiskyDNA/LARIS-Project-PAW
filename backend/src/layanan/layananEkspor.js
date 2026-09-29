const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const Transaksi = require('../model/Transaksi');
const { getRentangTanggalUTC } = require('../utilitas/zonaWaktu');
const { getOmzetHarian, getProdukTerlaris } = require('./layananLaporan');

const eksporExcel = async (tanggalMulaiStr, tanggalAkhirStr, res) => {
  const { mulai, akhir } = getRentangTanggalUTC(tanggalMulaiStr, tanggalAkhirStr);
  const transaksiList = await Transaksi.find({
    createdAt: { $gte: mulai, $lte: akhir },
    statusBayar: 'berhasil',
  }).sort({ createdAt: -1 });

  const omzetHarian = await getOmzetHarian(tanggalMulaiStr, tanggalAkhirStr);
  const produkTerlaris = await getProdukTerlaris(10, tanggalMulaiStr, tanggalAkhirStr);

  const workbook = new ExcelJS.Workbook();
  const sheetOmzet = workbook.addWorksheet('Omzet Harian');
  sheetOmzet.columns = [
    { header: 'Tanggal', key: 'tanggal', width: 15 },
    { header: 'Jumlah Transaksi', key: 'jumlahTransaksi', width: 20 },
    { header: 'Total Omzet (Rp)', key: 'totalOmzet', width: 20 },
  ];
  omzetHarian.forEach((row) => sheetOmzet.addRow(row));

  const sheetTerlaris = workbook.addWorksheet('Produk Terlaris');
  sheetTerlaris.columns = [
    { header: 'Nama Produk', key: 'namaProduk', width: 30 },
    { header: 'Total Terjual', key: 'totalTerjual', width: 15 },
    { header: 'Total Omzet (Rp)', key: 'totalOmzet', width: 20 },
  ];
  produkTerlaris.forEach((row) => sheetTerlaris.addRow(row));

  const sheetDetail = workbook.addWorksheet('Detail Transaksi');
  sheetDetail.columns = [
    { header: 'Nomor Transaksi', key: 'nomorTransaksi', width: 25 },
    { header: 'Waktu', key: 'waktu', width: 20 },
    { header: 'Kasir', key: 'namaKasir', width: 20 },
    { header: 'Metode Bayar', key: 'metodeBayar', width: 15 },
    { header: 'Total (Rp)', key: 'total', width: 15 },
  ];
  transaksiList.forEach((t) => {
    sheetDetail.addRow({
      nomorTransaksi: t.nomorTransaksi,
      waktu: t.createdAt.toISOString(),
      namaKasir: t.namaKasir,
      metodeBayar: t.metodeBayar,
      total: t.total,
    });
  });

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=laporan-laris-${tanggalMulaiStr || 'awal'}_${tanggalAkhirStr || 'akhir'}.xlsx`
  );

  await workbook.xlsx.write(res);
  res.end();
};

const eksporPdf = async (tanggalMulaiStr, tanggalAkhirStr, res) => {
  const { mulai, akhir } = getRentangTanggalUTC(tanggalMulaiStr, tanggalAkhirStr);
  const omzetHarian = await getOmzetHarian(tanggalMulaiStr, tanggalAkhirStr);
  const produkTerlaris = await getProdukTerlaris(10, tanggalMulaiStr, tanggalAkhirStr);

  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=laporan-laris-${tanggalMulaiStr || 'awal'}_${tanggalAkhirStr || 'akhir'}.pdf`
  );

  doc.pipe(res);

  doc.fontSize(20).text('Laporan Penjualan LARIS', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Periode: ${tanggalMulaiStr || 'Awal'} s/d ${tanggalAkhirStr || 'Akhir'}`);
  doc.moveDown();

  doc.fontSize(14).text('Ringkasan Omzet Harian', { underline: true });
  doc.moveDown(0.5);

  let totalOmzetSemua = 0;
  omzetHarian.forEach((o) => {
    totalOmzetSemua += o.totalOmzet;
    doc.fontSize(10).text(`${o.tanggal} - Transaksi: ${o.jumlahTransaksi} - Omzet: Rp ${o.totalOmzet.toLocaleString('id-ID')}`);
  });

  doc.moveDown();
  doc.fontSize(12).text(`Total Omzet Periode Ini: Rp ${totalOmzetSemua.toLocaleString('id-ID')}`, { bold: true });
  doc.moveDown();

  doc.fontSize(14).text('10 Produk Terlaris', { underline: true });
  doc.moveDown(0.5);

  produkTerlaris.forEach((p, idx) => {
    doc.fontSize(10).text(`${idx + 1}. ${p.namaProduk} - Terjual: ${p.totalTerjual} - Total: Rp ${p.totalOmzet.toLocaleString('id-ID')}`);
  });

  doc.end();
};

module.exports = {
  eksporExcel,
  eksporPdf,
};
