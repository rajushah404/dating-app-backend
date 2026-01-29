const admin = require('firebase-admin');

class NotificationService {
    /**
     * Send a Push Notification via FCM
     * @param {string} token - The recipient's FCM token
     * @param {object} payload - Notification data (title, body, data)
     */
    async sendPush(token, { title, body, data = {} }) {
        if (!token) return;

        const message = {
            notification: {
                title,
                body,
            },
            data: {
                ...data,
                click_action: 'FLUTTER_NOTIFICATION_CLICK',
            },
            token: token,
        };

        try {
            // we use the default app initialized in server.js
            const response = await admin.messaging().send(message);
            console.log('Successfully sent push notification:', response);
            return response;
        } catch (error) {
            console.error('Error sending push notification:', error);
            // If the token is invalid, you might want to remove it from the user in DB
        }
    }

    /**
     * Send notification for a new Match
     */
    async sendMatchNotification(userToken, otherUserName, otherUserId, connectionId, otherUserPhotos) {
        return this.sendPush(userToken, {
            title: "It's a Match! 🎉",
            body: `You and ${otherUserName} liked each other. Say hello!`,
            data: {
                type: 'MATCH',
                connectionId: connectionId.toString(),
                user_id: otherUserId.toString(),
                user_name: otherUserName,
                // Sending arrays in FCM data is tricky, usually strings only. We serialize it.
                user_photos: JSON.stringify(otherUserPhotos || [])
            }
        });
    }

    /**
     * Send notification for a new Interest (Like)
     */
    async sendLikeNotification(userToken, otherUserName) {
        return this.sendPush(userToken, {
            title: "Someone liked you! ❤️",
            body: `${otherUserName} is interested in you. Swipe to find out who!`,
            data: { type: 'LIKE' }
        });
    }

    /**
     * Send notification for a new Message
     */
    async sendMessageNotification(userToken, senderName, content, senderId, senderPhoto) {
        const data = {
            type: 'MESSAGE',
            matchId: senderId.toString(),
            matchName: senderName,
        };

        if (senderPhoto) {
            data.matchPhoto = senderPhoto;
        }

        return this.sendPush(userToken, {
            title: senderName,
            body: content,
            data: data
        });
    }
}

module.exports = new NotificationService();
