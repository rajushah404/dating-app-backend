const express = require('express');
const admin = require('firebase-admin');
const User = require('../../models/User');
const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/response');
const { validateAuth } = require('../../validators/auth.validator');
const AppError = require('../../utils/AppError');

const authRouter = express.Router();

// POST /auth route to authenticate user with Firebase ID token
authRouter.post('/auth', validateAuth, asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  console.log('Received ID token:', idToken);

  let decodedToken;
  try {
    // Verify the Firebase ID token
    decodedToken = await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    console.error('Firebase ID token verification failed:', error);
    throw new AppError('Invalid or expired authentication token', 401);
  }

  // Extract user info
  const firebaseUid = decodedToken.uid;
  const email = decodedToken.email;

  // Check if user exists, if not, create
  let user = await User.findOne({ firebaseUid });
  if (!user) {
    user = new User({
      firebaseUid,
      email,
    });
    await user.save();
    console.log('New user created:', user);
  }

  // Respond with success
  success(res, 'Authentication successful', {
    id: user._id,
    firebaseUid: user.firebaseUid,
    email: user.email,
    profileCompleted: user.profileCompleted,
  });
}));

module.exports = authRouter;