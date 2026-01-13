/**
 * Notification Controller
 * Handles user notifications
 */

const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * @desc    Get all notifications for current user
 * @route   GET /api/notifications
 * @access  Private
 */
exports.getNotifications = asyncHandler(async (req, res) => {
    const { limit = 20, page = 1, isRead, type } = req.query;

    const query = { user: req.user.id };
    
    if (isRead !== undefined) {
        query.isRead = isRead === 'true';
    }
    
    if (type) {
        query.type = type;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .lean();

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.getUnreadCount(req.user.id);

    res.status(200).json({
        success: true,
        data: {
            notifications,
            unreadCount,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                limit: parseInt(limit)
            }
        }
    });
});

/**
 * @desc    Get unread notification count
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
exports.getUnreadCount = asyncHandler(async (req, res) => {
    const count = await Notification.getUnreadCount(req.user.id);

    res.status(200).json({
        success: true,
        data: { unreadCount: count }
    });
});

/**
 * @desc    Mark notifications as read
 * @route   PUT /api/notifications/mark-read
 * @access  Private
 */
exports.markAsRead = asyncHandler(async (req, res) => {
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
        return res.status(400).json({
            success: false,
            error: 'Please provide an array of notification IDs'
        });
    }

    await Notification.markAsRead(req.user.id, notificationIds);

    res.status(200).json({
        success: true,
        message: 'Notifications marked as read'
    });
});

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/mark-all-read
 * @access  Private
 */
exports.markAllAsRead = asyncHandler(async (req, res) => {
    const result = await Notification.markAllAsRead(req.user.id);

    res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
        data: { modifiedCount: result.modifiedCount }
    });
});

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
exports.deleteNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findOne({
        _id: req.params.id,
        user: req.user.id
    });

    if (!notification) {
        return res.status(404).json({
            success: false,
            error: 'Notification not found'
        });
    }

    await notification.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Notification deleted successfully'
    });
});

/**
 * @desc    Delete all read notifications
 * @route   DELETE /api/notifications/clear-read
 * @access  Private
 */
exports.clearReadNotifications = asyncHandler(async (req, res) => {
    const result = await Notification.deleteMany({
        user: req.user.id,
        isRead: true
    });

    res.status(200).json({
        success: true,
        message: 'Read notifications cleared',
        data: { deletedCount: result.deletedCount }
    });
});

/**
 * @desc    Create notification (System/Admin use)
 * @route   POST /api/notifications
 * @access  Private/Admin
 */
exports.createNotification = asyncHandler(async (req, res) => {
    const { userId, type, title, message, data, priority } = req.body;

    const notification = await Notification.createNotification(
        userId,
        type,
        title,
        message,
        data,
        priority
    );

    res.status(201).json({
        success: true,
        message: 'Notification created successfully',
        data: { notification }
    });
});

module.exports = exports;
