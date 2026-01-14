/**
 * User Controller
 * Handles user profile and account management
 */

const User = require('../models/User');
const Prediction = require('../models/Prediction');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
exports.getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: {
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName,
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
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
exports.updateProfile = asyncHandler(async (req, res) => {
    const allowedUpdates = ['firstName', 'lastName', 'profile', 'preferences'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
        if (allowedUpdates.includes(key)) {
            if (key === 'profile' || key === 'preferences') {
                // Merge nested objects
                updates[key] = { ...req.user[key], ...req.body[key] };
            } else {
                updates[key] = req.body[key];
            }
        }
    });

    const user = await User.findByIdAndUpdate(
        req.user.id,
        updates,
        { new: true, runValidators: true }
    );

    logger.info(`Profile updated for user: ${user.email}`);

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
    });
});

/**
 * @desc    Get user dashboard data
 * @route   GET /api/users/dashboard
 * @access  Private
 */
exports.getDashboard = asyncHandler(async (req, res) => {
    // Get recent predictions
    const recentPredictions = await Prediction.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

    // Get statistics - safely handle if no predictions
    let stats = [];
    try {
        stats = await Prediction.getUserStats(req.user.id) || [];
    } catch (error) {
        logger.warn(`Error getting prediction stats: ${error.message}`);
        stats = [];
    }
    
    const totalPredictions = await Prediction.countDocuments({ user: req.user.id });

    // Get latest prediction for each type
    const latestMentalWellness = await Prediction.findOne({
        user: req.user.id,
        predictionType: 'mental_wellness'
    }).sort({ createdAt: -1 });

    const latestAcademicImpact = await Prediction.findOne({
        user: req.user.id,
        predictionType: 'academic_impact'
    }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        data: {
            user: {
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                email: req.user.email,
                isEmailVerified: req.user.isEmailVerified,
                memberSince: req.user.createdAt
            },
            stats: {
                totalPredictions,
                mentalWellness: Array.isArray(stats) ? (stats.find(s => s._id === 'mental_wellness') || { count: 0, averagePrediction: 0 }) : { count: 0, averagePrediction: 0 },
                academicImpact: Array.isArray(stats) ? (stats.find(s => s._id === 'academic_impact') || { count: 0, averagePrediction: 0 }) : { count: 0, averagePrediction: 0 }
            },
            latestPredictions: {
                mentalWellness: latestMentalWellness && latestMentalWellness.result ? {
                    score: latestMentalWellness.result.prediction,
                    interpretation: latestMentalWellness.result.interpretation,
                    date: latestMentalWellness.createdAt
                } : null,
                academicImpact: latestAcademicImpact && latestAcademicImpact.result ? {
                    score: latestAcademicImpact.result.prediction,
                    interpretation: latestAcademicImpact.result.interpretation,
                    date: latestAcademicImpact.createdAt
                } : null
            },
            recentActivity: recentPredictions.map(p => ({
                id: p._id,
                type: p.predictionType,
                score: p.result && p.result.prediction ? p.result.prediction : 'N/A',
                date: p.createdAt
            }))
        }
    });
});

/**
 * @desc    Delete user account
 * @route   DELETE /api/users/account
 * @access  Private
 */
exports.deleteAccount = asyncHandler(async (req, res) => {
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({
            success: false,
            error: 'Password is required to delete account'
        });
    }

    // Verify password
    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        return res.status(401).json({
            success: false,
            error: 'Invalid password'
        });
    }

    // Delete all user predictions
    await Prediction.deleteMany({ user: req.user.id });

    // Delete user
    await user.deleteOne();

    logger.info(`Account deleted for user: ${user.email}`);

    res.status(200).json({
        success: true,
        message: 'Account deleted successfully'
    });
});

/**
 * @desc    Deactivate user account
 * @route   PUT /api/users/deactivate
 * @access  Private
 */
exports.deactivateAccount = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    user.isActive = false;
    await user.save();

    logger.info(`Account deactivated for user: ${user.email}`);

    res.status(200).json({
        success: true,
        message: 'Account deactivated successfully'
    });
});

// Admin-only user management functions moved to adminController.js
// These routes are now handled by /api/admin/users
