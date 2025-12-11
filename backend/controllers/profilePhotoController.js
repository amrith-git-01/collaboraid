const User = require('../models/userModel');
const { uploads, processAndUploadImage, deleteFileFromS3, imagePresets } = require('../utils/multerConfig');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.uploadProfilePhoto = catchAsync(async (req, res, next) => {
    uploads.profilePhoto.single('file')(req, res, async (err) => {
        if (err) {
            return next(new AppError('File upload failed', 500));
        }
        try {
            const file = req.file;
            if (!file) {
                return next(new AppError('No file uploaded', 400));
            }

            // Process and upload image using common utility
            const profilePhotoUrl = await processAndUploadImage(file, {
                ...imagePresets.profile,
                destination: 'ProfilePhoto',
                userId: req.user.id,
                prefix: 'profile'
            });

            // Use findByIdAndUpdate instead of save to avoid validation errors
            const updatedUser = await User.findByIdAndUpdate(
                req.user.id,
                { profilePhoto: profilePhotoUrl },
                { new: true, runValidators: false }
            );

            if (!updatedUser) {
                return next(new AppError('User not found', 404));
            }

            res.status(200).json({
                status: 'success',
                message: 'Profile photo uploaded successfully',
                data: {
                    profilePhoto: profilePhotoUrl,
                },
            });
        } catch (error) {
            console.error('Error uploading profile photo:', error);
            return next(new AppError('Failed to upload profile photo', 500));
        }
    });
});

exports.removeProfilePhoto = catchAsync(async (req, res, next) => {
    try {
        // First, get the current user to find the existing profile photo URL
        const currentUser = await User.findById(req.user.id);

        if (!currentUser) {
            return next(new AppError('User not found', 404));
        }

        // If there's an existing profile photo, try to delete it from S3
        if (currentUser.profilePhoto) {
            try {
                await deleteFileFromS3(currentUser.profilePhoto);
                console.log('Profile photo deleted from S3');
            } catch (s3Error) {
                // Log S3 deletion error but don't fail the request
                console.warn('Failed to delete S3 file, but continuing with database update:', s3Error.message);
            }
        }

        // Remove profile photo from user document by setting it to null
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { profilePhoto: null },
            { new: true, runValidators: false }
        );

        if (!updatedUser) {
            return next(new AppError('User not found', 404));
        }

        res.status(200).json({
            status: 'success',
            message: 'Profile photo removed successfully',
            data: {
                profilePhoto: null,
            },
        });
    } catch (error) {
        console.error('Error removing profile photo:', error);
        return next(new AppError('Failed to remove profile photo', 500));
    }
});