require('dotenv').config();
const app = require('./src/app');
const hubungkanDatabase = require('./src/konfigurasi/koneksiDatabase');
const validasiEnv = require('./src/konfigurasi/validasiEnv');

const PORT = process.env.PORT || 5000;

try {
  validasiEnv();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

hubungkanDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server LARIS berjalan pada port ${PORT}`);
  });
});
