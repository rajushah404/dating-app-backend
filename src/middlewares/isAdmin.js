const AppError = require('../utils/AppError');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Middleware to restrict access to Admins only
 * Must be used AFTER authenticate middleware
 */
const isAdmin = asyncHandler(async (req, res, next) => {
    // 1. Check if user is attached by auth middleware
    if (!req.user || !req.user.id) {
        throw new AppError('Unauthorized: Authentication required', 401);
    }

    // 2. Fetch user from DB to check role (decoded token might be stale)
    const user = await User.findById(req.user.id);

    if (!user || user.role !== 'admin') {
        throw new AppError('Forbidden: Admin access required', 403);
    }

    // 3. Proceed
    next();
});

module.exports = isAdmin;
