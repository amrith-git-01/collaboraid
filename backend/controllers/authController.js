const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Email = require('../utils/email');

const { createSendToken } = require('../utils/token');

exports.register = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });
    if (!newUser) {
        return next(new AppError('Failed to create user', 400));
    }
    // Send welcome email (non-blocking - don't fail registration if email fails)
    try {
        const url = `${req.protocol}://${req.get('host')}`;
        await new Email(newUser, url).sendWelcome();
    } catch (emailError) {
        // Log email error but don't fail registration
        console.error('Failed to send welcome email:', emailError.message);
    }
    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }
    await user.save({ validateBeforeSave: false });
    createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if (!token || token === 'loggedout') {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id).select('+password');
    if (!currentUser) {
        return next(new AppError('The user no longer exists.', 401));
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('Password was changed recently. Please log in again.', 401));
    }

    req.user = currentUser;
    next();
});

exports.logout = catchAsync(async (req, res, next) => {
    res.cookie('jwt', '', {
        expires: new Date(0),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });
    res.status(200).json({ status: 'success', message: 'Logged out successfully' });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body;

    // Enhanced validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return next(new AppError('Please provide a valid email address', 400));
    }

    let user = await User.findOne({ email });
    if (!user) {
        // Don't reveal if user exists (security best practice)
        console.log(`Password reset requested for non-existent email: ${email} at ${new Date().toISOString()}`);
        return res.status(200).json({
            status: 'success',
            message: 'If an account with that email exists, a password reset link has been sent.'
        });
    }
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    try {
        const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        await new Email(user, resetURL).sendPasswordReset();

        // Log successful password reset request
        console.log(`Password reset link sent to: ${email} at ${new Date().toISOString()}`);

        res.status(200).json({
            status: 'success',
            message: 'If an account with that email exists, a password reset link has been sent.'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        console.error('Email sending failed:', err);
        return next(new AppError('There was an error sending the email. Try again later!', 500));
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    const token = req.params.token;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    let user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });
    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }
    const { password, passwordConfirm } = req.body;
    if (!password || !passwordConfirm) {
        return next(new AppError('Please provide a password and passwordConfirm', 400));
    }
    if (password !== passwordConfirm) {
        return next(new AppError('Passwords are not the same', 400));
    }
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    try {

        const user = req.user;

        if (!user) {
            return next(new AppError('You are not logged in! Please log in to get access.', 401));
        }

        const { passwordCurrent, password, passwordConfirm } = req.body;

        if (!passwordCurrent || !password || !passwordConfirm) {
            return next(new AppError('Please provide current password, new password, and password confirmation', 400));
        }

        if (password.length < 6) {
            return next(new AppError('Password must be at least 6 characters long', 400));
        }

        if (password !== passwordConfirm) {
            return next(new AppError('Passwords are not the same', 400));
        }

        if (!(await user.correctPassword(passwordCurrent, user.password))) {
            return next(new AppError('Your current password is wrong', 401));
        }

        if (await user.correctPassword(password, user.password)) {
            return next(new AppError('New password must be different from current password', 400));
        }

        user.password = password;
        await user.save({ validateBeforeSave: false });
        console.log(`Password updated for user: ${user.email} at ${new Date().toISOString()}`);
        createSendToken(user, 200, res);
    } catch (error) {
        console.error('Error updating password:', error);
        return next(new AppError('There was an error updating the password', 500));
    }
});