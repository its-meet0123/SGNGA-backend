const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'Get profile - To be implemented' });
});

// Update user profile
router.put('/profile', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'Update profile - To be implemented' });
});

// Change password
router.post('/change-password', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'Change password - To be implemented' });
});

module.exports = router;
