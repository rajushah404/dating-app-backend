/**
 * Application Constants
 */
module.exports = {
    PROFILE_REQUIRED_FIELDS: ['name', 'age', 'gender', 'interestedIn', 'lookingFor'],
    DEFAULT_VOICE_PROMPT_QUESTION: 'Introduction',
    STORAGE_PATHS: {
        USER_PHOTOS: (uid) => `users/${uid}/photos`,
        USER_VOICE: (uid) => `users/${uid}/voice`
    }
};
