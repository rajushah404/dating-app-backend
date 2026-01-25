const mongoose = require('mongoose');

// Define the User schema with fields for Firebase authentication
const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  photoURL: {
    type: String,
    default: null,
  },

},
  { timestamps: true });


const User = mongoose.model('User', userSchema);

module.exports = User;