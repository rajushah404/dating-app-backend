const messageRepository = require('../repositories/message.repository');
const connectionRepository = require('../repositories/connection.repository');
const User = require('../models/User');
const { getIO } = require('../utils/socket');
const notificationService = require('./notification.service');
const AppError = require('../utils/AppError');

class MessageService {
    async sendMessage(senderId, receiverId, content) {
        // 1. Verify if users are matched
        const connection = await connectionRepository.findBetweenUsers(senderId, receiverId);

        if (!connection || connection.status !== 'accepted') {
            throw new AppError('You can only message users you have matched with.', 403);
        }

        // 2. Save message to database
        const messageData = {
            connection: connection._id,
            sender: senderId,
            receiver: receiverId,
            content
        };

        const message = await messageRepository.create(messageData);

        // 3. Emit via Socket.io for real-time delivery
        const io = getIO();
        io.to(receiverId.toString()).emit('new_message', {
            _id: message._id,
            connectionId: connection._id,
            senderId,
            content,
            createdAt: message.createdAt
        });

        // 4. --- HYBRID: CLOUD PUSH NOTIFICATION ---
        try {
            const receiver = await User.findById(receiverId);
            const sender = await User.findById(senderId);
            if (receiver.fcmToken) {
                const senderPhoto = sender.photos && sender.photos.length > 0
                    ? (sender.photos.find(p => p.isPrimary) || sender.photos[0]).url
                    : null;

                notificationService.sendMessageNotification(
                    receiver.fcmToken,
                    sender.name,
                    content,
                    senderId,
                    senderPhoto
                );
            }
        } catch (error) {
            console.error('Failed to send message push notification:', error.message);
        }

        return message;
    }

    async getChatHistory(currentUserId, otherUserId, limit, offset) {
        const connection = await connectionRepository.findBetweenUsers(currentUserId, otherUserId);

        if (!connection || connection.status !== 'accepted') {
            throw new AppError('No match found between users.', 404);
        }

        const messages = await messageRepository.getChatHistory(connection._id, limit, offset);

        // Mark messages as read
        await messageRepository.markAsRead(connection._id, currentUserId);

        return messages;
    }
}

module.exports = new MessageService();
