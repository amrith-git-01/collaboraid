const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.protect, authController.logout);

// Get current user info
router.get('/me', authController.protect, userController.getMe);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch('/updatePassword', authController.protect, authController.updatePassword);
router.patch('/updateMe', authController.protect, userController.updateMe);

module.exports = router;