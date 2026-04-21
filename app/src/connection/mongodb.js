const mongoose = require('mongoose');

const connectMongoDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    // Connect to MongoDB (removed deprecated options)
    await mongoose.connect(mongoURI);

    console.log('✓ MongoDB connected successfully');
    console.log(`✓ Connected to: ${mongoURI.split('@')[1] || mongoURI.substring(0, 50)}...`);

    return mongoose.connection;
  } catch (error) {
    console.error('✗ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠ MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('⚠ MongoDB connection error:', error.message);
});

module.exports = connectMongoDB;
