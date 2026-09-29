const mongoose = require('mongoose');

const hubungkanDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/laris';
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Terhubung: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error koneksi MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = hubungkanDatabase;
