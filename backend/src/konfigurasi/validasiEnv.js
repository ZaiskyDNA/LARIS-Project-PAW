// Memeriksa konfigurasi penting sejak awal, bukan saat pengguna pertama kali login
const validasiEnv = () => {
  const produksi = process.env.NODE_ENV === 'production';
  const wajib = ['JWT_SECRET', ...(produksi ? ['MONGO_URI', 'CORS_ORIGIN'] : [])];
  const kurang = wajib.filter((nama) => !process.env[nama]);
  if (kurang.length > 0) {
    throw new Error(`Variabel lingkungan belum diatur: ${kurang.join(', ')}`);
  }
  if (produksi && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET minimal 32 karakter untuk mode produksi');
  }
};

module.exports = validasiEnv;
