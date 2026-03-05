/**
 * MongoDB connection using Mongoose.
 * Used by server.js on startup.
 */
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
      console.error('MongoDB URI missing. Set MONGODB_URI or MONGO_URI in backend/.env');
      process.exit(1);
    }
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
