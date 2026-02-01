const messageRepository = require('../repositories/message.repository');
const connectionRepository = require('../repositories/connection.repository');
const User = require('../models/User');
const { getIO } = require('../utils/socket');
const notificationService = require('./notification.service');
const AppError = require('../utils/AppError');
const { encrypt, decrypt } = require('../utils/encryption');

class MessageService {
    async sendMessage(senderId, receiverId, content) {
        // 1. Verify if users are matched
        const connection = await connectionRepository.findBetweenUsers(senderId, receiverId);

        if (!connection || connection.status !== 'accepted') {
            throw new AppError("It's not a match yet! You can start chatting once you both like each other.", 403);
        }

        // 2. Encrypt and save message to database
        const encryptedContent = encrypt(content);
        const messageData = {
            connection: connection._id,
            sender: senderId,
            receiver: receiverId,
            content: encryptedContent
        };

        const message = await messageRepository.create(messageData);

        // 3. Emit via Socket.io for real-time delivery (send decrypted content to receiver)
        const io = getIO();
        io.to(receiverId.toString()).emit('new_message', {
            _id: message._id,
            connectionId: connection._id,
            senderId,
            content, // Send clear text via socket (it's already over TLS/SSL)
            createdAt: message.createdAt
        });

        // 4. --- CLOUD PUSH NOTIFICATION REMOVED ---
        // Firebase notifications are disabled globally.


        // Return message with decrypted content to the sender
        const responseData = message.toObject();
        responseData.content = content; // content is the original plain text
        return responseData;
    }

    async getChatHistory(currentUserId, otherUserId, limit, offset) {
        const connection = await connectionRepository.findBetweenUsers(currentUserId, otherUserId);

        if (!connection || connection.status !== 'accepted') {
            throw new AppError("We couldn't find a match for this chat. Keep swiping to find new connections!", 404);
        }

        const messages = await messageRepository.getChatHistory(connection._id, limit, offset);

        // Decrypt message content for history
        const decryptedMessages = messages.map(msg => ({
            ...msg,
            content: decrypt(msg.content)
        }));

        // Mark messages as read
        await messageRepository.markAsRead(connection._id, currentUserId);

        return decryptedMessages;
    }
}

module.exports = new MessageService();
