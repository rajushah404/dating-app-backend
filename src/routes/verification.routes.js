const express = require('express');
const User = require('../models/User');
const authenticate = require('../middlewares/auth');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const AppError = require('../utils/AppError');
const upload = require('../middlewares/upload.middleware');
const { uploadFileToFirebase } = require('../services/storage.service');

const router = express.Router();

/**
 * @route POST /api/verify/submit
 * @desc Submit a Namaste Selfie for verification
 */
router.post('/submit', authenticate, upload.single('selfie'), asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new AppError('Verification selfie is required', 400);
    }

    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) {
        throw new AppError('User not found', 404);
    }

    // Upload selfie to Firebase
    const selfieUrl = await uploadFileToFirebase(req.file, `verifications/${user._id}/selfie`);

    // Update user verification status
    user.verification = {
        status: 'pending',
        selfieUrl,
        submittedAt: new Date()
    };

    await user.save();

    success(res, 'Namaste Verification submitted successfully. Our team will review it soon.', {
        status: user.verification.status,
        submittedAt: user.verification.submittedAt
    });
}));

/**
 * @route GET /api/verify/status
 * @desc Check the current verification status
 */
router.get('/status', authenticate, asyncHandler(async (req, res) => {
    const user = await User.findOne({ firebaseUid: req.user.uid }).select('verification isVerified');

    if (!user) {
        throw new AppError('User not found', 404);
    }

    success(res, 'Verification status retrieved', {
        status: user.verification.status,
        isVerified: user.isVerified,
        submittedAt: user.verification.submittedAt,
        verifiedAt: user.verification.verifiedAt
    });
}));

/**
 * @route PATCH /api/verify/admin/review/:userId
 * @desc Admin only: Approve or Reject a verification request
 */
router.patch('/admin/review/:userId', authenticate, asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { status } = req.body; // 'verified' or 'rejected'

    if (!['verified', 'rejected'].includes(status)) {
        throw new AppError('Invalid status', 400);
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    user.verification.status = status;
    if (status === 'verified') {
        user.isVerified = true;
        user.verification.verifiedAt = new Date();
    } else {
        user.isVerified = false;
    }

    await user.save();

    success(res, `User verification ${status} successfully`, {
        userId: user._id,
        status: user.verification.status,
        isVerified: user.isVerified
    });
}));

module.exports = router;
