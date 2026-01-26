const express = require('express');
const User = require('../../models/User');
const authenticate = require('../../middleware/auth');

const router = express.Router();

// POST /profile route to get or create user profile
router.get('/profile', authenticate, async (req, res) => {

  try {
    // Extract the Firebase UID from the authenticated user
    const firebaseUid = req.user.uid;

    // Try to find the user in the database
    let user = await User.findOne({ firebaseUid });

    // If user doesn't exist, create a new one
    if (!user) {
      user = new User({
        firebaseUid,
        name: req.user.name || 'Unknown', // Use name from token or default
        email: req.user.email,
      });

      // Save the new user to the database
      await user.save();

    } else {
      console.log('User found in profile:', user);
    }

    // Return the user profile as JSON
    res.status(200).json({
      message: 'User profile retrieved successfully',
      user: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error handling profile request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/users/update-profile to update user profile fields
router.patch('/update-profile', authenticate, async (req, res) => {
  try {
    const firebaseUid = req.user.uid;

    console.log('Update profile request body:', req.body);
    const allowedFields = [
      "name",
      "age",
      "gender",
      "sexualOrientation",
      "interestedIn",
      "lookingFor",
      "lifestyle",
      "interests",
      "personality",
      "bio",
      "photos",
      "location",
      "locationEnabled",
      "maxDistanceKm",
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Validation
    if (updates.age !== undefined) {
      if (typeof updates.age !== 'number' || updates.age < 18 || updates.age > 50) {
        return res.status(400).json({ error: 'Age must be between 18 and 50' });
      }
    }

    if (updates.gender !== undefined) {
      if (!["male", "female", "other"].includes(updates.gender)) {
        return res.status(400).json({ error: 'Invalid gender' });
      }
    }

    if (updates.bio !== undefined) {
      if (typeof updates.bio !== 'string' || updates.bio.length > 500) {
        return res.status(400).json({ error: 'Bio must be a string with max 500 characters' });
      }
    }

    if (updates.interests !== undefined) {
      if (!Array.isArray(updates.interests) || updates.interests.length > 10) {
        return res.status(400).json({ error: 'Interests must be an array with max 10 items' });
      }
    }

    if (updates.sexualOrientation !== undefined) {
      if (!Array.isArray(updates.sexualOrientation)) {
        return res.status(400).json({ error: 'Sexual orientation must be an array' });
      }
      const validOrientations = ["straight", "gay", "lesbian", "bisexual", "asexual", "other"];
      for (const orientation of updates.sexualOrientation) {
        if (!validOrientations.includes(orientation)) {
          return res.status(400).json({ error: 'Invalid sexual orientation value' });
        }
      }
    }

    if (updates.interestedIn !== undefined) {
      if (!Array.isArray(updates.interestedIn) || updates.interestedIn.length < 1) {
        return res.status(400).json({ error: 'Interested in must be an array with at least 1 value' });
      }
      const validGenders = ["male", "female", "other"];
      for (const gender of updates.interestedIn) {
        if (!validGenders.includes(gender)) {
          return res.status(400).json({ error: 'Invalid interested in value' });
        }
      }
    }

    if (updates.lookingFor !== undefined) {
      const validLookingFor = ["long_term", "short_term", "casual", "friendship", "marriage", "not_sure"];
      if (!validLookingFor.includes(updates.lookingFor)) {
        return res.status(400).json({ error: 'Invalid looking for value' });
      }
    }

    if (updates.lifestyle !== undefined) {
      if (typeof updates.lifestyle !== 'object') {
        return res.status(400).json({ error: 'Lifestyle must be an object' });
      }
      const validSmoking = ["no", "occasionally", "yes"];
      const validDrinking = ["no", "occasionally", "yes"];
      const validWorkout = ["never", "sometimes", "regularly"];
      if (updates.lifestyle.smoking !== undefined && !validSmoking.includes(updates.lifestyle.smoking)) {
        return res.status(400).json({ error: 'Invalid smoking value' });
      }
      if (updates.lifestyle.drinking !== undefined && !validDrinking.includes(updates.lifestyle.drinking)) {
        return res.status(400).json({ error: 'Invalid drinking value' });
      }
      if (updates.lifestyle.workout !== undefined && !validWorkout.includes(updates.lifestyle.workout)) {
        return res.status(400).json({ error: 'Invalid workout value' });
      }
    }

    if (updates.photos !== undefined) {
      if (!Array.isArray(updates.photos) || updates.photos.length < 1 || updates.photos.length > 6) {
        return res.status(400).json({ error: 'Photos must be an array with 1 to 6 items' });
      }
      let primaryCount = 0;
      for (const photo of updates.photos) {
        if (typeof photo !== 'object' || !photo.url || typeof photo.isPrimary !== 'boolean') {
          return res.status(400).json({ error: 'Each photo must have url and isPrimary' });
        }
        if (photo.isPrimary) primaryCount++;
      }
      if (primaryCount !== 1) {
        return res.status(400).json({ error: 'Exactly one photo must be primary' });
      }
    }

    if (updates.locationEnabled !== undefined) {
      if (typeof updates.locationEnabled !== 'boolean') {
        return res.status(400).json({ error: 'Location enabled must be boolean' });
      }
    }

    if (updates.location !== undefined) {
      if (typeof updates.location !== 'object' || updates.location.type !== 'Point' || !Array.isArray(updates.location.coordinates) || updates.location.coordinates.length !== 2) {
        return res.status(400).json({ error: 'Location must be {type: "Point", coordinates: [lng, lat]}' });
      }
    }

    if (updates.maxDistanceKm !== undefined) {
      if (typeof updates.maxDistanceKm !== 'number' || updates.maxDistanceKm < 1 || updates.maxDistanceKm > 500) {
        return res.status(400).json({ error: 'Max distance must be between 1 and 500 km' });
      }
    }

    // Check location if enabled
    if (updates.locationEnabled === true && (!updates.location || !updates.location.coordinates)) {
      return res.status(400).json({ error: 'Location coordinates required when location enabled' });
    }

    // Update user
    const updatedUser = await User.findOneAndUpdate(
      { firebaseUid },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
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
    //if (!updatedUser.photos || updatedUser.photos.length < 1) completed = false;
    if (updatedUser.locationEnabled !== true) completed = false;

    if (completed && !updatedUser.profileCompleted) {
      updatedUser.profileCompleted = true;
      await updatedUser.save();
    } else if (!completed && updatedUser.profileCompleted) {
      updatedUser.profileCompleted = false;
      await updatedUser.save();
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;