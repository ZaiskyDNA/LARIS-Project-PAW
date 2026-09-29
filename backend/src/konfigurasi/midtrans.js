const midtransClient = require('midtrans-client');

const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-placeholder';
const clientKey = process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-placeholder';

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: serverKey,
  clientKey: clientKey,
});

const coreApi = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: serverKey,
  clientKey: clientKey,
});

module.exports = {
  snap,
  coreApi,
};
