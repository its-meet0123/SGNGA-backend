const User = require('../models/User');
const { USER_ROLES } = require('../config/constants');

/**
 * Middleware to check if user is an admin
 * Must be used after authMiddleware
 */
const isAdmin = async (req, res, next) => {
  try {
    // Check if userId exists (set by authMiddleware)
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized - User not authenticated' });
    }

    // Find user by ID
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is admin
    if (user.role !== USER_ROLES.ADMIN) {
      return res.status(403).json({ 
        message: 'Forbidden - Admin access required',
        requiredRole: 'admin',
        userRole: user.role
      });
    }

    // Attach user to request for use in route handlers
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking admin status: ' + error.message });
  }
};

module.exports = isAdmin;
