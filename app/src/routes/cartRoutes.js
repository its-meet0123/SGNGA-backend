const express = require('express');
const authMiddleware = require('../middleware/auth');
const cartController = require('../controllers/cartController');

const router = express.Router();

router.get('/', authMiddleware, cartController.getCart);
router.post('/', authMiddleware, cartController.addOrUpdateItem);
router.put('/:itemId', authMiddleware, cartController.updateItem);
router.delete('/:itemId', authMiddleware, cartController.removeItem);
router.post('/merge', authMiddleware, cartController.mergeCart);

module.exports = router;
