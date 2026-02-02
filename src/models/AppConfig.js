const mongoose = require('mongoose');

// App Configuration Schema for Admin Settings
const appConfigSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        enum: ['FREE_USER_LIMITS'] // Can add more config types later
    },

    // Free user daily limits
    freeUserLimits: {
        dailySendLimit: { type: Number, default: 20 }, // How many likes user can send per day
        dailyRevealLimit: { type: Number, default: 2 }, // How many pending requests user can see per day
        dailyReviewLimit: { type: Number, default: 2 }  // How many requests user can review per day
    },

    updatedBy: { type: String }, // Admin who last updated
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const AppConfig = mongoose.model('AppConfig', appConfigSchema);

module.exports = AppConfig;
