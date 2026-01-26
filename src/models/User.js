const mongoose = require('mongoose');

// User Details and Preferences Schema
const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },

  gender: { type: String, enum: ["male", "female", "other"] },
  age: { type: Number, min: 18, max: 50 },

  sexualOrientation: {
    type: [String],
    enum: ["straight", "gay", "lesbian", "bisexual", "asexual", "other"]
  },

  interestedIn: {
    type: [String],
    enum: ["male", "female", "other"]
  },

  lookingFor: {
    type: String,
    enum: ["long_term", "short_term", "casual", "friendship", "marriage", "not_sure"]
  },

  agePreference: {
    min: { type: Number, default: 18 },
    max: { type: Number, default: 50 }
  },

  maxDistanceKm: { type: Number, default: 50 },

  lifestyle: {
    smoking: { type: String, enum: ["no", "occasionally", "yes"] },
    drinking: { type: String, enum: ["no", "occasionally", "yes"] },
    workout: { type: String, enum: ["never", "sometimes", "regularly"] }
  },

  interests: [String],
  personality: [String],

  bio: { type: String, maxlength: 500 },

  photos: [{
    url: String,
    isPrimary: Boolean,
    uploadedAt: Date
  }],

  locationEnabled: { type: Boolean, default: false },

  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] } // get lng & lat from GPS
  },

  isVerified: { type: Boolean, default: false },
  profileCompleted: { type: Boolean, default: false },

  lastActiveAt: { type: Date }

}, { timestamps: true });


// Unique constraints
userSchema.index({ firebaseUid: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });

// Geo queries
userSchema.index({ location: '2dsphere' });

// Discovery & filtering
userSchema.index({ gender: 1, age: 1 });
userSchema.index({ interestedIn: 1 });
userSchema.index({ lastActiveAt: -1 });

// Profile quality
userSchema.index({ isVerified: 1, profileCompleted: 1 });


const User = mongoose.model('User', userSchema);

module.exports = User;
