const express = require('express');
const connectionService = require('../services/connection.service');
const reportService = require('../services/report.service');
const User = require('../models/User');
const authenticate = require('../middlewares/auth');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
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
 * @route POST /api/safety/block/:userId
 * @desc Block a user
 */
router.post('/block/:userId', authenticate, asyncHandler(async (req, res) => {
    const fromUser = await getDbUser(req.user.uid);
    const { userId } = req.params;

    const connection = await connectionService.blockUser(fromUser._id, userId);

    success(res, 'User blocked successfully', connection);
}));

/**
 * @route POST /api/safety/report/:userId
 * @desc Report a user
 */
router.post('/report/:userId', authenticate, asyncHandler(async (req, res) => {
    const reporter = await getDbUser(req.user.uid);
    const { userId } = req.params;
    const { reason } = req.body;

    if (!reason) {
        throw new AppError('Reason is required for reporting', 400);
    }

    const report = await reportService.createReport(reporter._id, userId, reason);

    success(res, 'User reported and blocked successfully', report);
}));

/**
 * @route GET /api/safety/my-reports
 * @desc Get reports I have submitted
 */
router.get('/my-reports', authenticate, asyncHandler(async (req, res) => {
    const user = await getDbUser(req.user.uid);
    const reports = await reportService.getMyReports(user._id);

    success(res, 'My reports retrieved successfully', reports);
}));

module.exports = router;
