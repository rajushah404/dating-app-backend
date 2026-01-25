const express = require('express');
const User = require('../../models/User');
const authenticate = require('../../middleware/auth');

const router = express.Router();

// POST /profile route to get or create user profile
router.get('/profile', authenticate, async (req, res) => {
  console.log('Profile request for user:', req.user.uid);
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
      console.log('User created in profile:', user);
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

module.exports = router;