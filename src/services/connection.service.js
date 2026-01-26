const connectionRepository = require('../repositories/connection.repository');
const User = require('../models/User');
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

        // Duplicate request prevention (Only one active request between two users)
        const existingConnection = await connectionRepository.findBetweenUsers(fromUserId, toUserId);
        if (existingConnection) {
            // If a connection already exists, we don't allow a new one.
            // If it's accepted, they are already matched.
            // If it's interested/ignored/rejected, we don't allow changing it via 'sendRequest' 
            // except maybe if it was ignored/rejected but the user wants to keep the status?
            // The rule says "Only one active request between two users".
            throw new ConflictError('A connection request already exists between these users');
        }

        return await connectionRepository.create({
            fromUser: fromUserId,
            toUser: toUserId,
            status
        });
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
        return await connectionRepository.updateStatus(requestId, status);
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
                    photos: otherUser.photos
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
}

module.exports = new ConnectionService();
