const midtransClient = require('midtrans-client');

const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
const clientKey = process.env.MIDTRANS_CLIENT_KEY || '';
const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';

// Gateway dianggap aktif hanya bila kunci asli (bukan contoh di .env.example) sudah diisi
const midtransAktif = /^(SB-)?Mid-server-[\w-]{8,}$/.test(serverKey);

const coreApi = new midtransClient.CoreApi({ isProduction, serverKey, clientKey });

module.exports = {
  coreApi,
  midtransAktif,
  serverKey,
};
