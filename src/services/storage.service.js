const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

/**
 * Uploads a file to Firebase Storage
 * @param {Object} file - The file object from multer (req.file)
 * @param {string} folder - The folder path in the bucket (e.g., 'profile_photos')
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
const uploadFileToFirebase = async (file, folder = 'uploads') => {
    if (!file) {
        throw new Error('No file provided');
    }

    const bucket = admin.storage().bucket();
    const filename = `${folder}/${uuidv4()}_${file.originalname}`;
    const fileUpload = bucket.file(filename);

    const stream = fileUpload.createWriteStream({
        metadata: {
            contentType: file.mimetype,
        },
    });

    return new Promise((resolve, reject) => {
        stream.on('error', (err) => {
            reject(err);
        });

        stream.on('finish', async () => {
            // Make the file public
            await fileUpload.makePublic();

            // Construct the public URL
            // Format: https://storage.googleapis.com/<bucket-name>/<file-path>
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
            resolve(publicUrl);
        });

        stream.end(file.buffer);
    });
};

module.exports = {
    uploadFileToFirebase,
};
