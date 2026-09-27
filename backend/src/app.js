const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const ruteUtama = require('./rute');
const penangananGalat = require('./middleware/penangananGalat');

const app = express();

const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    sukses: true,
    pesan: 'LARIS Backend API is running',
    versi: '2.0',
  });
});

app.use('/api', ruteUtama);

app.use(penangananGalat);

module.exports = app;
