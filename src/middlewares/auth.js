const admin = require('firebase-admin');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// Middleware to authenticate requests using Firebase ID token
const authenticate = asyncHandler(async (req, res, next) => {
    // Extract the Authorization header
    const authHeader = req.headers.authorization;

    // Check if the Authorization header is present and starts with 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError('Unauthorized: Missing or invalid Authorization header', 401);
    }

    // Extract the token from the header
    const idToken = authHeader.split('Bearer ')[1];

    try {
        // Verify the Firebase ID token
        const decodedToken = await admin.auth().verifyIdToken(idToken);

        // Attach the decoded token (containing user info) to the request object
        req.user = decodedToken;

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        console.error('Error verifying Firebase ID token:', error);
        // Standardize Firebase auth errors as requested
        throw new AppError('Invalid or expired authentication token', 401);
    }
});

module.exports = authenticate;

