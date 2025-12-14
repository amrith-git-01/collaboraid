const Notification = require('../models/notificationModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get all notifications for the current user (both user and organization notifications)
exports.getMyNotifications = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    // Get user's organizationId
    const user = await User.findById(userId).select('organizationId');
    const userOrganizationId = user?.organizationId || null;

    // Build query for user notifications
    const userNotificationsQuery = {
        userId: userId,
        deleted: false
    };

    // Build query for organization notifications
    const orgNotificationsQuery = userOrganizationId ? {
        organizationId: userOrganizationId,
        deleted: false
    } : null;

    // Fetch user notifications
    const userNotifications = await Notification.find(userNotificationsQuery)
        .sort({ createdAt: -1 })
        .limit(100);

    // Fetch organization notifications if user has an organization
    let orgNotifications = [];
    if (orgNotificationsQuery) {
        orgNotifications = await Notification.find(orgNotificationsQuery)
            .sort({ createdAt: -1 })
            .limit(100);
    }

    // Combine and sort all notifications by createdAt
    const allNotifications = [...userNotifications, ...orgNotifications]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 100);

    // Calculate unread count
    // For user notifications: check read field
    // For organization notifications: check if userId is in readBy array
    const unreadUserNotifications = userNotifications.filter(n => !n.read).length;
    const unreadOrgNotifications = orgNotifications.filter(n =>
        !n.readBy || !n.readBy.includes(userId)
    ).length;
    const unreadCount = unreadUserNotifications + unreadOrgNotifications;

    // Add isRead flag to organization notifications for easier frontend handling
    const notificationsWithReadStatus = allNotifications.map(notification => {
        const notificationObj = notification.toObject();

        // If it's an organization notification, check if current user has read it
        if (notification.organizationId) {
            notificationObj.isRead = notification.readBy && notification.readBy.includes(userId);
            notificationObj.isOrganizationNotification = true;
        } else {
            notificationObj.isRead = notification.read;
            notificationObj.isOrganizationNotification = false;
        }

        return notificationObj;
    });

    res.status(200).json({
        status: 'success',
        data: {
            notifications: notificationsWithReadStatus,
            unreadCount,
        },
    });
});

// Create a new notification (user or organization)
exports.createNotification = catchAsync(async (req, res, next) => {
    const { title, message, action, organizationId, targetUserId } = req.body;
    const currentUserId = req.user.id;

    if (!title || !message) {
        return next(new AppError('Title and message are required', 400));
    }

    // Determine notification type
    let notificationData = {
        title,
        message,
        action: action || undefined,
    };

    // If organizationId is provided, create organization notification
    if (organizationId) {
        // Verify user is a member of the organization
        const user = await User.findById(currentUserId).select('organizationId');
        if (!user || !user.organizationId || user.organizationId.toString() !== organizationId.toString()) {
            return next(new AppError('You can only create notifications for your organization', 403));
        }

        notificationData.organizationId = organizationId;
        notificationData.readBy = []; // Initialize empty readBy array
    }
    // If targetUserId is provided, create user notification for that user
    else if (targetUserId) {
        // For now, only allow users to create notifications for themselves
        // You can modify this to allow admins/creators to notify other users
        if (targetUserId.toString() !== currentUserId.toString()) {
            return next(new AppError('You can only create notifications for yourself', 403));
        }
        notificationData.userId = targetUserId;
    }
    // Default: create user notification for current user
    else {
        notificationData.userId = currentUserId;
    }

    const notification = await Notification.create(notificationData);

    res.status(201).json({
        status: 'success',
        data: {
            notification,
        },
    });
});

// Mark notification as read
exports.markAsRead = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({ _id: id, deleted: false });

    if (!notification) {
        return next(new AppError('Notification not found', 404));
    }

    // Check if user has access to this notification
    if (notification.userId) {
        // User notification - must belong to the user
        if (notification.userId.toString() !== userId.toString()) {
            return next(new AppError('You do not have access to this notification', 403));
        }
        notification.read = true;
    } else if (notification.organizationId) {
        // Organization notification - check if user is in the organization
        const user = await User.findById(userId).select('organizationId');
        if (!user || !user.organizationId || user.organizationId.toString() !== notification.organizationId.toString()) {
            return next(new AppError('You do not have access to this notification', 403));
        }
        // Add user to readBy array if not already present
        if (!notification.readBy || !notification.readBy.includes(userId)) {
            notification.readBy = notification.readBy || [];
            notification.readBy.push(userId);
        }
    }

    await notification.save();

    res.status(200).json({
        status: 'success',
        data: {
            notification,
        },
    });
});

// Mark all notifications as read
exports.markAllAsRead = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    // Get user's organizationId
    const user = await User.findById(userId).select('organizationId');
    const userOrganizationId = user?.organizationId || null;

    // Mark all user notifications as read
    await Notification.updateMany(
        { userId, read: false, deleted: false },
        { $set: { read: true } }
    );

    // Mark all organization notifications as read by adding user to readBy array
    if (userOrganizationId) {
        await Notification.updateMany(
            {
                organizationId: userOrganizationId,
                deleted: false,
                readBy: { $ne: userId } // Not already in readBy array
            },
            { $addToSet: { readBy: userId } } // Add userId to readBy array
        );
    }

    res.status(200).json({
        status: 'success',
        message: 'All notifications marked as read',
    });
});

// Delete a notification (soft delete)
// Note: For organization notifications, this only hides it for the current user
// To fully delete an org notification, the organization creator should do it
exports.deleteNotification = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({ _id: id, deleted: false });

    if (!notification) {
        return next(new AppError('Notification not found', 404));
    }

    // Check access
    if (notification.userId) {
        // User notification - must belong to the user
        if (notification.userId.toString() !== userId.toString()) {
            return next(new AppError('You do not have access to this notification', 403));
        }
    } else if (notification.organizationId) {
        // Organization notification - check if user is in the organization
        const user = await User.findById(userId).select('organizationId');
        if (!user || !user.organizationId || user.organizationId.toString() !== notification.organizationId.toString()) {
            return next(new AppError('You do not have access to this notification', 403));
        }
        // For org notifications, we could implement per-user deletion tracking
        // For now, we'll allow soft delete (it will be hidden from all users)
    }

    notification.deleted = true;
    await notification.save();

    res.status(200).json({
        status: 'success',
        message: 'Notification deleted',
    });
});

// Delete all notifications (soft delete)
exports.deleteAllNotifications = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    // Get user's organizationId
    const user = await User.findById(userId).select('organizationId');
    const userOrganizationId = user?.organizationId || null;

    // Delete all user notifications
    await Notification.updateMany(
        { userId, deleted: false },
        { $set: { deleted: true } }
    );

    // Delete all organization notifications (soft delete - hides from all users)
    if (userOrganizationId) {
        await Notification.updateMany(
            { organizationId: userOrganizationId, deleted: false },
            { $set: { deleted: true } }
        );
    }

    res.status(200).json({
        status: 'success',
        message: 'All notifications deleted',
    });
});
