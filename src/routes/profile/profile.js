const express = require('express');
const User = require('../../models/User');
const authenticate = require('../../middlewares/auth');
const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/response');
const { validateUpdateProfile } = require('../../validators/profile.validator');
const AppError = require('../../utils/AppError');
const { isUserOnline } = require('../../utils/socket');
const logger = require('../../utils/logger');

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

  const profileData = {
    ...user,
    onlineStatus: isUserOnline(user._id) ? 'ONLINE' : 'OFFLINE'
  };

  success(res, 'Public profile retrieved successfully', profileData);
}));

// PATCH /api/users/update-profile to update user profile fields
router.patch('/update-profile', authenticate, validateUpdateProfile, asyncHandler(async (req, res) => {
  const firebaseUid = req.user.uid;
  const updates = req.body;


  // Auto-set interestedIn by default based on gender update
  if (updates.gender && !updates.interestedIn) {
    if (updates.gender === 'male') {
      updates.interestedIn = ['female'];
    } else if (updates.gender === 'female') {
      updates.interestedIn = ['male'];
    }
  }

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
const { uploadFileToFirebase, deleteFileFromFirebase } = require('../../services/storage.service');

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

/**
 * @route DELETE /api/users/delete-photo
 * @desc Delete a specific photo from profile and Firebase
 */
router.delete('/delete-photo', authenticate, asyncHandler(async (req, res) => {
  const { photoUrl } = req.body;
  if (!photoUrl) throw new AppError('Photo URL is required', 400);

  // 1. Remove from Firebase
  await deleteFileFromFirebase(photoUrl);

  // 2. Remove from DB
  const user = await User.findOneAndUpdate(
    { firebaseUid: req.user.uid },
    { $pull: { photos: { url: photoUrl } } },
    { new: true }
  ).select('photos');

  success(res, 'Photo deleted successfully', { photos: user ? user.photos : [] });
}));

/**
 * @route DELETE /api/users/delete-voice-prompt
 * @desc Delete voice prompt from profile and Firebase
 */
router.delete('/delete-voice-prompt', authenticate, asyncHandler(async (req, res) => {
  const user = await User.findOne({ firebaseUid: req.user.uid });

  if (user && user.voicePrompt && user.voicePrompt.url) {
    // 1. Remove from Firebase
    await deleteFileFromFirebase(user.voicePrompt.url);

    // 2. Remove from DB
    // We use unset to completely remove the field or set to null/default
    await User.findOneAndUpdate(
      { firebaseUid: req.user.uid },
      { $unset: { voicePrompt: "" } }
    );
  }

  success(res, 'Voice prompt deleted successfully');
}));

/**
 * @route PATCH /api/users/status
 * @desc Deactivate or reactivate account
 */
router.patch('/status', authenticate, asyncHandler(async (req, res) => {
  const { status } = req.body; // 'active' or 'deactivated'

  if (!['active', 'deactivated'].includes(status)) {
    throw new AppError('Invalid status. Use "active" or "deactivated".', 400);
  }

  const user = await User.findOneAndUpdate(
    { firebaseUid: req.user.uid },
    { $set: { accountStatus: status } },
    { new: true }
  ).select('accountStatus name');

  const msg = status === 'deactivated'
    ? "Account deactivated. You're now invisible to others, but your data is safe!"
    : "Welcome back! Your account is now active again.";

  success(res, msg, user);
}));

/**
 * @route DELETE /api/users/delete-account
 * @desc Permanently delete account and all related data
 */
const connectionRepository = require('../../repositories/connection.repository');
const messageRepository = require('../../repositories/message.repository');
const admin = require('firebase-admin');

router.delete('/delete-account', authenticate, asyncHandler(async (req, res) => {
  const user = await User.findOne({ firebaseUid: req.user.uid });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const userId = user._id;

  // 1. Delete all files from Firebase Storage
  try {
    const filesToDelete = [];

    // Add photos
    if (user.photos && user.photos.length > 0) {
      user.photos.forEach(p => {
        if (p.url) filesToDelete.push(deleteFileFromFirebase(p.url));
      });
    }

    // Add voice prompt
    if (user.voicePrompt && user.voicePrompt.url) {
      filesToDelete.push(deleteFileFromFirebase(user.voicePrompt.url));
    }

    // Execute all deletions in parallel
    if (filesToDelete.length > 0) {
      await Promise.all(filesToDelete);
      logger.info(`🧹 Cleaned up ${filesToDelete.length} files from storage for user ${userId}`);
    }
  } catch (err) {
    logger.error('Error cleaning up user files from storage:', err);
    // Continue even if some files fail to delete
  }

  // 2. Delete all connections
  await connectionRepository.deleteByUser(userId);

  // 3. Delete all messages
  await messageRepository.deleteByUser(userId);

  // 4. Delete from MongoDB
  await User.findByIdAndDelete(userId);

  // 5. Delete from Firebase Auth (Optional but recommended)
  try {
    await admin.auth().deleteUser(req.user.uid);
  } catch (error) {
    logger.error('Firebase user deletion failed:', error);
    // Continue even if Firebase fails, as the local data is already gone
  }

  success(res, "Account and all data have been permanently deleted. We're sad to see you go!");
}));

module.exports = router;
