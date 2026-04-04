/**
 * Script to set users as admins
 * Usage: node src/utils/setAdmin.js <phone_number>
 * 
 * Example:
 * node src/utils/setAdmin.js +919876543210
 * node src/utils/setAdmin.js +919876543211
 * node src/utils/setAdmin.js +919876543212
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const { USER_ROLES } = require('../config/constants');

// Load environment variables
dotenv.config();

const setUserAsAdmin = async (phone) => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find user by phone
    const user = await User.findOne({ phone });

    if (!user) {
      console.error(`❌ User with phone number ${phone} not found`);
      process.exit(1);
    }

    // Check if already admin
    if (user.role === USER_ROLES.ADMIN) {
      console.log(`⚠️  User ${user.firstName} ${user.lastName} is already an admin`);
      process.exit(0);
    }

    // Set as admin
    user.role = USER_ROLES.ADMIN;
    await user.save();

    console.log(`✅ User ${user.firstName} ${user.lastName} (${user.phone}) has been promoted to ADMIN`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting user as admin:', error.message);
    process.exit(1);
  }
};

// Get phone from command line arguments
const phone = process.argv[2];

if (!phone) {
  console.error('❌ Please provide a phone number as argument');
  console.log('Usage: node src/utils/setAdmin.js <phone_number>');
  console.log('Example: node src/utils/setAdmin.js +919876543210');
  process.exit(1);
}

setUserAsAdmin(phone);
