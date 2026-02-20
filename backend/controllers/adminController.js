/**
 * Admin Controller
 * Handles admin-specific operations
 */

const User = require('../models/User');
const Prediction = require('../models/Prediction');
const Notification = require('../models/Notification');
const Analytics = require('../models/Analytics');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
exports.getAdminDashboard = asyncHandler(async (req, res) => {
    // Get user statistics
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });

    // Get prediction statistics
    const totalPredictions = await Prediction.countDocuments();
    const mentalWellnessPredictions = await Prediction.countDocuments({ predictionType: 'mental_wellness' });
    const academicImpactPredictions = await Prediction.countDocuments({ predictionType: 'academic_impact' });

    // Get recent users (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // Get recent predictions (last 7 days)
    const recentPredictions = await Prediction.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // Get user growth over last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const userGrowth = await User.aggregate([
        {
            $match: { createdAt: { $gte: thirtyDaysAgo } }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Get prediction trends over last 30 days
    const predictionTrends = await Prediction.aggregate([
        {
            $match: { createdAt: { $gte: thirtyDaysAgo } }
        },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    type: "$predictionType"
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { "_id.date": 1 } }
    ]);

    // Calculate average scores
    const avgMentalWellness = await Prediction.aggregate([
        { $match: { predictionType: 'mental_wellness' } },
        { $group: { _id: null, avg: { $avg: '$result.prediction' } } }
    ]);

    const avgAcademicImpact = await Prediction.aggregate([
        { $match: { predictionType: 'academic_impact' } },
        { $group: { _id: null, avg: { $avg: '$result.prediction' } } }
    ]);

    // Get wellness trend data for charts (last 30 days)
    const wellnessTrend = await Prediction.aggregate([
        {
            $match: {
                predictionType: 'mental_wellness',
                createdAt: { $gte: thirtyDaysAgo }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                avgScore: { $avg: '$result.prediction' },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Get stress level distribution
    const stressDistribution = await Prediction.aggregate([
        {
            $match: { predictionType: 'stress_level' }
        },
        {
            $group: {
                _id: '$result.stressCategory',
                count: { $sum: 1 }
            }
        }
    ]);

    // Get hourly activity pattern
    const hourlyActivity = await Prediction.aggregate([
        {
            $project: {
                hour: { $hour: '$createdAt' }
            }
        },
        {
            $group: {
                _id: '$hour',
                predictions: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Get stress level predictions count
    const stressLevelPredictions = await Prediction.countDocuments({ predictionType: 'stress_level' });

    res.status(200).json({
        success: true,
        data: {
            users: {
                total: totalUsers,
                verified: verifiedUsers,
                active: activeUsers,
                admins: adminUsers,
                newLastWeek: newUsers,
                verificationRate: totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(1) + '%' : '0%'
            },
            predictions: {
                total: totalPredictions,
                mentalWellness: mentalWellnessPredictions,
                stressLevel: stressLevelPredictions,
                academicImpact: academicImpactPredictions,
                recentLastWeek: recentPredictions,
                avgMentalWellnessScore: avgMentalWellness[0]?.avg?.toFixed(1) || 'N/A',
                avgAcademicImpactScore: avgAcademicImpact[0]?.avg?.toFixed(1) || 'N/A'
            },
            trends: {
                userGrowth,
                predictions: predictionTrends
            },
            charts: {
                wellnessTrend: wellnessTrend.map(item => ({
                    date: item._id,
                    avgScore: item.avgScore ? parseFloat(item.avgScore.toFixed(1)) : 0,
                    count: item.count || 0
                })),
                stressDistribution: stressDistribution.map(item => ({
                    level: item._id || 'Unknown',
                    count: item.count || 0
                })),
                hourlyActivity: Array.from({ length: 24 }, (_, hour) => {
                    const activity = hourlyActivity.find(a => a._id === hour);
                    return {
                        hour,
                        users: 0, // Could be calculated separately if needed
                        predictions: activity?.predictions || 0
                    };
                })
            }
        }
    });
});

/**
 * @desc    Get all users with filters
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
exports.getAllUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search = '', role = '', verified = '', active = '' } = req.query;

    const query = {};
    
    // Search filter
    if (search) {
        query.$or = [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    // Role filter
    if (role && ['user', 'admin'].includes(role)) {
        query.role = role;
    }

    // Verification filter
    if (verified !== '') {
        query.isEmailVerified = verified === 'true';
    }

    // Active filter
    if (active !== '') {
        query.isActive = active === 'true';
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
 * @desc    Get single user details
 * @route   GET /api/admin/users/:id
 * @access  Private/Admin
 */
exports.getUserDetails = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    // Get user's prediction count
    const predictionCount = await Prediction.countDocuments({ user: user._id });

    // Get user's recent predictions
    const recentPredictions = await Prediction.find({ user: user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

    res.status(200).json({
        success: true,
        data: {
            user,
            statistics: {
                totalPredictions: predictionCount,
                recentPredictions
            }
        }
    });
});

/**
 * @desc    Update user role
 * @route   PUT /api/admin/users/:id/role
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

    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    // Prevent modifying system admin
    if (user.isSystemAdminAccount()) {
        return res.status(403).json({
            success: false,
            error: 'Cannot modify system administrator account'
        });
    }

    user.role = role;
    await user.save();

    // Remove password from response
    user.password = undefined;

    logger.info(`Role updated for user ${user.email} to ${role} by admin ${req.user.email}`);

    res.status(200).json({
        success: true,
        message: 'User role updated successfully',
        data: { user }
    });
});

/**
 * @desc    Activate/Deactivate user
 * @route   PUT /api/admin/users/:id/status
 * @access  Private/Admin
 */
exports.updateUserStatus = asyncHandler(async (req, res) => {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
        return res.status(400).json({
            success: false,
            error: 'isActive must be a boolean'
        });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    // Prevent deactivating system admin
    if (user.isSystemAdminAccount()) {
        return res.status(403).json({
            success: false,
            error: 'Cannot deactivate system administrator account'
        });
    }

    user.isActive = isActive;
    await user.save();

    // Remove password from response
    user.password = undefined;

    logger.info(`User ${user.email} ${isActive ? 'activated' : 'deactivated'} by admin ${req.user.email}`);

    res.status(200).json({
        success: true,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: { user }
    });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    // Don't allow deleting yourself
    if (user._id.toString() === req.user.id) {
        return res.status(400).json({
            success: false,
            error: 'You cannot delete your own account'
        });
    }

    // Prevent deleting system admin
    if (user.isSystemAdminAccount()) {
        return res.status(403).json({
            success: false,
            error: 'Cannot delete system administrator account'
        });
    }

    // Delete user's predictions
    await Prediction.deleteMany({ user: user._id });

    // Delete user's notifications
    await Notification.deleteMany({ user: user._id });

    // Delete user
    await user.deleteOne();

    logger.info(`User ${user.email} deleted by admin ${req.user.email}`);

    res.status(200).json({
        success: true,
        message: 'User and all associated data deleted successfully'
    });
});

/**
 * @desc    Get all predictions (admin view)
 * @route   GET /api/admin/predictions
 * @access  Private/Admin
 */
exports.getAllPredictions = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, type = '', userId = '' } = req.query;

    const query = {};
    
    if (type && ['mental_wellness', 'academic_impact'].includes(type)) {
        query.predictionType = type;
    }

    if (userId) {
        query.user = userId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const predictions = await Prediction.find(query)
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip);

    const total = await Prediction.countDocuments(query);

    res.status(200).json({
        success: true,
        data: {
            predictions,
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
 * @desc    Get system statistics
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
exports.getSystemStats = asyncHandler(async (req, res) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = {
        today: {
            users: await User.countDocuments({ createdAt: { $gte: today } }),
            predictions: await Prediction.countDocuments({ createdAt: { $gte: today } })
        },
        thisWeek: {
            users: await User.countDocuments({ createdAt: { $gte: thisWeek } }),
            predictions: await Prediction.countDocuments({ createdAt: { $gte: thisWeek } })
        },
        thisMonth: {
            users: await User.countDocuments({ createdAt: { $gte: thisMonth } }),
            predictions: await Prediction.countDocuments({ createdAt: { $gte: thisMonth } })
        },
        allTime: {
            users: await User.countDocuments(),
            predictions: await Prediction.countDocuments(),
            notifications: await Notification.countDocuments()
        }
    };

    res.status(200).json({
        success: true,
        data: stats
    });
});

/**
 * @desc    Broadcast notification to all users
 * @route   POST /api/admin/broadcast
 * @access  Private/Admin
 */
exports.broadcastNotification = asyncHandler(async (req, res) => {
    const { title, message, priority = 'medium' } = req.body;

    if (!title || !message) {
        return res.status(400).json({
            success: false,
            error: 'Title and message are required'
        });
    }

    // Get all active users
    const users = await User.find({ isActive: true }).select('_id');

    // Create notifications for all users
    const notifications = users.map(user => ({
        user: user._id,
        type: 'system_alert',
        title,
        message,
        priority,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }));

    await Notification.insertMany(notifications);

    logger.info(`Admin ${req.user.email} broadcasted notification to ${users.length} users`);

    res.status(200).json({
        success: true,
        message: `Notification sent to ${users.length} users`,
        data: {
            recipientCount: users.length
        }
    });
});

module.exports = exports;
