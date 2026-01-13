/**
 * User Routes
 * Handles user profile and management endpoints
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { validate, updateProfileValidation } = require('../middleware/validator');

// All routes require authentication
router.use(protect);

// User profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', updateProfileValidation, validate, userController.updateProfile);
router.get('/dashboard', userController.getDashboard);

// Account management
router.delete('/account', userController.deleteAccount);
router.put('/deactivate', userController.deactivateAccount);

// Admin only routes
router.get('/', authorize('admin'), userController.getAllUsers);
router.put('/:id/role', authorize('admin'), userController.updateUserRole);

module.exports = router;
