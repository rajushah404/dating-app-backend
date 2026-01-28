const express = require('express');
const messageService = require('../services/message.service');
const authenticate = require('../middlewares/auth');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const router = express.Router();

// Helper to get DB User from Firebase UID (consistent with discover routes)
const getDbUser = async (firebaseUid) => {
    const user = await User.findOne({ firebaseUid });
    if (!user) {
        throw new AppError('User not found in database', 404);
    }
    return user;
};

/**
 * @route POST /api/messages/send
 * @desc Send a message to a matched user
 */
router.post('/send', authenticate, asyncHandler(async (req, res) => {
    const dbUser = await getDbUser(req.user.uid);
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
        throw new AppError('Receiver ID and content are required', 400);
    }

    const message = await messageService.sendMessage(dbUser._id, receiverId, content);

    success(res, 'Message sent successfully', message);
}));

/**
 * @route GET /api/messages/:otherUserId
 * @desc Get chat history with a specific user
 */
router.get('/:otherUserId', authenticate, asyncHandler(async (req, res) => {
    const dbUser = await getDbUser(req.user.uid);
    const { otherUserId } = req.params;
    const { limit, offset } = req.query;

    const history = await messageService.getChatHistory(
        dbUser._id,
        otherUserId,
        limit ? parseInt(limit) : 50,
        offset ? parseInt(offset) : 0
    );

    success(res, 'Chat history fetched successfully', history);
}));

module.exports = router;
