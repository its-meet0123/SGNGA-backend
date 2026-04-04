const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoDB_URI = process.env.MONGODB_URI;

    if (!mongoDB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoDB_URI);

    console.log('MongoDB connected successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
