const Cart = require('../models/Cart');

const getCartByUserId = async (userId, session = null) => {
  return Cart.findOne({ userId }).session(session);
};

const upsertCartItem = async (userId, itemData, session = null) => {
  const existingCart = await Cart.findOneAndUpdate(
    { userId, 'items.productId': itemData.productId },
    {
      $set: {
        'items.$.quantity': itemData.quantity,
        'items.$.price': itemData.price,
        'items.$.name': itemData.name,
        'items.$.sku': itemData.sku,
        'items.$.imageUrl': itemData.imageUrl,
        'items.$.addedAt': new Date()
      }
    },
    { new: true, session }
  );

  if (existingCart) {
    return existingCart;
  }

  return Cart.findOneAndUpdate(
    { userId },
    { $push: { items: itemData } },
    { new: true, upsert: true, setDefaultsOnInsert: true, session }
  );
};

const updateCartItem = async (userId, itemId, updateData, session = null) => {
  return Cart.findOneAndUpdate(
    { userId, 'items._id': itemId },
    { $set: updateData },
    { new: true, session }
  );
};

const removeCartItem = async (userId, itemId, session = null) => {
  return Cart.findOneAndUpdate(
    { userId },
    { $pull: { items: { _id: itemId } } },
    { new: true, session }
  );
};

const replaceCartItems = async (userId, items, session = null) => {
  return Cart.findOneAndUpdate(
    { userId },
    { $set: { items } },
    { new: true, upsert: true, setDefaultsOnInsert: true, session }
  );
};

module.exports = {
  getCartByUserId,
  upsertCartItem,
  updateCartItem,
  removeCartItem,
  replaceCartItems
};
