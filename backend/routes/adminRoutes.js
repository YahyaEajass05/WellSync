/**
 * Admin Routes
 * Handles admin-specific endpoints
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validator');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', adminController.getAdminDashboard);
router.get('/stats', adminController.getSystemStats);

// User Management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', 
    param('id').isMongoId().withMessage('Invalid user ID'),
    validate,
    adminController.getUserDetails
);

router.put('/users/:id/role',
    param('id').isMongoId().withMessage('Invalid user ID'),
    body('role').isIn(['user', 'admin']).withMessage('Role must be user or admin'),
    validate,
    adminController.updateUserRole
);

router.put('/users/:id/status',
    param('id').isMongoId().withMessage('Invalid user ID'),
    body('isActive').isBoolean().withMessage('isActive must be true or false'),
    validate,
    adminController.updateUserStatus
);

router.delete('/users/:id',
    param('id').isMongoId().withMessage('Invalid user ID'),
    validate,
    adminController.deleteUser
);

// Prediction Management
router.get('/predictions', adminController.getAllPredictions);

// Broadcast Notification
router.post('/broadcast',
    body('title').notEmpty().withMessage('Title is required'),
    body('message').notEmpty().withMessage('Message is required'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    validate,
    adminController.broadcastNotification
);

module.exports = router;
