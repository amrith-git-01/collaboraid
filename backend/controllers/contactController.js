const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Email = require("../utils/email");

exports.sendContactMessage = catchAsync(async (req, res, next) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return next(new AppError('All fields are required', 400));
    }

    try {
        const adminUser = {
            email: process.env.EMAIL_FROM,
            name: 'Admin'
        };

        const emailInstance = new Email(adminUser, null);
        await emailInstance.sendContactMessage({
            name,
            email,
            subject: 'Contact Form Message',
            message
        });

        res.status(201).json({
            status: 'success',
            message: 'Contact message sent successfully'
        });
    } catch (error) {
        return next(new AppError('Failed to send email', 500));
    }
});