/**
 * Authentication Routes
 * Handles user authentication endpoints
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate, registerValidation, loginValidation, emailValidation, changePasswordValidation } = require('../middleware/validator');
const { authLimiter, emailLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/register', authLimiter, registerValidation, validate, authController.register);
router.post('/login', authLimiter, loginValidation, validate, authController.login);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/forgot-password', emailLimiter, emailValidation, validate, authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Protected routes
router.get('/me', protect, authController.getMe);
router.post('/logout', protect, authController.logout);
router.post('/resend-verification', protect, emailLimiter, authController.resendVerification);
router.put('/change-password', protect, changePasswordValidation, validate, authController.changePassword);

module.exports = router;
