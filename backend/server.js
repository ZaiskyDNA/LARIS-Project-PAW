require('dotenv').config();
const app = require('./src/app');
const hubungkanDatabase = require('./src/konfigurasi/koneksiDatabase');

const PORT = process.env.PORT || 5000;

hubungkanDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server LARIS berjalan pada port ${PORT}`);
  });
});
