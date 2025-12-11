const multer = require('multer');
const sharp = require('sharp');
const {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const AppError = require('./appError');

// S3 Client setup
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

// Base multer configuration
const createMulterUpload = (options = {}) => {
    const {
        fieldName = 'file',
        maxFileSize = 10 * 1024 * 1024, // 10MB default
        allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        destination = 'uploads'
    } = options;

    return multer({
        storage: multer.memoryStorage(),
        limits: {
            fileSize: maxFileSize,
        },
        fileFilter: (req, file, cb) => {
            if (allowedMimeTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new AppError(`Only ${allowedMimeTypes.join(', ')} files are allowed`, 400), false);
            }
        }
    });
};

// Common image processing function
const processAndUploadImage = async (file, options = {}) => {
    const {
        width = 1200,
        height = 800,
        quality = 90,
        format = 'jpeg',
        fit = 'cover',
        destination = 'uploads',
        userId = 'anonymous',
        prefix,
        eventId = null
    } = options;

    try {
        let processedImage;

        // Special handling for event images to maintain 1:1 aspect ratio without cropping
        if (destination === 'EventPhoto') {
            // For event images, use 'contain' fit to prevent cropping and add padding if needed
            processedImage = await sharp(file.buffer)
                .resize(width, height, {
                    fit: 'contain',
                    background: { r: 255, g: 255, b: 255, alpha: 1 } // White background for padding
                })
                .toFormat(format)
                .jpeg({ quality })
                .toBuffer();
        } else {
            // For other images (like profile photos), use the original logic
            processedImage = await sharp(file.buffer)
                .resize(width, height, { fit })
                .toFormat(format)
                .jpeg({ quality })
                .toBuffer();
        }

        // Generate unique filename with proper folder structure
        const timestamp = Date.now();
        const originalName = file.originalname.replace(/\s+/g, '-');

        let key;
        if (destination === 'EventPhoto') {
            // For events: userId/EventPhoto/eventId/timestamp-filename
            // If no eventId, use 'temp' as placeholder
            const folderId = eventId || 'temp';
            key = `${userId}/${destination}/${folderId}/${timestamp}-${originalName}`;
        } else {
            // For others: userId/destination/timestamp-filename
            key = `${userId}/${destination}/${timestamp}-${originalName}`;
        }

        // Upload to S3
        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
            Body: processedImage,
            ContentType: `image/${format}`,
            ACL: 'public-read',
        };

        const command = new PutObjectCommand(uploadParams);
        await s3.send(command);

        // Return the public URL
        return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    } catch (error) {
        throw new AppError('Failed to process and upload image', 500);
    }
};

// Delete file from S3
const deleteFileFromS3 = async (fileUrl) => {
    try {
        if (!fileUrl) return;

        // Extract the S3 key from the URL
        const urlParts = fileUrl.split('/');
        const s3Key = urlParts.slice(3).join('/');

        const deleteParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: s3Key,
        };

        const deleteCommand = new DeleteObjectCommand(deleteParams);
        await s3.send(deleteCommand);

        console.log('File deleted from S3:', s3Key);
    } catch (error) {
        console.warn('Failed to delete S3 file:', error.message);
    }
};

// Pre-configured upload instances for common use cases
const uploads = {
    // Profile photo upload
    profilePhoto: createMulterUpload({
        fieldName: 'file',
        maxFileSize: 10 * 1024 * 1024,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
        destination: 'ProfilePhoto'
    }),




};

// Image processing presets
const imagePresets = {
    profile: { width: 800, height: 800, fit: 'cover', quality: 90 },
    thumbnail: { width: 300, height: 300, fit: 'cover', quality: 80 },
    banner: { width: 1920, height: 600, fit: 'cover', quality: 85 }
};

module.exports = {
    createMulterUpload,
    processAndUploadImage,
    deleteFileFromS3,
    uploads,
    imagePresets,
    s3
};
