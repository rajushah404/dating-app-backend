const express = require('express');
const User = require('../../models/User');
const authenticate = require('../../middlewares/auth');
const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/response');
const { validateUpdateProfile } = require('../../validators/profile.validator');
const AppError = require('../../utils/AppError');

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

/**
 * @route POST /api/users/upload-photo
 * @desc Upload a photo to Firebase Storage
 */
const upload = require('../../middlewares/upload.middleware');
const { uploadFileToFirebase } = require('../../services/storage.service');

router.post('/upload-photo', authenticate, upload.single('photo'), asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('Please upload a file', 400);
  }

  const imageUrl = await uploadFileToFirebase(req.file, `users/${req.user.uid}/photos`);

  success(res, 'Photo uploaded successfully', { imageUrl });
}));

/**
 * @route POST /api/users/upload-voice-prompt
 * @desc Upload a voice prompt to Firebase Storage
 */
router.post('/upload-voice-prompt', authenticate, upload.single('audio'), asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('Please upload an audio file', 400);
  }

  const { duration, promptQuestion } = req.body;

  const audioUrl = await uploadFileToFirebase(req.file, `users/${req.user.uid}/voice`);

  // Update user model with voice prompt info
  const updatedUser = await User.findOneAndUpdate(
    { firebaseUid: req.user.uid },
    {
      $set: {
        voicePrompt: {
          url: audioUrl,
          duration: duration ? parseInt(duration) : 0,
          promptQuestion: promptQuestion || 'Introduction',
          createdAt: new Date()
        }
      }
    },
    { new: true }
  ).select('-__v');

  success(res, 'Voice prompt uploaded successfully', { voicePrompt: updatedUser.voicePrompt });
}));

module.exports = router;