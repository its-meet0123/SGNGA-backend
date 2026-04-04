/**
 * Script to list all users and their roles
 * Usage: node src/utils/listUsers.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

const listUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Get all users
    const users = await User.find({}).select('firstName lastName phone role isActive createdAt');

    if (users.length === 0) {
      console.log('No users found in database');
      process.exit(0);
    }

    console.log('='.repeat(80));
    console.log('ALL USERS IN DATABASE');
    console.log('='.repeat(80));
    console.log();

    users.forEach((user, index) => {
      const roleColor = user.role === 'admin' ? '👑' : '👤';
      const statusIcon = user.isActive ? '✅' : '❌';
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   Phone: ${user.phone}`);
      console.log(`   Role: ${roleColor} ${user.role.toUpperCase()}`);
      console.log(`   Status: ${statusIcon} ${user.isActive ? 'Active' : 'Inactive'}`);
      console.log(`   Created: ${new Date(user.createdAt).toLocaleDateString()}`);
      console.log();
    });

    const adminCount = users.filter(u => u.role === 'admin').length;
    const userCount = users.filter(u => u.role === 'user').length;

    console.log('='.repeat(80));
    console.log(`Total Users: ${users.length} | Admins: ${adminCount} | Regular Users: ${userCount}`);
    console.log('='.repeat(80));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error listing users:', error.message);
    process.exit(1);
  }
};

listUsers();
