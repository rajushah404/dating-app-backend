const express = require('express');
const discoverService = require('../services/discover.service');
const authenticate = require('../middlewares/auth');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const router = express.Router();

// Helper to get DB User from Firebase UID
const getDbUser = async (firebaseUid) => {
    const user = await User.findOne({ firebaseUid });
    if (!user) {
        throw new AppError('User not found in database', 404);
    }
    return user;
};

/**
 * @route GET /api/discover
 * @desc Get discoverable users for the current user
 */
router.get('/', authenticate, asyncHandler(async (req, res) => {
    const dbUser = await getDbUser(req.user.uid);
    const { cursor, limit, gender, ageMin, ageMax, distance } = req.query;

    const overrides = {
        gender: gender ? gender.split(',') : null,
        ageMin: ageMin ? parseInt(ageMin) : null,
        ageMax: ageMax ? parseInt(ageMax) : null,
        distance: distance ? parseInt(distance) : null
    };

    const discoveryFeed = await discoverService.getDiscoveryFeed(dbUser._id, cursor, limit, overrides);

    success(res, 'Discovery feed fetched successfully', discoveryFeed);
}));

module.exports = router;
