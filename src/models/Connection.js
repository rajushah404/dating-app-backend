const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['ignored', 'interested', 'accepted', 'rejected'],
    required: true
  }
}, {
  timestamps: true
});

// Compound unique index to prevent duplicate requests between same users in same direction
// Business logic will handle reverse duplicates and active request rules
connectionSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });

// Index for performance on common queries
connectionSchema.index({ toUser: 1, status: 1 });
connectionSchema.index({ fromUser: 1, toUser: 1, status: 1 });

const Connection = mongoose.model('Connection', connectionSchema);

module.exports = Connection;
