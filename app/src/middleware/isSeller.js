const User = require('../models/User');
const { USER_ROLES } = require('../config/constants');

const isSeller = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized - User not authenticated' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== USER_ROLES.SELLER) {
      return res.status(403).json({ message: 'Forbidden - Seller access required' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking seller status: ' + error.message });
  }
};

module.exports = isSeller;
