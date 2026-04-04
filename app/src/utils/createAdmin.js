/**
 * Script to create a new admin user directly
 * Usage: node src/utils/createAdmin.js
 * 
 * Interactive script that prompts for user details and creates an admin user
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const readline = require('readline');
const User = require('../models/User');

// Load environment variables
dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const prompt = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('='.repeat(60));
    console.log('CREATE NEW ADMIN USER');
    console.log('='.repeat(60));
    console.log();

    // Get user details
    const firstName = await prompt('First Name: ');
    const lastName = await prompt('Last Name: ');
    const phone = await prompt('WhatsApp Phone Number (e.g., +919876543210): ');
    const password = await prompt('Password (min 6 characters): ');

    // Validate inputs
    if (!firstName || !lastName || !phone || !password) {
      console.error('❌ All fields are required');
      process.exit(1);
    }

    if (password.length < 6) {
      console.error('❌ Password must be at least 6 characters');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      console.error(`❌ User with phone number ${phone} already exists`);
      process.exit(1);
    }

    // Get optional fields
    const village = await prompt('Village (optional): ');
    const city = await prompt('City (required): ');
    const state = await prompt('State (required): ');
    const zipCode = await prompt('Zip Code (required): ');
    const country = await prompt('Country (required): ');

    if (!city || !state || !zipCode || !country) {
      console.error('❌ City, State, Zip Code, and Country are required');
      process.exit(1);
    }

    // Create new admin user
    const newUser = new User({
      firstName,
      lastName,
      phone,
      password,
      role: 'admin', // Set as admin
      address: {
        village: village || 'N/A',
        street: '',
        city,
        state,
        zipCode,
        country
      },
      isActive: true,
      isVerified: true
    });

    await newUser.save();

    console.log();
    console.log('='.repeat(60));
    console.log('✅ ADMIN USER CREATED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log(`Name: ${newUser.firstName} ${newUser.lastName}`);
    console.log(`Phone: ${newUser.phone}`);
    console.log(`Role: 👑 ADMIN`);
    console.log(`Location: ${newUser.address.city}, ${newUser.address.state}`);
    console.log('='.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
};

createAdminUser();
