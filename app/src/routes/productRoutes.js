const express = require('express');
const { body } = require('express-validator');
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

// Get all products (public)
router.get('/', productController.getAllProducts);

// Get single product (public)
router.get('/:id', productController.getProduct);

// Create product (admin only)
router.post('/', authMiddleware, isAdmin, [
  body('name').notEmpty().withMessage('Product name is required'),
  body('description').notEmpty().withMessage('Product description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('stock').isInt({ min: 0 }).withMessage('Valid stock is required')
], productController.createProduct);

// Add product images (admin only)
router.post('/:id/images', authMiddleware, isAdmin, productController.addProductImages);

// Update product (admin only)
router.put('/:id', authMiddleware, isAdmin, productController.updateProduct);

// Update product price (admin only)
router.patch('/:id/price', authMiddleware, isAdmin, [
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required')
], productController.updateProductPrice);

// Delete product (admin only)
router.delete('/:id', authMiddleware, isAdmin, productController.deleteProduct);

module.exports = router;
