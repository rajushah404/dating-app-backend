const socketIO = require('socket.io');
const connectionRepository = require('../repositories/connection.repository');

let io;
const socketUserMap = new Map(); // socket.id -> userId
const userSocketCount = new Map(); // userId -> number of active sockets

const initializeSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: "*", // Adjust this in production
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        // 1. User Identification & Room Management
        socket.on('join', async (userId) => {
            if (userId) {
                const userIdStr = userId.toString();

                // Join private room
                socket.join(userIdStr);

                // Track connection
                socketUserMap.set(socket.id, userIdStr);
                const currentCount = userSocketCount.get(userIdStr) || 0;
                userSocketCount.set(userIdStr, currentCount + 1);

                console.log(`User ${userIdStr} joined. (Connections: ${currentCount + 1})`);

                try {
                    const matches = await connectionRepository.findMatchedUserIds(userIdStr);

                    // 2. Online Status Logic (On Join) - Notify Matches
                    matches.forEach(matchId => {
                        io.to(matchId).emit('user_status', {
                            userId: userIdStr,
                            isOnline: true
                        });
                    });

                    // 3. Initial State: Tell THIS user which of their matches are online
                    const onlineMatches = matches.filter(matchId => userSocketCount.has(matchId));
                    socket.emit('initial_online_status', onlineMatches);

                } catch (error) {
                    console.error('Error in socket join logic:', error);
                }
            }
        });

        // 4. Typing Indicator Logic
        socket.on('typing', (data) => {
            const { receiverId, isTyping } = data;
            const senderId = socketUserMap.get(socket.id);

            if (senderId && receiverId) {
                // Forward typing event to receiver's room
                io.to(receiverId.toString()).emit('typing', {
                    userId: senderId,
                    isTyping: !!isTyping
                });
            }
        });

        socket.on('disconnect', async () => {
            console.log(`Socket disconnected: ${socket.id}`);
            const userIdStr = socketUserMap.get(socket.id);

            if (userIdStr) {
                const newCount = (userSocketCount.get(userIdStr) || 1) - 1;

                if (newCount <= 0) {
                    // This was the last active socket for this user
                    userSocketCount.delete(userIdStr);
                    console.log(`User ${userIdStr} is now fully offline.`);

                    try {
                        const matches = await connectionRepository.findMatchedUserIds(userIdStr);
                        matches.forEach(matchId => {
                            io.to(matchId).emit('user_status', {
                                userId: userIdStr,
                                isOnline: false
                            });
                        });
                    } catch (error) {
                        console.error('Error in socket disconnect logic:', error);
                    }
                } else {
                    userSocketCount.set(userIdStr, newCount);
                    console.log(`User ${userIdStr} disconnected 1 socket. (Remaining: ${newCount})`);
                }

                socketUserMap.delete(socket.id);
            }
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized. Call initializeSocket first.');
    }
    return io;
};

module.exports = {
    initializeSocket,
    getIO
};
