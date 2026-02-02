const express = require('express');
const appConfigService = require('../../services/appConfig.service');
const authenticate = require('../../middlewares/auth');
const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/response');
const AppError = require('../../utils/AppError');

const router = express.Router();

/**
 * @route GET /api/admin/config
 * @desc Get current app configuration (Public - for app to fetch limits)
 */
router.get('/config', asyncHandler(async (req, res) => {
    const config = await appConfigService.getConfig();
    success(res, 'App configuration retrieved successfully', config);
}));

/**
 * @route PUT /api/admin/config
 * @desc Update app configuration (Admin only)
 * @body { dailySendLimit?, dailyRevealLimit?, dailyReviewLimit? }
 */
router.put('/config', authenticate, asyncHandler(async (req, res) => {
    // TODO: Add admin role check here
    // For now, any authenticated user can update (you should add admin middleware)

    const { dailySendLimit, dailyRevealLimit, dailyReviewLimit } = req.body;

    // Validation
    if (dailySendLimit !== undefined && (dailySendLimit < 0 || dailySendLimit > 1000)) {
        throw new AppError('dailySendLimit must be between 0 and 1000', 400);
    }
    if (dailyRevealLimit !== undefined && (dailyRevealLimit < 0 || dailyRevealLimit > 100)) {
        throw new AppError('dailyRevealLimit must be between 0 and 100', 400);
    }
    if (dailyReviewLimit !== undefined && (dailyReviewLimit < 0 || dailyReviewLimit > 100)) {
        throw new AppError('dailyReviewLimit must be between 0 and 100', 400);
    }

    const config = await appConfigService.updateConfig(
        { dailySendLimit, dailyRevealLimit, dailyReviewLimit },
        req.user.uid
    );

    success(res, 'App configuration updated successfully', config);
}));

module.exports = router;
