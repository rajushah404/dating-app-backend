const AppConfig = require('../models/AppConfig');

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
                    dailySendLimit: 20,      // Free users can send 20 likes per day
                    dailyRevealLimit: 2,     // Free users can see 2 pending requests per day
                    dailyReviewLimit: 2      // Free users can review 2 requests per day
                },
                updatedBy: 'system',
                updatedAt: new Date()
            });

            console.log('✅ Default app configuration initialized:', defaultConfig);
        } else {
            console.log('ℹ️  App configuration already exists:', existingConfig);
        }
    } catch (error) {
        console.error('❌ Error initializing app configuration:', error);
    }
}

module.exports = { initializeDefaultConfig };
