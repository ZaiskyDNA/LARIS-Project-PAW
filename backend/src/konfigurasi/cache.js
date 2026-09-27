const NodeCache = require('node-cache');

const ttl = parseInt(process.env.CACHE_TTL, 10) || 60;
const cache = new NodeCache({ stdTTL: ttl, checkperiod: 120 });

const bersihkanCacheLaporan = () => {
  const keys = cache.keys();
  const keysLaporan = keys.filter((key) => key.startsWith('laporan:'));
  if (keysLaporan.length > 0) {
    cache.del(keysLaporan);
  }
};

module.exports = {
  cache,
  bersihkanCacheLaporan,
};
