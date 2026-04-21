const express = require('express');
const { body } = require('express-validator');
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const isSeller = require('../middleware/isSeller');

const router = express.Router();

router.get('/me', authMiddleware, isSeller, productController.getSellerProducts);
router.get('/pending', authMiddleware, isAdmin, productController.getPendingProducts);

router.post('/', authMiddleware, [
  body('name').notEmpty().withMessage('Product name is required'),
  body('description').notEmpty().withMessage('Product description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('stock').isInt({ min: 0 }).withMessage('Valid stock is required')
], productController.createProduct);

router.post('/:id/images', authMiddleware, isAdmin, productController.addProductImages);
router.put('/:id', authMiddleware, productController.updateProduct);
router.patch('/:id/price', authMiddleware, isAdmin, [
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required')
], productController.updateProductPrice);
router.delete('/:id', authMiddleware, productController.deleteProduct);
router.post('/:id/approve', authMiddleware, isAdmin, productController.approveProduct);
router.post('/:id/reject', authMiddleware, isAdmin, productController.rejectProduct);

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProduct);

module.exports = router;
