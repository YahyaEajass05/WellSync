/**
 * Authentication Controller
 * Handles user registration, login, and authentication
 */

const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const emailService = require('../utils/emailService');
const notificationService = require('../utils/notificationService');
const logger = require('../utils/logger');

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({
            success: false,
            error: 'User already exists',
            message: 'A user with this email already exists'
        });
    }

    // Create user
    const user = await User.create({
        firstName,
        lastName,
        email,
        password
    });

    // Generate verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Send welcome email
    try {
        await emailService.sendWelcomeEmail(user, verificationToken);
    } catch (error) {
        logger.error(`Failed to send welcome email: ${error.message}`);
        // Don't fail registration if email fails
    }

    // Generate auth token
    const token = user.generateAuthToken();

    logger.info(`New user registered: ${user.email}`);

    res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        data: {
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                isEmailVerified: user.isEmailVerified
            },
            token
        }
    });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return res.status(401).json({
            success: false,
            error: 'Invalid credentials',
            message: 'Invalid email or password'
        });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(401).json({
            success: false,
            error: 'Invalid credentials',
            message: 'Invalid email or password'
        });
    }

    // Check if account is active
    if (!user.isActive) {
        return res.status(401).json({
            success: false,
            error: 'Account deactivated',
            message: 'Your account has been deactivated. Please contact support.'
        });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate tokens
    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    logger.info(`User logged in: ${user.email}`);

    res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
                lastLogin: user.lastLogin
            },
            token,
            refreshToken
        }
    });
});

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: {
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
                profile: user.profile,
                preferences: user.preferences,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            }
        }
    });
});

/**
 * @desc    Verify email
 * @route   GET /api/auth/verify-email/:token
 * @access  Public
 */
exports.verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.params;

    // Find user with valid token
    const user = await User.findOne({
        emailVerificationToken: token,
        emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({
            success: false,
            error: 'Invalid or expired token',
            message: 'Email verification link is invalid or has expired'
        });
    }

    // Update user
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    // Send activation confirmation email
    try {
        await emailService.sendAccountActivationEmail(user);
    } catch (error) {
        logger.error(`Failed to send activation email: ${error.message}`);
    }

    // Send notification
    try {
        await notificationService.notifyEmailVerified(user._id);
    } catch (error) {
        logger.error(`Failed to send email verification notification: ${error.message}`);
    }

    logger.info(`Email verified for user: ${user.email}`);

    res.status(200).json({
        success: true,
        message: 'Email verified successfully! You can now access all features.'
    });
});

/**
 * @desc    Resend verification email
 * @route   POST /api/auth/resend-verification
 * @access  Private
 */
exports.resendVerification = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user.isEmailVerified) {
        return res.status(400).json({
            success: false,
            error: 'Email already verified',
            message: 'Your email is already verified'
        });
    }

    // Generate new verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Send verification email
    await emailService.sendVerificationEmail(user, verificationToken);

    res.status(200).json({
        success: true,
        message: 'Verification email sent successfully'
    });
});

/**
 * @desc    Request password reset
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found',
            message: 'No user found with this email address'
        });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Send reset email
    try {
        await emailService.sendPasswordResetEmail(user, resetToken);
        
        res.status(200).json({
            success: true,
            message: 'Password reset email sent successfully'
        });
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpire = undefined;
        await user.save();
        
        throw new Error('Email could not be sent');
    }
});

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
exports.resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    // Find user with valid token
    const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpire: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({
            success: false,
            error: 'Invalid or expired token',
            message: 'Password reset link is invalid or has expired'
        });
    }

    // Set new password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    logger.info(`Password reset for user: ${user.email}`);

    // Generate new token
    const authToken = user.generateAuthToken();

    res.status(200).json({
        success: true,
        message: 'Password reset successful',
        data: { token: authToken }
    });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
exports.changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        return res.status(401).json({
            success: false,
            error: 'Invalid password',
            message: 'Current password is incorrect'
        });
    }

    // Set new password
    user.password = newPassword;
    await user.save();

    // Send notification
    try {
        await notificationService.notifyPasswordChanged(user._id);
    } catch (error) {
        logger.error(`Failed to send password change notification: ${error.message}`);
    }

    logger.info(`Password changed for user: ${user.email}`);

    res.status(200).json({
        success: true,
        message: 'Password changed successfully'
    });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = asyncHandler(async (req, res) => {
    // In a JWT system, logout is typically handled client-side
    // But we can log the event
    logger.info(`User logged out: ${req.user.email}`);

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
});
