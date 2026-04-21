const Product = require('../models/Product');

const getApprovedProducts = async (filter, skip, limit) => {
  return Product.find({ ...filter, status: 'approved', isActive: true })
    .populate('seller', 'firstName lastName phone')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
};

const countApprovedProducts = async (filter) => {
  return Product.countDocuments({ ...filter, status: 'approved', isActive: true });
};

const getProductById = async (id) => {
  return Product.findById(id).populate('seller', 'firstName lastName email');
};

const getSellerProducts = async (userId) => {
  return Product.find({ seller: userId }).populate('seller', 'firstName lastName email').sort({ updatedAt: -1 });
};

const getPendingProducts = async () => {
  return Product.find({ status: 'pending' })
    .populate('seller', 'firstName lastName email')
    .sort({ 'approval.requestedAt': -1 });
};

const createProduct = async (data) => {
  return Product.create(data);
};

const updateProductById = async (id, data, options = {}) => {
  return Product.findByIdAndUpdate(id, data, { new: true, ...options });
};

const deleteProductById = async (id) => {
  return Product.findByIdAndRemove(id);
};

module.exports = {
  getApprovedProducts,
  countApprovedProducts,
  getProductById,
  getSellerProducts,
  getPendingProducts,
  createProduct,
  updateProductById,
  deleteProductById
};
