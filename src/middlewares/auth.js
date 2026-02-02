const { verifyToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// Middleware to authenticate requests using Custom JWT
const authenticate = asyncHandler(async (req, res, next) => {
    // Extract the Authorization header
    const authHeader = req.headers.authorization;

    // Check if the Authorization header is present and starts with 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError('Unauthorized: Missing or invalid Authorization header', 401);
    }

    // Extract the token from the header
    const token = authHeader.split('Bearer ')[1];

    try {
        // Verify the Custom JWT locally (Fast, no network call)
        const decoded = verifyToken(token);

        // Attach the decoded token (containing user info) to the request object
        // Note: decoded contains { uid, id, email }
        req.user = decoded;

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        console.error('Error verifying Custom JWT:', error);
        throw new AppError('Invalid or expired authentication token', 401);
    }
});

module.exports = authenticate;

