const Message = require('../models/Message');

class MessageRepository {
    async create(data) {
        const message = await Message.create(data);
        return message;
    }

    async getChatHistory(connectionId, limit = 50, offset = 0) {
        return await Message.find({ connection: connectionId })
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit)
            .select('-__v')
            .lean();
    }

    async markAsRead(connectionId, receiverId) {
        return await Message.updateMany(
            { connection: connectionId, receiver: receiverId, isRead: false },
            { isRead: true }
        );
    }

    async findLastMessage(connectionId) {
        return await Message.findOne({ connection: connectionId })
            .sort({ createdAt: -1 })
            .select('content createdAt sender')
            .lean();
    }
}

module.exports = new MessageRepository();
