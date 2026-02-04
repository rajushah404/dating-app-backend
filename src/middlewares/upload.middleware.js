const multer = require('multer');
const path = require('path');
const logger = require('../utils/logger');

// Configure multer to store files in memory
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Log the file details for debugging
    logger.debug('File details:', {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype
    });

    // Supported extensions (Images & Audio)
    const filetypes = /jpeg|jpg|png|gif|webp|mp3|wav|m4a|aac|ogg|mpeg/;
    // Check extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mimetype
    const mimetype = file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/') || file.mimetype === 'application/octet-stream';

    if (mimetype || extname) {
        cb(null, true);
    } else {
        const error = new Error('Only image and audio files are allowed!');
        error.statusCode = 400;
        cb(error, false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});

module.exports = upload;
