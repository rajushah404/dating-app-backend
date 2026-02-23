const express = require('express');
const admin = require('firebase-admin');
const User = require('../../models/User');
const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/response');
const { validateAuth } = require('../../validators/auth.validator');
const AppError = require('../../utils/AppError');
const { signToken } = require('../../utils/jwt');
const logger = require('../../utils/logger');

const authRouter = express.Router();

// POST /auth route to authenticate user with Firebase ID token
authRouter.post('/auth', validateAuth, asyncHandler(async (req, res) => {
  logger.info(`Auth route hit. Body keys: ${Object.keys(req.body)}`);
  const { idToken } = req.body;

  if (!idToken) {
    logger.error('Auth attempt failed: No idToken in body');
    throw new AppError('ID token is required', 400);
  }

  let decodedToken;
  try {
    logger.info('Verifying Firebase ID token...');
    // Verify the Firebase ID token
    decodedToken = await admin.auth().verifyIdToken(idToken);
    logger.info(`Firebase token verified for UID: ${decodedToken.uid}`);
  } catch (error) {
    logger.error('Firebase ID token verification failed:', error);
    throw new AppError('Invalid or expired authentication token', 401);
  }

  // Extract user info
  const firebaseUid = decodedToken.uid;
  const email = decodedToken.email;

  logger.info(`Finding/Creating user in DB for email: ${email}`);
  // Check if user exists, if not, create
  let user = await User.findOne({ firebaseUid });
  let wasDeactivated = false;

  if (!user) {
    logger.info(`Creating new user for UID: ${firebaseUid}`);
    user = new User({
      firebaseUid,
      email,
    });
    await user.save();
    logger.info(`New user created: ${user._id}`);
  } else if (user.accountStatus === 'deactivated') {
    // Automatically reactivate user on login
    user.accountStatus = 'active';
    await user.save();
    wasDeactivated = true;
    logger.info(`User ${user.name || user._id} reactivated upon login`);
  } else {
    logger.info(`Existing user found: ${user._id}`);
  }

  // Create custom JWT for our app (long-lived)
  logger.info('Signing app token...');
  const token = signToken({
    uid: user.firebaseUid,
    id: user._id,
    email: user.email,
    name: user.name
  });

  logger.info('Authentication successful. Sending response.');
  // Respond with success
  success(res, wasDeactivated ? 'Welcome back! Your account has been reactivated.' : 'Authentication successful', {
    token, // The new long-lived token
    user: {
      id: user._id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      profileCompleted: user.profileCompleted,
      accountStatus: user.accountStatus,
    }
  });
}));

module.exports = authRouter;
