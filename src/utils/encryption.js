const CryptoJS = require('crypto-js');

const ENCRYPTION_KEY = process.env.MESSAGE_ENCRYPTION_KEY || 'fallback-secret-key-edugate-2026';

/**
 * Encrypt a string using AES-256
 * @param {string} text - The clear text to encrypt
 * @returns {string} - The encrypted base64 string
 */
const encrypt = (text) => {
    if (!text) return text;
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
};

/**
 * Decrypt a string using AES-256
 * @param {string} ciphertext - The base64 encrypted string
 * @returns {string} - The decrypted clear text
 */
const decrypt = (ciphertext) => {
    if (!ciphertext) return ciphertext;
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        return originalText || "[Decryption Error]";
    } catch (e) {
        console.error('Decryption failed:', e.message);
        return "[Encrypted Message]";
    }
};

module.exports = {
    encrypt,
    decrypt
};
