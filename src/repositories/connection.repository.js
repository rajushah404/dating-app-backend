const Connection = require('../models/Connection');

class ConnectionRepository {
    async findBetweenUsers(userA, userB) {
        return await Connection.findOne({
            $or: [
                { fromUser: userA, toUser: userB },
                { fromUser: userB, toUser: userA }
            ]
        }).select('-__v').lean();
    }

    async create(data) {
        return await Connection.create(data);
    }

    async findById(id) {
        return await Connection.findById(id).select('-__v').lean();
    }

    async findPendingForReceiver(requestId, receiverId) {
        return await Connection.findOne({
            _id: requestId,
            toUser: receiverId,
            status: 'interested'
        }).select('-__v');
    }

    async updateStatus(id, status) {
        return await Connection.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        ).select('-__v').lean();
    }

    async findUserConnections(userId) {
        return await Connection.find({
            $or: [
                { fromUser: userId, status: 'accepted' },
                { toUser: userId, status: 'accepted' }
            ]
        })
            .populate('fromUser', '_id name photos')
            .populate('toUser', '_id name photos')
            .select('-__v')
            .lean();
    }

    async findIncomingRequests(userId) {
        return await Connection.find({
            toUser: userId,
            status: 'interested'
        })
            .populate('fromUser', '_id name photos')
            .select('-__v')
            .lean();
    }

    async findUserRequestIds(userId) {
        const connections = await Connection.find({
            $or: [
                { fromUser: userId },
                { toUser: userId }
            ]
        }).select('fromUser toUser').lean();

        const interactionIds = connections.map(c =>
            c.fromUser.toString() === userId.toString() ? c.toUser : c.fromUser
        );

        return interactionIds;
    }
}

module.exports = new ConnectionRepository();
