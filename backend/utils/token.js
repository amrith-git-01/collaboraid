const jwt = require('jsonwebtoken');

function signToken(id, role) {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
}

function createSendToken(user, statusCode, res) {
    const token = signToken(user._id, user.role);

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/unite', // Fix: Match the API base path
    };

    res.cookie('jwt', token, cookieOptions);

    res.status(statusCode).json({
        status: 'success',
        user,
        token,
    });
}

module.exports = { createSendToken };