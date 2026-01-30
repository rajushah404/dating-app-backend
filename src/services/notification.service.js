
class NotificationService {
    /**
     * Send a Push Notification via FCM
     * @param {string} token - The recipient's FCM token
     * @param {object} payload - Notification data (title, body, data)
     */
    async sendPush(token, { title, body, data = {} }) {
        // Firebase Cloud Messaging (Push Notifications) have been removed as per request.
        // We log this for debugging purposes but no actual notification is sent.
        console.log(`[FCM-DISABLED] Notification would have been sent to ${token}: ${title}`);
        return null;
    }

    // Helper methods (Match, Like, Message) have been removed from here 
    // and their calls have been removed from the respective services.
}

module.exports = new NotificationService();
