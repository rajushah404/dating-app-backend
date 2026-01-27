const express = require('express');
const User = require('../../models/User');
const authenticate = require('../../../middlewares/auth');
const asyncHandler = require('../../../utils/asyncHandler');
const { success } = require('../../../utils/response');
const { validateUpdateProfile } = require('../../../validators/profile.validator');
const AppError = require('../../../utils/AppError');

const router = express.Router();

// GET /profile route to get the logged-in user's own profile
router.get('/profile', authenticate, asyncHandler(async (req, res) => {
  const firebaseUid = req.user.uid;

  let user = await User.findOne({ firebaseUid }).select('-__v');

  if (!user) {
    user = new User({
      firebaseUid,
      name: req.user.name || 'Unknown',
      email: req.user.email,
    });
    await user.save();
  }

  success(res, 'User profile retrieved successfully', user);
}));

/**
 * @route GET /api/users/:userId
 * @desc Get another user's public profile
 */
router.get('/:userId', authenticate, asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Use the repository method we just added
  const userRepository = require('../../repositories/user.repository');
  const user = await userRepository.findPublicProfileById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  success(res, 'Public profile retrieved successfully', user);
}));

// PATCH /api/users/update-profile to update user profile fields
router.patch('/update-profile', authenticate, validateUpdateProfile, asyncHandler(async (req, res) => {
  const firebaseUid = req.user.uid;
  const updates = req.body;

  // Update user
  const updatedUser = await User.findOneAndUpdate(
    { firebaseUid },
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-__v');

  if (!updatedUser) {
    throw new AppError('User not found', 404);
  }

  // Check profile completion
  const requiredFields = ['name', 'age', 'gender', 'interestedIn', 'lookingFor'];
  let completed = true;
  for (const field of requiredFields) {
    if (!updatedUser[field]) {
      completed = false;
      break;
    }
  }
  if (updatedUser.locationEnabled !== true) completed = false;

  if (completed && !updatedUser.profileCompleted) {
    updatedUser.profileCompleted = true;
    await updatedUser.save();
  } else if (!completed && updatedUser.profileCompleted) {
    updatedUser.profileCompleted = false;
    await updatedUser.save();
  }

  success(res, 'Profile updated successfully', updatedUser);
}));

module.exports = router;