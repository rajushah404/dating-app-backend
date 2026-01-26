const express = require('express');
const admin = require('firebase-admin');
const User = require('../../models/User');

const router = express.Router();

// POST /auth route to authenticate user with Firebase ID token
router.post('/auth', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'ID token is required' });
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Extract user info
    const firebaseUid = decodedToken.uid;
    const name = decodedToken.name || 'Unknown';
    const email = decodedToken.email;
    const photoURL = decodedToken.picture || null;

    // Check if user exists, if not, create
    let user = await User.findOne({ firebaseUid });
    if (!user) {
      user = new User({
        firebaseUid,
        name,
        email,
      });
      await user.save();

    } else {
      console.log('User already exists:', user);
    }

    // Respond with success
    res.status(200).json({
      message: 'Authentication successful',
      user: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error in /auth:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
});

module.exports = router;