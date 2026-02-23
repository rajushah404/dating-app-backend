const rateLimit = require('express-rate-limit');

// General rate limiter for most APIs
const generalLimiter = rateLimit({
    windowMs: parseInt(process.env.GENERAL_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    limit: parseInt(process.env.GENERAL_LIMIT_MAX) || 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later'
    }
});

// Stricter limiter for Auth routes (Login, Register)
const authLimiter = rateLimit({
    windowMs: parseInt(process.env.AUTH_LIMIT_WINDOW_MS) || 60 * 60 * 1000,
    limit: parseInt(process.env.AUTH_LIMIT_MAX) || 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Log the IP being used for rate limiting
        const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        return ip;
    },
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later'
    }
});

// Stricter limiter for Reporting (prevent spam reporting)
const reportLimiter = rateLimit({
    windowMs: parseInt(process.env.REPORT_LIMIT_WINDOW_MS) || 60 * 60 * 1000,
    limit: parseInt(process.env.REPORT_LIMIT_MAX) || 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many reports submitted, please try again later'
    }
});

module.exports = {
    generalLimiter,
    authLimiter,
    reportLimiter
};
