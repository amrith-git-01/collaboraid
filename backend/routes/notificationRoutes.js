const express = require('express');
const notificationController = require('../controllers/notificationController');
const authController = require('../controllers/authController');

const router = express.Router();

// All routes require authentication
router.use(authController.protect);

router.get('/myNotifications', notificationController.getMyNotifications);
router.post('/create', notificationController.createNotification);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/markAllRead', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);
router.delete('/', notificationController.deleteAllNotifications);

module.exports = router;
