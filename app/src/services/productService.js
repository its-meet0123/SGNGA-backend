const Product = require('../models/Product');
const { USER_ROLES } = require('../config/constants');
const productRepository = require('../repositories/productRepository');

const buildApprovalMeta = (userId) => ({
  requestedBy: userId,
  requestedAt: new Date(),
  approvedBy: null,
  approvedAt: null,
  rejectedBy: null,
  rejectedAt: null,
  rejectionReason: null
});

const getAllProducts = async ({ category, minPrice, maxPrice, search, page = 1, limit = 10 }) => {
  const filter = {};

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
  const products = await productRepository.getApprovedProducts(filter, skip, Number(limit));
  const total = await productRepository.countApprovedProducts(filter);

  return {
    products,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit)
    }
  };
};

const getProductById = async (productId, currentUserId = null) => {
  const product = await productRepository.getProductById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  if (product.status !== 'approved' || !product.isActive) {
    if (!currentUserId || product.seller.toString() !== currentUserId.toString()) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }
  }

  return product;
};

const createProduct = async (user, data) => {
  const payload = {
    ...data,
    seller: user._id,
    sku: data.sku || null
  };

  if (user.role === USER_ROLES.ADMIN) {
    payload.status = 'approved';
    payload.isActive = true;
    payload.approval = {
      requestedBy: user._id,
      requestedAt: new Date(),
      approvedBy: user._id,
      approvedAt: new Date(),
      rejectedBy: null,
      rejectedAt: null,
      rejectionReason: null
    };
  } else {
    payload.status = 'pending';
    payload.isActive = false;
    payload.approval = buildApprovalMeta(user._id);
  }

  return productRepository.createProduct(payload);
};

const updateProduct = async (user, productId, data) => {
  const product = await productRepository.getProductById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === USER_ROLES.ADMIN) {
    const updated = await productRepository.updateProductById(productId, {
      ...data,
      status: 'approved',
      isActive: true,
      pendingUpdates: null,
      pendingDeletion: false,
      approval: {
        requestedBy: product.approval?.requestedBy || user._id,
        requestedAt: product.approval?.requestedAt || new Date(),
        approvedBy: user._id,
        approvedAt: new Date(),
        rejectedBy: null,
        rejectedAt: null,
        rejectionReason: null
      }
    });
    return updated;
  }

  if (product.seller.toString() !== user._id.toString()) {
    const error = new Error('Forbidden - Sellers can only manage their own products');
    error.statusCode = 403;
    throw error;
  }

  if (!product.isActive && product.status === 'pending') {
    const updated = await productRepository.updateProductById(productId, {
      ...data,
      approval: buildApprovalMeta(user._id)
    });
    return updated;
  }

  const pendingUpdates = {
    ...(product.pendingUpdates || {}),
    ...data
  };

  const updated = await productRepository.updateProductById(productId, {
    pendingUpdates,
    status: 'pending',
    approval: buildApprovalMeta(user._id)
  });

  return updated;
};

const requestDeletion = async (user, productId) => {
  const product = await productRepository.getProductById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === USER_ROLES.ADMIN) {
    await productRepository.deleteProductById(productId);
    return null;
  }

  if (product.seller.toString() !== user._id.toString()) {
    const error = new Error('Forbidden - Sellers can only manage their own products');
    error.statusCode = 403;
    throw error;
  }

  if (!product.isActive && product.status === 'pending') {
    await productRepository.deleteProductById(productId);
    return null;
  }

  const updated = await productRepository.updateProductById(productId, {
    pendingDeletion: true,
    status: 'pending',
    approval: buildApprovalMeta(user._id)
  });

  return updated;
};

const getSellerProducts = async (userId) => {
  return productRepository.getSellerProducts(userId);
};

const getPendingProducts = async () => {
  return productRepository.getPendingProducts();
};

const approveProduct = async (adminUser, productId) => {
  const product = await productRepository.getProductById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  if (product.pendingDeletion) {
    await productRepository.deleteProductById(productId);
    return null;
  }

  const updatedPayload = {
    status: 'approved',
    isActive: true,
    pendingDeletion: false,
    pendingUpdates: null,
    approval: {
      requestedBy: product.approval?.requestedBy || adminUser._id,
      requestedAt: product.approval?.requestedAt || new Date(),
      approvedBy: adminUser._id,
      approvedAt: new Date(),
      rejectedBy: null,
      rejectedAt: null,
      rejectionReason: null
    }
  };

  if (product.pendingUpdates && Object.keys(product.pendingUpdates).length > 0) {
    Object.assign(updatedPayload, product.pendingUpdates);
  }

  return productRepository.updateProductById(productId, updatedPayload);
};

const rejectProduct = async (adminUser, productId, reason) => {
  const product = await productRepository.getProductById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  if (product.pendingDeletion && product.isActive) {
    return productRepository.updateProductById(productId, {
      pendingDeletion: false,
      status: 'approved',
      approval: {
        requestedBy: product.approval?.requestedBy || adminUser._id,
        requestedAt: product.approval?.requestedAt || new Date(),
        approvedBy: null,
        approvedAt: null,
        rejectedBy: adminUser._id,
        rejectedAt: new Date(),
        rejectionReason: reason || 'Deletion request rejected'
      }
    });
  }

  return productRepository.updateProductById(productId, {
    pendingUpdates: null,
    pendingDeletion: false,
    status: 'rejected',
    isActive: false,
    approval: {
      requestedBy: product.approval?.requestedBy || adminUser._id,
      requestedAt: product.approval?.requestedAt || new Date(),
      approvedBy: null,
      approvedAt: null,
      rejectedBy: adminUser._id,
      rejectedAt: new Date(),
      rejectionReason: reason || 'Changes rejected by admin'
    }
  });
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  requestDeletion,
  getSellerProducts,
  getPendingProducts,
  approveProduct,
  rejectProduct
};
