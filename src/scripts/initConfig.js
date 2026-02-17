const AppConfig = require('../models/AppConfig');
const logger = require('../utils/logger');

/**
 * Initialize default app configuration
 * Run this once to set up default limits
 */
async function initializeDefaultConfig() {
    try {
        const existingConfig = await AppConfig.findOne({ key: 'FREE_USER_LIMITS' });

        if (!existingConfig) {
            const defaultConfig = await AppConfig.create({
                key: 'FREE_USER_LIMITS',
                freeUserLimits: {
                    dailySendLimit: parseInt(process.env.FREE_DAILY_SEND_LIMIT) || 20,
                    dailyRevealLimit: parseInt(process.env.FREE_DAILY_REVEAL_LIMIT) || 2,
                    dailyReviewLimit: parseInt(process.env.FREE_DAILY_REVIEW_LIMIT) || 2
                },
                updatedBy: 'system',
                updatedAt: new Date()
            });

            logger.info('Default app configuration initialized:', defaultConfig);
        } else {
            logger.debug('App configuration already exists');
        }
    } catch (error) {
        logger.error('Error initializing app configuration:', error);
    }
}

module.exports = { initializeDefaultConfig };
