const cartService = require('../services/cartService');

exports.getCart = async (req, res) => {
  try {
    const cart = await cartService.getCart(req.userId);
    res.status(200).json(cart);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.addOrUpdateItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await cartService.addOrUpdateItem(req.userId, { productId, quantity });
    res.status(200).json(cart);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const cart = await cartService.updateItem(req.userId, itemId, quantity);
    res.status(200).json(cart);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.removeItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await cartService.removeItem(req.userId, itemId);
    res.status(200).json({ message: 'Item removed successfully', cart });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.mergeCart = async (req, res) => {
  try {
    const guestCart = req.body.guestCart || [];
    const cart = await cartService.mergeGuestCart(req.userId, guestCart);
    res.status(200).json(cart);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};
