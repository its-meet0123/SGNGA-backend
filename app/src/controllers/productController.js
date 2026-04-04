const Product = require('../models/Product');
const { validationResult } = require('express-validator');

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, page = 1, limit = 10 } = req.query;

    let filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const products = await Product.find(filter)
      .populate('seller', 'firstName lastName email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      message: 'Products retrieved successfully',
      products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'firstName lastName email');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      message: 'Product retrieved successfully',
      product
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create product (admin only)
exports.createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price, category, stock } = req.body;

    const product = new Product({
      name,
      description,
      price,
      category,
      stock,
      seller: req.userId
    });

    await product.save();

    res.status(201).json({
      message: 'Product created successfully by admin',
      product
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add product images (admin only)
exports.addProductImages = async (req, res) => {
  try {
    const { images } = req.body; // Expected: [{ url: String, altText: String }]

    if (!images || !Array.isArray(images)) {
      return res.status(400).json({ message: 'Images array is required' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Add images to the product
    product.images.push(...images);
    await product.save();

    res.status(200).json({
      message: 'Product images added successfully',
      product
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update product (admin only)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Admin can update any product
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.status(200).json({
      message: 'Product updated successfully by admin',
      product: updatedProduct
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update product price (admin only)
exports.updateProductPrice = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { price } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.price = price;
    await product.save();

    res.status(200).json({
      message: 'Product price updated successfully by admin',
      product,
      previousPrice: product.price,
      newPrice: price
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete product (admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Admin can delete any product
    await Product.findByIdAndRemove(req.params.id);

    res.status(200).json({ 
      message: 'Product deleted successfully by admin',
      deletedProductId: req.params.id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
