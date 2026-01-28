const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    connection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Connection',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for fetching chat history between two users efficiently
messageSchema.index({ connection: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
