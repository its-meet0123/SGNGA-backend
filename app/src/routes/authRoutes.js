const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Register route with phone, address, and location
router.post('/register', [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('phone').notEmpty().withMessage('Phone number is required')
    .matches(/^[\d\s\-\+\(\)]{7,}$/).withMessage('Valid phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('address.street').optional(),
  body('address.village').optional(),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State is required'),
  body('address.zipCode').notEmpty().withMessage('Zip code is required'),
  body('address.country').notEmpty().withMessage('Country is required'),
  body('email').optional().isEmail().withMessage('Valid email format required')
], authController.register);

// Login route with phone number
router.post('/login', [
  body('phone').notEmpty().withMessage('Phone number is required')
    .matches(/^[\d\s\-\+\(\)]{7,}$/).withMessage('Valid phone number is required'),
  body('password').notEmpty().withMessage('Password is required')
], authController.login);

// Get current user
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;
