const { validationResult } = require('express-validator');
const { USER_ROLES } = require('../config/constants');
const productService = require('../services/productService');

exports.getAllProducts = async (req, res) => {
  try {
    const result = await productService.getAllProducts(req.query);
    res.status(200).json({
      message: 'Products retrieved successfully',
      ...result
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const currentUserId = req.userId || null;
    const product = await productService.getProductById(req.params.id, currentUserId);

    res.status(200).json({
      message: 'Product retrieved successfully',
      product
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.getSellerProducts = async (req, res) => {
  try {
    const products = await productService.getSellerProducts(req.user._id);
    res.status(200).json({
      message: 'Seller products retrieved successfully',
      products
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPendingProducts = async (req, res) => {
  try {
    const products = await productService.getPendingProducts();
    res.status(200).json({
      message: 'Pending products retrieved successfully',
      products
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await productService.createProduct(req.user, req.body);

    const message = req.user.role === USER_ROLES.ADMIN
      ? 'Product created successfully by admin'
      : 'Product submitted for admin approval';

    res.status(201).json({ message, product });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.addProductImages = async (req, res) => {
  try {
    if (!req.user || req.user.role !== USER_ROLES.ADMIN) {
      return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }

    const { images } = req.body;
    if (!images || !Array.isArray(images)) {
      return res.status(400).json({ message: 'Images array is required' });
    }

    const product = await productService.updateProduct(req.user, req.params.id, {
      images: images
    });

    res.status(200).json({
      message: 'Product images added successfully',
      product
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await productService.updateProduct(req.user, req.params.id, req.body);
    const message = req.user.role === USER_ROLES.ADMIN
      ? 'Product updated successfully by admin'
      : 'Product update submitted for admin approval';

    res.status(200).json({
      message,
      product
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.updateProductPrice = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.user || req.user.role !== USER_ROLES.ADMIN) {
      return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }

    const { price } = req.body;
    const product = await productService.updateProduct(req.user, req.params.id, { price });

    res.status(200).json({
      message: 'Product price updated successfully by admin',
      product
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const result = await productService.requestDeletion(req.user, req.params.id);

    if (req.user.role === USER_ROLES.ADMIN) {
      return res.status(200).json({
        message: 'Product deleted successfully by admin',
        deletedProductId: req.params.id
      });
    }

    res.status(200).json({
      message: 'Product deletion request submitted for admin approval',
      product: result
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.approveProduct = async (req, res) => {
  try {
    const product = await productService.approveProduct(req.user, req.params.id);
    res.status(200).json({
      message: 'Product changes approved successfully',
      product
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.rejectProduct = async (req, res) => {
  try {
    const reason = req.body.reason || 'Rejected by admin';
    const product = await productService.rejectProduct(req.user, req.params.id, reason);
    res.status(200).json({
      message: 'Product changes rejected successfully',
      product
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};
