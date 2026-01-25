const mongoose = require('mongoose');

// Define the User schema with fields for Firebase authentication
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
    type: { type: String, enum: ['Point'] },
    coordinates: { type: [Number] }
  },

  isVerified: { type: Boolean, default: false },
  profileCompleted: { type: Boolean, default: false }

}, { timestamps: true });

userSchema.index({ location: '2dsphere' });


const User = mongoose.model('User', userSchema);

module.exports = User;
