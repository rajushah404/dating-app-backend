const AppConfig = require('../models/AppConfig');
const { NotFoundError } = require('../utils/domainErrors');

class AppConfigService {
    /**
     * Get the current app configuration
     */
    async getConfig() {
        let config = await AppConfig.findOne({ key: 'FREE_USER_LIMITS' });

        // If no config exists, create default one
        if (!config) {
            config = await AppConfig.create({
                key: 'FREE_USER_LIMITS',
                freeUserLimits: {
                    dailySendLimit: 20,
                    dailyRevealLimit: 2,
                    dailyReviewLimit: 2
                }
            });
        }

        return config;
    }

    /**
     * Update app configuration (Admin only)
     */
    async updateConfig(updates, adminId) {
        let config = await AppConfig.findOne({ key: 'FREE_USER_LIMITS' });

        if (!config) {
            // Create if doesn't exist
            config = new AppConfig({
                key: 'FREE_USER_LIMITS',
                freeUserLimits: {
                    dailySendLimit: 20,
                    dailyRevealLimit: 2,
                    dailyReviewLimit: 2
                }
            });
        }

        // Update only provided fields
        if (updates.dailySendLimit !== undefined) {
            config.freeUserLimits.dailySendLimit = updates.dailySendLimit;
        }
        if (updates.dailyRevealLimit !== undefined) {
            config.freeUserLimits.dailyRevealLimit = updates.dailyRevealLimit;
        }
        if (updates.dailyReviewLimit !== undefined) {
            config.freeUserLimits.dailyReviewLimit = updates.dailyReviewLimit;
        }

        config.updatedBy = adminId;
        config.updatedAt = new Date();

        await config.save();
        return config;
    }

    /**
     * Get specific limit value
     */
    async getLimit(limitType) {
        const config = await this.getConfig();
        return config.freeUserLimits[limitType] || 0;
    }
}

module.exports = new AppConfigService();
