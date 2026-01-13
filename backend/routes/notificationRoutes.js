/**
 * Notification Routes
 * Handles notification endpoints
 */

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validator');

// All routes require authentication
router.use(protect);

// Get notifications
router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);

// Mark as read
router.put('/mark-read', 
    body('notificationIds').isArray().withMessage('notificationIds must be an array'),
    validate,
    notificationController.markAsRead
);

router.put('/mark-all-read', notificationController.markAllAsRead);

// Delete notifications
router.delete('/clear-read', notificationController.clearReadNotifications);
router.delete('/:id', 
    param('id').isMongoId().withMessage('Invalid notification ID'),
    validate,
    notificationController.deleteNotification
);

// Admin route to create notification
router.post('/',
    authorize('admin'),
    body('userId').notEmpty().withMessage('User ID is required'),
    body('type').isIn([
        'prediction_completed',
        'email_verified',
        'password_changed',
        'account_updated',
        'weekly_summary',
        'milestone_reached',
        'system_alert'
    ]).withMessage('Invalid notification type'),
    body('title').notEmpty().withMessage('Title is required'),
    body('message').notEmpty().withMessage('Message is required'),
    validate,
    notificationController.createNotification
);

module.exports = router;
