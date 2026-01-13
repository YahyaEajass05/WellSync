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

    // Get statistics
    const stats = await Prediction.getUserStats(req.user.id);
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
                mentalWellness: stats.find(s => s._id === 'mental_wellness') || { count: 0, averagePrediction: 0 },
                academicImpact: stats.find(s => s._id === 'academic_impact') || { count: 0, averagePrediction: 0 }
            },
            latestPredictions: {
                mentalWellness: latestMentalWellness ? {
                    score: latestMentalWellness.result.prediction,
                    interpretation: latestMentalWellness.result.interpretation,
                    date: latestMentalWellness.createdAt
                } : null,
                academicImpact: latestAcademicImpact ? {
                    score: latestAcademicImpact.result.prediction,
                    interpretation: latestAcademicImpact.result.interpretation,
                    date: latestAcademicImpact.createdAt
                } : null
            },
            recentActivity: recentPredictions.map(p => ({
                id: p._id,
                type: p.predictionType,
                score: p.result.prediction,
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

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
exports.getAllUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search = '', role = '' } = req.query;

    const query = {};
    
    if (search) {
        query.$or = [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    if (role) {
        query.role = role;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip);

    const total = await User.countDocuments(query);

    res.status(200).json({
        success: true,
        data: {
            users,
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
 * @desc    Update user role (Admin only)
 * @route   PUT /api/users/:id/role
 * @access  Private/Admin
 */
exports.updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid role. Must be user or admin'
        });
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true }
    );

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    logger.info(`Role updated for user ${user.email} to ${role} by admin ${req.user.email}`);

    res.status(200).json({
        success: true,
        message: 'User role updated successfully',
        data: { user }
    });
});
