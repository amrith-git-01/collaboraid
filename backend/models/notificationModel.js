const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    // For user notifications: userId is set, organizationId is null
    // For organization notifications: organizationId is set, userId is null
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
        index: true,
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        default: null,
        index: true,
    },
    title: {
        type: String,
        required: [true, 'Notification must have a title'],
        trim: true,
    },
    message: {
        type: String,
        required: [true, 'Notification must have a message'],
        trim: true,
    },
    // For user notifications: simple boolean read status
    read: {
        type: Boolean,
        default: false,
    },
    // For organization notifications: array of user IDs who have read this notification
    readBy: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: [],
    },
    deleted: {
        type: Boolean,
        default: false,
    },
    action: {
        label: String,
        url: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
    versionKey: false,
});

// Validation: At least one of userId or organizationId must be set
notificationSchema.pre('validate', function (next) {
    if (!this.userId && !this.organizationId) {
        return next(new Error('Notification must have either userId or organizationId'));
    }
    if (this.userId && this.organizationId) {
        return next(new Error('Notification cannot have both userId and organizationId'));
    }
    next();
});

// Index for efficient queries
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, deleted: 1, createdAt: -1 });
notificationSchema.index({ organizationId: 1, deleted: 1, createdAt: -1 });
notificationSchema.index({ organizationId: 1, readBy: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
