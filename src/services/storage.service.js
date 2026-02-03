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

/**
 * Deletes a file from Firebase Storage
 * @param {string} publicUrl - The public URL of the file to delete
 */
const deleteFileFromFirebase = async (publicUrl) => {
    if (!publicUrl) return;

    try {
        const bucket = admin.storage().bucket();

        // Extract the file path from the URL
        // URL format: https://storage.googleapis.com/<bucket-name>/<file-path>
        // We need to decodeURIComponent because the URL might have encoded characters (like spaces or slashes)
        // Split by the bucket name to get the path
        const bucketName = bucket.name;

        if (!publicUrl.includes(bucketName)) {
            console.warn(`File does not belong to this bucket (${bucketName}): ${publicUrl}`);
            return;
        }

        const pathPart = publicUrl.split(`${bucketName}/`)[1];
        if (!pathPart) {
            console.warn(`Could not extract file path from URL: ${publicUrl}`);
            return;
        }

        const filePath = decodeURIComponent(pathPart);
        await bucket.file(filePath).delete();
        console.log(`Successfully deleted file from Firebase: ${filePath}`);

    } catch (error) {
        // If file not found, we can consider it "deleted" or just log a warning
        if (error.code === 404) {
            console.warn(`File not found in Firebase (already deleted?): ${publicUrl}`);
        } else {
            console.error(`Error deleting file from Firebase: ${error.message}`);
            throw error;
        }
    }
};

module.exports = {
    uploadFileToFirebase,
    deleteFileFromFirebase
};
