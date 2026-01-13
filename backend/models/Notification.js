/**
 * Notification Model
 * Stores user notifications
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: [
            'prediction_completed',
            'email_verified',
            'password_changed',
            'account_updated',
            'weekly_summary',
            'milestone_reached',
            'system_alert'
        ],
        required: true
    },
    title: {
        type: String,
        required: true,
        maxlength: 200
    },
    message: {
        type: String,
        required: true,
        maxlength: 1000
    },
    data: {
        type: mongoose.Schema.Types.Mixed
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    expiresAt: {
        type: Date,
        index: true
    }
}, {
    timestamps: true
});

// Compound indexes for efficient queries
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to create notification
notificationSchema.statics.createNotification = async function(userId, type, title, message, data = {}, priority = 'medium') {
    return await this.create({
        user: userId,
        type,
        title,
        message,
        data,
        priority,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });
};

// Static method to mark as read
notificationSchema.statics.markAsRead = async function(userId, notificationIds) {
    return await this.updateMany(
        { _id: { $in: notificationIds }, user: userId },
        { $set: { isRead: true } }
    );
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = async function(userId) {
    return await this.updateMany(
        { user: userId, isRead: false },
        { $set: { isRead: true } }
    );
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
    return await this.countDocuments({ user: userId, isRead: false });
};

// Static method to delete old notifications
notificationSchema.statics.deleteOldNotifications = async function(days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return await this.deleteMany({
        createdAt: { $lt: cutoffDate },
        isRead: true
    });
};

module.exports = mongoose.model('Notification', notificationSchema);
