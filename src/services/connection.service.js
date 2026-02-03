const connectionRepository = require('../repositories/connection.repository');
const User = require('../models/User');
const { getIO, isUserOnline } = require('../utils/socket');
const notificationService = require('./notification.service');
const appConfigService = require('./appConfig.service');
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
            throw new BadRequestError("Self-love is great, but we're here to find matches with others!");
        }

        // Target user existence check
        const targetUser = await User.findById(toUserId);
        if (!targetUser) {
            throw new NotFoundError('Target user not found');
        }

        const currentUser = await User.findById(fromUserId);
        if (!currentUser) {
            throw new NotFoundError('Current user not found');
        }


        // --- DAILY LIKE LIMIT LOGIC ---
        if (status === 'interested' && (!currentUser.subscription || currentUser.subscription.plan === 'free')) {
            // Get dynamic limit from config
            const dailySendLimit = await appConfigService.getLimit('dailySendLimit');

            const now = new Date();
            const lastReset = currentUser.usage?.lastLikeReset || new Date(0);

            // Check if it's a new day (UTC based)
            const isNewDay = now.getUTCFullYear() !== lastReset.getUTCFullYear() ||
                now.getUTCMonth() !== lastReset.getUTCMonth() ||
                now.getUTCDate() !== lastReset.getUTCDate();

            if (isNewDay) {
                // Reset count for a new day
                currentUser.usage = {
                    dailyLikeCount: 1,
                    lastLikeReset: now
                };
            } else {
                // Check if limit reached
                if (currentUser.usage.dailyLikeCount >= dailySendLimit) {
                    throw new ForbiddenError(`Daily like limit reached (${dailySendLimit}/day). Upgrade for unlimited likes!`);
                }
                // Increment count
                currentUser.usage.dailyLikeCount += 1;
            }
            await currentUser.save();
        }
        // --- END LIMIT LOGIC ---

        // Duplicate request prevention (Only one active request between two users)
        const existingConnection = await connectionRepository.findBetweenUsers(fromUserId, toUserId);
        if (existingConnection) {
            throw new ConflictError("You've already interacted with this person! Check your matches or requests.");
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
            throw new ForbiddenError("Something went wrong. You can only respond to requests sent to your profile.");
        }

        // Only interested can be reviewed
        if (connection.status !== 'interested') {
            throw new BadRequestError(`This request has already been ${connection.status} and cannot be reviewed again`);
        }

        // --- TRACK REVIEW COUNT FOR FREE USERS ---
        const receiverUser = await User.findById(receiverId);
        if (receiverUser && (!receiverUser.subscription || receiverUser.subscription.plan === 'free')) {
            const dailyReviewLimit = await appConfigService.getLimit('dailyReviewLimit');
            const now = new Date();
            const lastReset = receiverUser.usage?.lastReviewReset || new Date(0);

            // Check if it's a new day
            const isNewDay = now.getUTCFullYear() !== lastReset.getUTCFullYear() ||
                now.getUTCMonth() !== lastReset.getUTCMonth() ||
                now.getUTCDate() !== lastReset.getUTCDate();

            if (isNewDay) {
                receiverUser.usage.dailyReviewCount = 1;
                receiverUser.usage.lastReviewReset = now;
            } else {
                if (receiverUser.usage.dailyReviewCount >= dailyReviewLimit) {
                    throw new ForbiddenError(`Daily review limit reached (${dailyReviewLimit}/day). Upgrade for unlimited reviews!`);
                }
                receiverUser.usage.dailyReviewCount = (receiverUser.usage.dailyReviewCount || 0) + 1;
            }
            await receiverUser.save();
        }

        // Update status
        const updatedConnection = await connectionRepository.updateStatus(requestId, status);

        // --- REAL-TIME MATCH NOTIFICATION ---
        if (status === 'accepted') {
            try {
                const io = getIO();

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

        // Format response and filter out deactivated users
        return connections
            .map(conn => {
                const otherUser = conn.fromUser._id.toString() === userId.toString()
                    ? conn.toUser
                    : conn.fromUser;

                return {
                    connectionId: conn._id,
                    user: {
                        _id: otherUser._id,
                        name: otherUser.name,
                        photos: otherUser.photos,
                        accountStatus: otherUser.accountStatus, // Useful for the UI
                        onlineStatus: isUserOnline(otherUser._id) ? 'ONLINE' : 'OFFLINE'
                    },
                    matchedAt: conn.updatedAt
                };
            })
            .filter(match => match.user.accountStatus === 'active');
    }
    async getIncomingRequests(userId) {
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            throw new NotFoundError('User not found');
        }

        const allIncomingRequests = await connectionRepository.findIncomingRequests(userId);
        const totalCount = allIncomingRequests.length;

        // Premium users can see all requests
        if (currentUser.subscription && currentUser.subscription.plan !== 'free') {
            return {
                requests: this._formatRequests(allIncomingRequests),
                totalCount
            };
        }

        // Get dynamic limits from config
        const dailyRevealLimit = await appConfigService.getLimit('dailyRevealLimit');
        const dailyReviewLimit = await appConfigService.getLimit('dailyReviewLimit');

        // --- FREE USER LIMIT LOGIC (Dynamic limits from admin config) ---
        const now = new Date();
        const lastRevealReset = currentUser.usage?.lastRevealedReset || new Date(0);
        const lastReviewReset = currentUser.usage?.lastReviewReset || new Date(0);

        // Check if it's a new day for reveals
        const isNewDayReveal = now.getUTCFullYear() !== lastRevealReset.getUTCFullYear() ||
            now.getUTCMonth() !== lastRevealReset.getUTCMonth() ||
            now.getUTCDate() !== lastRevealReset.getUTCDate();

        // Check if it's a new day for reviews
        const isNewDayReview = now.getUTCFullYear() !== lastReviewReset.getUTCFullYear() ||
            now.getUTCMonth() !== lastReviewReset.getUTCMonth() ||
            now.getUTCDate() !== lastReviewReset.getUTCDate();

        if (isNewDayReveal) {
            currentUser.usage.dailyRevealedLikes = [];
            currentUser.usage.lastRevealedReset = now;
        }

        if (isNewDayReview) {
            currentUser.usage.dailyReviewCount = 0;
            currentUser.usage.lastReviewReset = now;
        }

        // Get current review count
        const reviewCount = currentUser.usage?.dailyReviewCount || 0;

        // IDs of requests that are currently pending AND were already revealed
        let revealedIds = currentUser.usage.dailyRevealedLikes.map(id => id.toString());

        // Filter sub-set of current pending requests that were already "revealed"
        let alreadyRevealedPending = allIncomingRequests.filter(req =>
            revealedIds.includes(req._id.toString())
        );

        // --- STRICT ENFORCEMENT: If user has already reviewed their daily limit, don't reveal new requests ---
        if (reviewCount >= dailyReviewLimit) {
            // User has already reviewed their daily limit
            // Only show requests that are still pending AND were already revealed
            return {
                requests: this._formatRequests(alreadyRevealedPending),
                totalCount
            };
        }

        // Check how many we have ALREADY revealed today (regardless of whether they are still pending)
        // This ensures the strict "See X requests per day" limit.
        const totalRevealedTodayCount = currentUser.usage.dailyRevealedLikes.length;

        // If we haven't reached the reveal limit yet, reveal more FROM THE HIDDEN POOL
        if (totalRevealedTodayCount < dailyRevealLimit) {
            const hiddenPending = allIncomingRequests.filter(req =>
                !revealedIds.includes(req._id.toString())
            );

            // Calculate exact space left based on TOTAL revealed count, not just currently pending
            const spaceLeft = dailyRevealLimit - totalRevealedTodayCount;
            const toReveal = hiddenPending.slice(0, spaceLeft);

            toReveal.forEach(req => {
                currentUser.usage.dailyRevealedLikes.push(req._id);
            });

            if (toReveal.length > 0) {
                await currentUser.save();
            }

            alreadyRevealedPending = [...alreadyRevealedPending, ...toReveal];
        }

        return {
            requests: this._formatRequests(alreadyRevealedPending),
            totalCount
        };
    }

    // Helper to format request objects for consistent response
    _formatRequests(requests) {
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
            throw new BadRequestError("You can't block yourself, but you can always take a break from the app.");
        }

        const connection = await connectionRepository.block(fromUserId, toUserId);

        // --- REAL-TIME BLOCK NOTIFICATION ---
        try {
            const io = getIO();
            // Emit to both users to ensure their UIs refresh and remove each other
            io.to(fromUserId.toString()).emit('USER_BLOCKED', { blockedUserId: toUserId });
            io.to(toUserId.toString()).emit('USER_BLOCKED', { blockedUserId: fromUserId });
        } catch (error) {
            console.error('Socket notification failed for block:', error.message);
        }

        return connection;
    }
}

module.exports = new ConnectionService();
