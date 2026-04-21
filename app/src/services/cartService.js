const mongoose = require('mongoose');
const Product = require('../models/Product');
const cartRepository = require('../repositories/cartRepository');

const buildCartItem = (product, quantity) => ({
  productId: product._id,
  name: product.name,
  price: product.price,
  quantity,
  sku: product.sku || null,
  imageUrl: product.images?.[0]?.url || null,
  addedAt: new Date()
});

const calculateCartTotals = (cart) => {
  const items = (cart?.items || []).map((item) => ({
    itemId: item._id,
    productId: item.productId,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    sku: item.sku,
    imageUrl: item.imageUrl,
    subtotal: Number((item.price * item.quantity).toFixed(2))
  }));

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = Number(items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));

  return {
    userId: cart?.userId,
    items,
    totalItems,
    totalAmount,
    updatedAt: cart?.updatedAt || new Date()
  };
};

const ensureValidQuantity = (quantity) => {
  if (!Number.isInteger(quantity) || quantity < 1) {
    const error = new Error('Quantity must be an integer greater than zero');
    error.statusCode = 400;
    throw error;
  }
};

const fetchActiveProduct = async (productId, session = null) => {
  const product = await Product.findById(productId).session(session);
  if (!product || !product.isActive) {
    const error = new Error('Product not found or unavailable');
    error.statusCode = 404;
    throw error;
  }
  return product;
};

const getCart = async (userId) => {
  const cart = await cartRepository.getCartByUserId(userId) || { items: [] };
  return calculateCartTotals(cart);
};

const addOrUpdateItem = async (userId, { productId, quantity }) => {
  ensureValidQuantity(quantity);

  const session = await mongoose.startSession();
  let transactionStarted = false;

  try {
    try {
      session.startTransaction();
      transactionStarted = true;
    } catch (transactionError) {
      console.warn('Transactions unavailable, proceeding without them:', transactionError.message);
    }

    const product = await fetchActiveProduct(productId, transactionStarted ? session : null);

    if (quantity > product.stock) {
      const error = new Error(`Cannot add ${quantity} items. Only ${product.stock} in stock`);
      error.statusCode = 400;
      throw error;
    }

    const updatedCart = await cartRepository.upsertCartItem(
      userId,
      buildCartItem(product, quantity),
      transactionStarted ? session : null
    );

    if (transactionStarted) {
      await session.commitTransaction();
    }

    return calculateCartTotals(updatedCart);
  } catch (error) {
    if (transactionStarted) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    session.endSession();
  }
};

const updateItem = async (userId, itemId, quantity) => {
  ensureValidQuantity(quantity);

  const session = await mongoose.startSession();
  let transactionStarted = false;

  try {
    try {
      session.startTransaction();
      transactionStarted = true;
    } catch (transactionError) {
      console.warn('Transactions unavailable, proceeding without them:', transactionError.message);
    }

    const cart = await cartRepository.getCartByUserId(userId, transactionStarted ? session : null);
    if (!cart) {
      const error = new Error('Cart not found');
      error.statusCode = 404;
      throw error;
    }

    const item = cart.items.id(itemId);
    if (!item) {
      const error = new Error('Cart item not found');
      error.statusCode = 404;
      throw error;
    }

    const product = await fetchActiveProduct(item.productId, transactionStarted ? session : null);
    if (quantity > product.stock) {
      const error = new Error(`Cannot update to ${quantity}. Only ${product.stock} in stock`);
      error.statusCode = 400;
      throw error;
    }

    const updatedCart = await cartRepository.updateCartItem(
      userId,
      itemId,
      {
        'items.$.quantity': quantity,
        'items.$.price': product.price,
        'items.$.name': product.name,
        'items.$.sku': product.sku || null,
        'items.$.imageUrl': product.images?.[0]?.url || null
      },
      transactionStarted ? session : null
    );

    if (!updatedCart) {
      const error = new Error('Failed to update cart item');
      error.statusCode = 500;
      throw error;
    }

    if (transactionStarted) {
      await session.commitTransaction();
    }

    return calculateCartTotals(updatedCart);
  } catch (error) {
    if (transactionStarted) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    session.endSession();
  }
};

const removeItem = async (userId, itemId) => {
  const removedCart = await cartRepository.removeCartItem(userId, itemId);
  if (!removedCart) {
    const error = new Error('Cart item not found');
    error.statusCode = 404;
    throw error;
  }
  return calculateCartTotals(removedCart);
};

const mergeGuestCart = async (userId, guestCart = []) => {
  const normalizedItems = Array.isArray(guestCart) ? guestCart : [];

  const validGuestItems = normalizedItems.reduce((acc, item) => {
    const quantity = Number(item.quantity);
    if (!item.productId || !Number.isInteger(quantity) || quantity < 1) {
      return acc;
    }
    const key = item.productId.toString();
    acc[key] = (acc[key] || 0) + quantity;
    return acc;
  }, {});

  if (Object.keys(validGuestItems).length === 0) {
    return getCart(userId);
  }

  const session = await mongoose.startSession();
  let transactionStarted = false;

  try {
    try {
      session.startTransaction();
      transactionStarted = true;
    } catch (transactionError) {
      console.warn('Transactions unavailable, proceeding without them:', transactionError.message);
    }

    const productIds = Object.keys(validGuestItems).filter((productId) => mongoose.Types.ObjectId.isValid(productId));
    if (productIds.length === 0) {
      return getCart(userId);
    }

    const products = await Product.find({ _id: { $in: productIds }, isActive: true }).session(transactionStarted ? session : null);
    const currentCart = await cartRepository.getCartByUserId(userId, transactionStarted ? session : null) || { items: [] };

    const existingByProduct = currentCart.items.reduce((map, item) => {
      map[item.productId.toString()] = item.quantity;
      return map;
    }, {});

    const mergedItems = products.reduce((items, product) => {
      const existingQuantity = existingByProduct[product._id.toString()] || 0;
      const guestQuantity = validGuestItems[product._id.toString()] || 0;
      const mergedQuantity = Math.min(product.stock, existingQuantity + guestQuantity);

      if (mergedQuantity > 0) {
        items.push(buildCartItem(product, mergedQuantity));
      }
      delete existingByProduct[product._id.toString()];
      return items;
    }, []);

    // Preserve any remaining existing items whose products are still available
    for (const item of currentCart.items) {
      const id = item.productId.toString();
      if (existingByProduct[id]) {
        const product = products.find((productItem) => productItem._id.toString() === id);
        if (product) {
          const quantity = Math.min(product.stock, item.quantity);
          if (quantity > 0) {
            mergedItems.push(buildCartItem(product, quantity));
          }
        }
      }
    }

    const updatedCart = await cartRepository.replaceCartItems(
      userId,
      mergedItems,
      transactionStarted ? session : null
    );

    if (transactionStarted) {
      await session.commitTransaction();
    }

    return calculateCartTotals(updatedCart);
  } catch (error) {
    if (transactionStarted) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = {
  getCart,
  addOrUpdateItem,
  updateItem,
  removeItem,
  mergeGuestCart
};
