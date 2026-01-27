const express = require('express');
const connectionService = require('../../services/connection.service');
const User = require('../../models/User');
const authenticate = require('../../middlewares/auth');
const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/response');
const { validateSendRequest, validateReviewRequest } = require('../../validators/connection.validator');
const AppError = require('../../utils/AppError');

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
 * @route POST /api/connections/:toUserId
 * @desc Send a connection request (interested or ignored)
 */
router.post('/:toUserId', authenticate, validateSendRequest, asyncHandler(async (req, res) => {
    const fromUser = await getDbUser(req.user.uid);
    const { toUserId } = req.params;
    const { status } = req.body;

    const connection = await connectionService.sendRequest(fromUser._id, toUserId, status);

    success(res, 'Connection request sent successfully', connection);
}));

/**
 * @route POST /api/connections/:requestId/review
 * @desc Accept or reject a connection request
 */
router.post('/:requestId/review', authenticate, validateReviewRequest, asyncHandler(async (req, res) => {
    const reviewer = await getDbUser(req.user.uid);
    const { requestId } = req.params;
    const { status } = req.body;

    const connection = await connectionService.reviewRequest(requestId, reviewer._id, status);

    const message = status === 'accepted' ? 'Connection request accepted. It\'s a match!' : 'Connection request rejected';
    success(res, message, connection);
}));

/**
 * @route GET /api/connections/pending-likes
 * @desc Get all pending connection requests (people who liked you)
 */
router.get('/pending-likes', authenticate, asyncHandler(async (req, res) => {
    const user = await getDbUser(req.user.uid);
    const requests = await connectionService.getIncomingRequests(user._id);

    success(res, 'Incoming requests retrieved successfully', requests);
}));

/**
 * @route GET /api/connections/matches
 * @desc Get all accepted connections for the current user
 */
router.get('/matches', authenticate, asyncHandler(async (req, res) => {
    const user = await getDbUser(req.user.uid);
    const connections = await connectionService.getUserConnections(user._id);

    success(res, 'Connections retrieved successfully', connections);
}));

module.exports = router;
