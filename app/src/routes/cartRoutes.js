const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get cart
router.get('/', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'Get cart - To be implemented' });
});

// Add to cart
router.post('/', authMiddleware, (req, res) => {
  res.status(201).json({ message: 'Add to cart - To be implemented' });
});

// Update cart
router.put('/:itemId', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'Update cart - To be implemented' });
});

// Remove from cart
router.delete('/:itemId', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'Remove from cart - To be implemented' });
});

module.exports = router;
