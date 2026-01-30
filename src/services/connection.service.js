const connectionRepository = require('../repositories/connection.repository');
const User = require('../models/User');
const { getIO, isUserOnline } = require('../utils/socket');
const notificationService = require('./notification.service');
const {
    BadRequestError,
    NotFoundError,
    ConflictError,
    ForbiddenError
} = require('../utils/domainErrors');

class ConnectionService {
    async sendRequest(fromUserId, toUserId, status) {
        // Self-request check
        if (fromUserId.toString() === toUserId.toString()) {
            throw new BadRequestError('You cannot send a request to yourself');
        }

        // Target user existence check
        const targetUser = await User.findById(toUserId);
        if (!targetUser) {
            throw new NotFoundError('Target user not found');
        }

        const currentUser = await User.findById(fromUserId);

        // Duplicate request prevention (Only one active request between two users)
        const existingConnection = await connectionRepository.findBetweenUsers(fromUserId, toUserId);
        if (existingConnection) {
            throw new ConflictError('A connection request already exists between these users');
        }

        const connection = await connectionRepository.create({
            fromUser: fromUserId,
            toUser: toUserId,
            status
        });

        // --- REAL-TIME NOTIFICATION ---
        if (status === 'interested') {
            try {
                const io = getIO();
                io.to(toUserId.toString()).emit('MATCH_REQUEST', {
                    requestId: connection._id,
                    fromUser: {
                        _id: currentUser._id,
                        name: currentUser.name,
                        photos: currentUser.photos
                    },
                    sentAt: connection.createdAt
                });
            } catch (error) {
                console.error('Socket notification failed for match request:', error.message);
            }

            // --- CLOUD PUSH NOTIFICATION REMOVED ---
            // Firebase notifications are disabled globally.

        }

        return connection;
    }

    async reviewRequest(requestId, receiverId, status) {
        const connection = await connectionRepository.findById(requestId);

        if (!connection) {
            throw new NotFoundError('Connection request not found');
        }

        // Only the receiver can accept/reject
        if (connection.toUser.toString() !== receiverId.toString()) {
            throw new ForbiddenError('You can only review requests sent to you');
        }

        // Only interested can be reviewed
        if (connection.status !== 'interested') {
            throw new BadRequestError(`This request has already been ${connection.status} and cannot be reviewed again`);
        }

        // Update status
        const updatedConnection = await connectionRepository.updateStatus(requestId, status);

        // --- REAL-TIME MATCH NOTIFICATION ---
        if (status === 'accepted') {
            try {
                const io = getIO();
                const receiverUser = await User.findById(receiverId);

                // Notify the person who SENT the original request that it was accepted
                io.to(connection.fromUser.toString()).emit('MATCH_ACCEPTED', {
                    connectionId: updatedConnection._id,
                    user: {
                        _id: receiverUser._id,
                        name: receiverUser.name,
                        photos: receiverUser.photos
                    },
                    matchedAt: updatedConnection.updatedAt
                });
            } catch (error) {
                console.error('Socket notification failed for match acceptance:', error.message);
            }

            // --- CLOUD PUSH NOTIFICATION REMOVED ---
            // Firebase notifications are disabled globally.

        }

        return updatedConnection;
    }

    async getUserConnections(userId) {
        const connections = await connectionRepository.findUserConnections(userId);

        // Format response to show the "Other User" for each connection
        return connections.map(conn => {
            const otherUser = conn.fromUser._id.toString() === userId.toString()
                ? conn.toUser
                : conn.fromUser;

            return {
                connectionId: conn._id,
                user: {
                    _id: otherUser._id,
                    name: otherUser.name,
                    photos: otherUser.photos,
                    onlineStatus: isUserOnline(otherUser._id) ? 'ONLINE' : 'OFFLINE'
                },
                matchedAt: conn.updatedAt
            };
        });
    }
    async getIncomingRequests(userId) {
        const requests = await connectionRepository.findIncomingRequests(userId);

        return requests.map(req => ({
            requestId: req._id,
            user: {
                _id: req.fromUser._id,
                name: req.fromUser.name,
                photos: req.fromUser.photos
            },
            sentAt: req.createdAt
        }));
    }

    async blockUser(fromUserId, toUserId) {
        if (fromUserId.toString() === toUserId.toString()) {
            throw new BadRequestError('You cannot block yourself');
        }

        const connection = await connectionRepository.block(fromUserId, toUserId);
        return connection;
    }
}

module.exports = new ConnectionService();
