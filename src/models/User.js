const mongoose = require('mongoose');

// User Details and Preferences Schema
const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  name: { type: String, },
  email: { type: String, required: true, unique: true },


  gender: { type: String, enum: ["male", "female", "other"] },
  age: { type: Number, min: 18, max: 50 },



  interestedIn: {
    type: [String],
    enum: ["male", "female", "other"]
  },

  lookingFor: {
    type: String
  },

  agePreference: {
    min: { type: Number, default: 18 },
    max: { type: Number, default: 50 }
  },

  maxDistanceKm: { type: Number, default: 10 },

  lifestyle: {
    smoking: { type: String },
    drinking: { type: String },
    workout: { type: String }
  },

  interests: [String],
  personality: [String],

  bio: { type: String, maxlength: 500 },

  hometown: { type: String },
  preferredDateVibe: { type: String },
  slangBadges: [String],
  rashi: { type: String },

  photos: [{
    url: String,
    isPrimary: Boolean,
    uploadedAt: Date
  }],

  voicePrompt: {
    url: String,
    duration: Number, // in seconds
    promptQuestion: String,
    createdAt: { type: Date, default: Date.now }
  },

  locationEnabled: { type: Boolean, default: false },

  location: {
    type: { type: String, enum: ['Point'], },
    coordinates: { type: [Number] } // get lng & lat from GPS
  },

  isVerified: { type: Boolean, default: false },
  profileCompleted: { type: Boolean, default: false },

  subscription: {
    plan: { type: String, enum: ['free', 'gold', 'platinum'], default: 'free' },
    status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
    expiryDate: { type: Date },
    paymentProvider: { type: String }, // 'google_play', 'apple_pay', 'esewa', 'khalti'
    subscriptionId: { type: String }
  },

  usage: {
    dailyLikeCount: { type: Number, default: 0 },
    lastLikeReset: { type: Date, default: Date.now },
    dailyRevealedLikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Connection' }],
    lastRevealedReset: { type: Date, default: Date.now },
    dailyReviewCount: { type: Number, default: 0 },
    lastReviewReset: { type: Date, default: Date.now }
  },

  verification: {
    status: { type: String, enum: ['none', 'pending', 'verified', 'rejected'], default: 'none' },
    selfieUrl: { type: String },
    submittedAt: { type: Date },
    verifiedAt: { type: Date }
  },

  accountStatus: { type: String, enum: ['active', 'deactivated'], default: 'active' },

  lastActiveAt: { type: Date }

}, { timestamps: true });


// Auto-set interestedIn based on gender (Default behavior)
userSchema.pre('save', function () {
  if (this.gender === 'male') {
    this.interestedIn = ['female'];
  } else if (this.gender === 'female') {
    this.interestedIn = ['male'];
  }
});

// Geo queries
userSchema.index({ location: '2dsphere' });

const User = mongoose.model('User', userSchema);

module.exports = User;
