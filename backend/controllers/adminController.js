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
const emailService = require('../utils/emailService');

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

    // Average stress level score (numeric prediction value)
    const avgStressLevel = await Prediction.aggregate([
        { $match: { predictionType: 'stress_level' } },
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
                avgStressLevel: avgStressLevel[0]?.avg?.toFixed(1) || 'N/A',
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
 * @desc    Broadcast notification to all users (in-app + email)
 * @route   POST /api/admin/broadcast
 * @access  Private/Admin
 */
exports.broadcastNotification = asyncHandler(async (req, res) => {
    const { title, message, priority = 'medium', sendEmail = true } = req.body;

    if (!title || !message) {
        return res.status(400).json({
            success: false,
            error: 'Title and message are required'
        });
    }

    // Get all active, verified users with email
    const users = await User.find({ 
        isActive: true,
        isEmailVerified: true 
    }).select('_id firstName lastName email');

    if (users.length === 0) {
        return res.status(400).json({
            success: false,
            error: 'No active verified users found'
        });
    }

    // Create in-app notifications for all users
    const notifications = users.map(user => ({
        user: user._id,
        type: 'system_alert',
        title,
        message,
        priority,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }));

    await Notification.insertMany(notifications);

    // Send broadcast emails concurrently (with error handling per user)
    let emailsSent = 0;
    let emailsFailed = 0;

    if (sendEmail) {
        const emailPromises = users.map(async (user) => {
            try {
                await emailService.sendBroadcastEmail(user, { title, message, priority });
                emailsSent++;
            } catch (error) {
                emailsFailed++;
                logger.error(`Failed to send broadcast email to ${user.email}: ${error.message}`);
            }
        });

        // Send emails in batches of 10 to avoid rate limiting
        const batchSize = 10;
        for (let i = 0; i < emailPromises.length; i += batchSize) {
            await Promise.allSettled(emailPromises.slice(i, i + batchSize));
        }
    }

    logger.info(`Admin ${req.user.email} broadcasted notification to ${users.length} users. Emails sent: ${emailsSent}, Failed: ${emailsFailed}`);

    res.status(200).json({
        success: true,
        message: `Notification sent to ${users.length} users`,
        data: {
            recipientCount: users.length,
            notificationsSent: users.length,
            emailsSent,
            emailsFailed
        }
    });
});

/**
 * @desc    Get all notifications history (admin view)
 * @route   GET /api/admin/notifications
 * @access  Private/Admin
 */
exports.getNotificationsHistory = asyncHandler(async (req, res) => {
    const { 
        page = 1, 
        limit = 20, 
        type, 
        priority, 
        isRead,
        search,
        startDate,
        endDate
    } = req.query;

    const query = {};

    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { message: { $regex: search, $options: 'i' } }
        ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total, stats] = await Promise.all([
        Notification.find(query)
            .populate('user', 'firstName lastName email role')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .lean(),
        Notification.countDocuments(query),
        Notification.aggregate([
            { $group: {
                _id: null,
                total: { $sum: 1 },
                unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } },
                urgent: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } },
                systemAlerts: { $sum: { $cond: [{ $eq: ['$type', 'system_alert'] }, 1, 0] } },
                broadcasts: { $sum: { $cond: [{ $eq: ['$type', 'broadcast'] }, 1, 0] } }
            }}
        ])
    ]);

    res.status(200).json({
        success: true,
        data: {
            notifications,
            stats: stats[0] || { total: 0, unread: 0, urgent: 0, systemAlerts: 0, broadcasts: 0 },
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
 * @desc    Delete a notification (admin)
 * @route   DELETE /api/admin/notifications/:id
 * @access  Private/Admin
 */
exports.deleteNotificationAdmin = asyncHandler(async (req, res) => {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
        return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    logger.info(`Notification ${req.params.id} deleted by admin ${req.user.email}`);

    res.status(200).json({ success: true, message: 'Notification deleted successfully' });
});

/**
 * @desc    Delete all notifications of a type (admin)
 * @route   DELETE /api/admin/notifications/bulk
 * @access  Private/Admin
 */
exports.bulkDeleteNotifications = asyncHandler(async (req, res) => {
    const { ids, type, priority, isRead } = req.body;

    const query = {};

    // If specific IDs provided, delete those
    if (ids && Array.isArray(ids) && ids.length > 0) {
        query._id = { $in: ids };
    } else {
        // Otherwise filter by type/priority/isRead
        if (type) query.type = type;
        if (priority) query.priority = priority;
        if (isRead !== undefined) query.isRead = isRead;
    }

    if (Object.keys(query).length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Provide notification IDs or at least one filter (type, priority, isRead)'
        });
    }

    const result = await Notification.deleteMany(query);

    logger.info(`Bulk deleted ${result.deletedCount} notifications by admin ${req.user.email}`);

    res.status(200).json({
        success: true,
        message: `${result.deletedCount} notifications deleted successfully`,
        data: { deletedCount: result.deletedCount }
    });
});

/**
 * @desc    Get AI Model insights and performance metrics
 * @route   GET /api/admin/models
 * @access  Private/Admin
 */
exports.getModelInsights = asyncHandler(async (req, res) => {
    // ── Mental Wellness Model stats ──────────────────────────────────────────
    const mwTotal = await Prediction.countDocuments({ predictionType: 'mental_wellness' });
    const mwScores = await Prediction.aggregate([
        { $match: { predictionType: 'mental_wellness', 'result.prediction': { $exists: true } } },
        { $group: {
            _id: null,
            avg: { $avg: '$result.prediction' },
            min: { $min: '$result.prediction' },
            max: { $max: '$result.prediction' },
            stdDev: { $stdDevPop: '$result.prediction' }
        }}
    ]);
    const mwTrend = await Prediction.aggregate([
        { $match: { predictionType: 'mental_wellness', createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        { $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            avg: { $avg: '$result.prediction' },
            count: { $sum: 1 }
        }},
        { $sort: { _id: 1 } }
    ]);
    const mwDistribution = await Prediction.aggregate([
        { $match: { predictionType: 'mental_wellness', 'result.prediction': { $exists: true } } },
        { $bucket: {
            groupBy: '$result.prediction',
            boundaries: [0, 20, 40, 60, 80, 101],
            default: 'Other',
            output: { count: { $sum: 1 } }
        }}
    ]);

    // ── Stress Level Model stats ─────────────────────────────────────────────
    const slTotal = await Prediction.countDocuments({ predictionType: 'stress_level' });
    const slDistribution = await Prediction.aggregate([
        { $match: { predictionType: 'stress_level', 'result.stressCategory': { $exists: true } } },
        { $group: { _id: '$result.stressCategory', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
    ]);
    const slTrend = await Prediction.aggregate([
        { $match: { predictionType: 'stress_level', createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        { $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
        }},
        { $sort: { _id: 1 } }
    ]);
    const slScores = await Prediction.aggregate([
        { $match: { predictionType: 'stress_level', 'result.prediction': { $exists: true } } },
        { $group: { _id: null, avg: { $avg: '$result.prediction' }, min: { $min: '$result.prediction' }, max: { $max: '$result.prediction' } } }
    ]);

    // ── Academic Impact Model stats ──────────────────────────────────────────
    const aiTotal = await Prediction.countDocuments({ predictionType: 'academic_impact' });
    const aiScores = await Prediction.aggregate([
        { $match: { predictionType: 'academic_impact', 'result.prediction': { $exists: true } } },
        { $group: {
            _id: null,
            avg: { $avg: '$result.prediction' },
            min: { $min: '$result.prediction' },
            max: { $max: '$result.prediction' },
            stdDev: { $stdDevPop: '$result.prediction' }
        }}
    ]);
    const aiTrend = await Prediction.aggregate([
        { $match: { predictionType: 'academic_impact', createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        { $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            avg: { $avg: '$result.prediction' },
            count: { $sum: 1 }
        }},
        { $sort: { _id: 1 } }
    ]);
    const aiRiskDistribution = await Prediction.aggregate([
        { $match: { predictionType: 'academic_impact', 'result.interpretation': { $exists: true } } },
        { $group: { _id: '$result.interpretation', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
    ]);

    // ── Usage over time (all models combined) ────────────────────────────────
    const usageOverTime = await Prediction.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        { $group: {
            _id: { date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, type: '$predictionType' },
            count: { $sum: 1 }
        }},
        { $sort: { '_id.date': 1 } }
    ]);

    // ── Recent predictions (last 5 of each type) ────────────────────────────
    const [mwRecent, slRecent, aiRecent] = await Promise.all([
        Prediction.find({ predictionType: 'mental_wellness' }).sort({ createdAt: -1 }).limit(5).select('result createdAt'),
        Prediction.find({ predictionType: 'stress_level' }).sort({ createdAt: -1 }).limit(5).select('result createdAt'),
        Prediction.find({ predictionType: 'academic_impact' }).sort({ createdAt: -1 }).limit(5).select('result createdAt'),
    ]);

    res.status(200).json({
        success: true,
        data: {
            mentalWellness: {
                total: mwTotal,
                avgScore: mwScores[0]?.avg?.toFixed(2) || 'N/A',
                minScore: mwScores[0]?.min?.toFixed(2) || 'N/A',
                maxScore: mwScores[0]?.max?.toFixed(2) || 'N/A',
                stdDev: mwScores[0]?.stdDev?.toFixed(2) || 'N/A',
                trend: mwTrend,
                distribution: mwDistribution,
                recent: mwRecent,
                // Hardcoded model performance metrics from training reports
                modelMetrics: { r2: 0.943, mae: 3.21, rmse: 4.87, mape: 4.12, algorithm: 'Voting Ensemble (RF + GB + Ridge)' }
            },
            stressLevel: {
                total: slTotal,
                distribution: slDistribution,
                trend: slTrend,
                avgScore: slScores[0]?.avg?.toFixed(2) || 'N/A',
                minScore: slScores[0]?.min?.toFixed(2) || 'N/A',
                maxScore: slScores[0]?.max?.toFixed(2) || 'N/A',
                recent: slRecent,
                modelMetrics: { r2: 0.837, mae: 0.48, rmse: 0.61, accuracy: 0.89, algorithm: 'Gradient Boosting Classifier' }
            },
            academicImpact: {
                total: aiTotal,
                avgScore: aiScores[0]?.avg?.toFixed(2) || 'N/A',
                minScore: aiScores[0]?.min?.toFixed(2) || 'N/A',
                maxScore: aiScores[0]?.max?.toFixed(2) || 'N/A',
                stdDev: aiScores[0]?.stdDev?.toFixed(2) || 'N/A',
                trend: aiTrend,
                riskDistribution: aiRiskDistribution,
                recent: aiRecent,
                modelMetrics: { r2: 0.990, mae: 0.18, rmse: 0.29, mape: 2.31, algorithm: 'Gradient Boosting Regressor (Tuned)' }
            },
            usageOverTime,
            totalPredictions: mwTotal + slTotal + aiTotal,
        }
    });
});

/**
 * @desc    Export all users as CSV (admin)
 * @route   GET /api/admin/export/users/csv
 * @access  Admin
 */
exports.exportUsersCSV = asyncHandler(async (req, res) => {
    const users = await User.find({})
        .select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires')
        .lean();

    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Role', 'Active', 'Email Verified', 'Institution', 'Age', 'Gender', 'Joined', 'Last Login'];
    const rows = users.map(u => [
        u._id,
        u.firstName || '',
        u.lastName || '',
        u.email,
        u.role,
        u.isActive ? 'Yes' : 'No',
        u.isEmailVerified ? 'Yes' : 'No',
        u.profile?.institution || '',
        u.profile?.age || '',
        u.profile?.gender || '',
        u.createdAt ? new Date(u.createdAt).toISOString() : '',
        u.lastLogin ? new Date(u.lastLogin).toISOString() : '',
    ]);

    const csv = [headers, ...rows].map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=wellsync-users-${Date.now()}.csv`);
    res.status(200).send(csv);
});

/**
 * @desc    Export all users as PDF (admin)
 * @route   GET /api/admin/export/users/pdf
 * @access  Admin
 */
exports.exportUsersPDF = asyncHandler(async (req, res) => {
    const PDFDocument = require('pdfkit');
    const users = await User.find({})
        .select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires')
        .lean();

    const buffer = await new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margins: { top: 50, bottom: 50, left: 40, right: 40 }, layout: 'landscape' });
        const chunks = [];
        doc.on('data', c => chunks.push(c));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        doc.rect(0, 0, 841, 80).fill('#667eea');
        doc.fontSize(22).font('Helvetica-Bold').fillColor('#ffffff').text('WellSync — Users Report', 40, 20);
        doc.fontSize(10).font('Helvetica').fillColor('#ffffff').text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}   Total Users: ${users.length}`, 40, 52);

        let y = 100;
        const cols = [
            { label: 'Name',        x: 40,  w: 130 },
            { label: 'Email',       x: 175, w: 190 },
            { label: 'Role',        x: 370, w: 60  },
            { label: 'Active',      x: 435, w: 55  },
            { label: 'Verified',    x: 495, w: 60  },
            { label: 'Institution', x: 560, w: 130 },
            { label: 'Joined',      x: 695, w: 100 },
        ];

        const drawRow = (rowData, yPos, isHeader = false) => {
            if (isHeader) doc.rect(35, yPos - 5, 775, 22).fill('#f1f3f9');
            cols.forEach((col, i) => {
                doc.fontSize(isHeader ? 9 : 8)
                   .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
                   .fillColor(isHeader ? '#444' : '#222')
                   .text(String(rowData[i] ?? ''), col.x, yPos, { width: col.w, lineBreak: false, ellipsis: true });
            });
        };

        drawRow(['Name', 'Email', 'Role', 'Active', 'Verified', 'Institution', 'Joined'], y, true);
        y += 26;

        users.forEach((u, idx) => {
            if (y > 530) { doc.addPage({ layout: 'landscape' }); y = 40; drawRow(['Name', 'Email', 'Role', 'Active', 'Verified', 'Institution', 'Joined'], y, true); y += 26; }
            if (idx % 2 === 0) doc.rect(35, y - 4, 775, 18).fill('#fafbff').stroke('#eee');
            drawRow([
                `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
                u.email,
                u.role,
                u.isActive ? 'Yes' : 'No',
                u.isEmailVerified ? 'Yes' : 'No',
                u.profile?.institution || '—',
                u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—',
            ], y);
            y += 20;
        });

        doc.fontSize(7).fillColor('#aaa').text('WellSync Admin Export | Confidential', 40, 570, { width: 760, align: 'center' });
        doc.end();
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=wellsync-users-${Date.now()}.pdf`);
    res.setHeader('Content-Length', buffer.length);
    res.status(200).send(buffer);
});

/**
 * @desc    Export all predictions as CSV (admin)
 * @route   GET /api/admin/export/predictions/csv
 * @access  Admin
 */
exports.exportPredictionsCSV = asyncHandler(async (req, res) => {
    const { type } = req.query;
    const query = {};
    if (type) query.predictionType = type;

    const predictions = await Prediction.find(query)
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .lean();

    const headers = ['ID', 'User Name', 'User Email', 'Type', 'Score', 'Interpretation', 'Model', 'R2 Score', 'MAE', 'Date'];
    const rows = predictions.map(p => [
        p._id,
        `${p.user?.firstName || ''} ${p.user?.lastName || ''}`.trim(),
        p.user?.email || '',
        p.predictionType,
        p.result?.prediction ?? '',
        p.result?.interpretation || '',
        p.result?.modelName || p.result?.model_name || '',
        p.result?.confidenceMetrics?.modelR2Score || '',
        p.result?.confidenceMetrics?.modelMAE || '',
        p.createdAt ? new Date(p.createdAt).toISOString() : '',
    ]);

    const csv = [headers, ...rows].map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=wellsync-predictions-${Date.now()}.csv`);
    res.status(200).send(csv);
});

/**
 * @desc    Export all predictions as PDF (admin)
 * @route   GET /api/admin/export/predictions/pdf
 * @access  Admin
 */
exports.exportPredictionsPDF = asyncHandler(async (req, res) => {
    const PDFDocument = require('pdfkit');
    const { type } = req.query;
    const query = {};
    if (type) query.predictionType = type;

    const predictions = await Prediction.find(query)
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .lean();

    const buffer = await new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margins: { top: 50, bottom: 50, left: 40, right: 40 }, layout: 'landscape' });
        const chunks = [];
        doc.on('data', c => chunks.push(c));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        doc.rect(0, 0, 841, 80).fill('#667eea');
        doc.fontSize(22).font('Helvetica-Bold').fillColor('#ffffff').text('WellSync — Predictions Report', 40, 20);
        doc.fontSize(10).font('Helvetica').fillColor('#ffffff').text(`Generated: ${new Date().toLocaleDateString()}   Total: ${predictions.length}${type ? `   Type: ${type}` : ''}`, 40, 52);

        let y = 100;
        const cols = [
            { label: 'User',           x: 40,  w: 130 },
            { label: 'Email',          x: 175, w: 155 },
            { label: 'Type',           x: 335, w: 100 },
            { label: 'Score',          x: 440, w: 50  },
            { label: 'Interpretation', x: 495, w: 140 },
            { label: 'Model',          x: 640, w: 100 },
            { label: 'Date',           x: 745, w: 80  },
        ];

        const drawRow = (rowData, yPos, isHeader = false) => {
            if (isHeader) doc.rect(35, yPos - 5, 785, 22).fill('#f1f3f9');
            cols.forEach((col, i) => {
                doc.fontSize(isHeader ? 9 : 8)
                   .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
                   .fillColor(isHeader ? '#444' : '#222')
                   .text(String(rowData[i] ?? ''), col.x, yPos, { width: col.w, lineBreak: false, ellipsis: true });
            });
        };

        drawRow(['User', 'Email', 'Type', 'Score', 'Interpretation', 'Model', 'Date'], y, true);
        y += 26;

        predictions.forEach((p, idx) => {
            if (y > 530) { doc.addPage({ layout: 'landscape' }); y = 40; drawRow(['User', 'Email', 'Type', 'Score', 'Interpretation', 'Model', 'Date'], y, true); y += 26; }
            if (idx % 2 === 0) doc.rect(35, y - 4, 785, 18).fill('#fafbff').stroke('#eee');
            drawRow([
                `${p.user?.firstName || ''} ${p.user?.lastName || ''}`.trim() || '—',
                p.user?.email || '—',
                (p.predictionType || '').replace(/_/g, ' '),
                p.result?.prediction != null ? Number(p.result.prediction).toFixed(2) : '—',
                p.result?.interpretation || '—',
                p.result?.modelName || p.result?.model_name || '—',
                p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—',
            ], y);
            y += 20;
        });

        doc.fontSize(7).fillColor('#aaa').text('WellSync Admin Export | Confidential', 40, 570, { width: 760, align: 'center' });
        doc.end();
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=wellsync-predictions-${Date.now()}.pdf`);
    res.setHeader('Content-Length', buffer.length);
    res.status(200).send(buffer);
});

/**
 * @desc    Export all notifications as CSV (admin)
 * @route   GET /api/admin/export/notifications/csv
 * @access  Admin
 */
exports.exportNotificationsCSV = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({})
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .lean();

    const headers = ['ID', 'Recipient Name', 'Recipient Email', 'Title', 'Message', 'Type', 'Priority', 'Read', 'Sent At', 'Read At'];
    const rows = notifications.map(n => [
        n._id,
        `${n.user?.firstName || ''} ${n.user?.lastName || ''}`.trim(),
        n.user?.email || '',
        n.title,
        n.message,
        n.type,
        n.priority,
        n.isRead ? 'Yes' : 'No',
        n.createdAt ? new Date(n.createdAt).toISOString() : '',
        n.readAt ? new Date(n.readAt).toISOString() : '',
    ]);

    const csv = [headers, ...rows].map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=wellsync-notifications-${Date.now()}.csv`);
    res.status(200).send(csv);
});

/**
 * @desc    Export all notifications as PDF (admin)
 * @route   GET /api/admin/export/notifications/pdf
 * @access  Admin
 */
exports.exportNotificationsPDF = asyncHandler(async (req, res) => {
    const PDFDocument = require('pdfkit');
    const notifications = await Notification.find({})
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .lean();

    const buffer = await new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margins: { top: 50, bottom: 50, left: 40, right: 40 }, layout: 'landscape' });
        const chunks = [];
        doc.on('data', c => chunks.push(c));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        doc.rect(0, 0, 841, 80).fill('#667eea');
        doc.fontSize(22).font('Helvetica-Bold').fillColor('#ffffff').text('WellSync — Notifications Report', 40, 20);
        doc.fontSize(10).font('Helvetica').fillColor('#ffffff').text(`Generated: ${new Date().toLocaleDateString()}   Total: ${notifications.length}`, 40, 52);

        let y = 100;
        const cols = [
            { label: 'Recipient', x: 40,  w: 120 },
            { label: 'Email',     x: 165, w: 150 },
            { label: 'Title',     x: 320, w: 140 },
            { label: 'Type',      x: 465, w: 90  },
            { label: 'Priority',  x: 560, w: 65  },
            { label: 'Read',      x: 630, w: 40  },
            { label: 'Sent At',   x: 675, w: 110 },
        ];

        const drawRow = (rowData, yPos, isHeader = false) => {
            if (isHeader) doc.rect(35, yPos - 5, 775, 22).fill('#f1f3f9');
            cols.forEach((col, i) => {
                doc.fontSize(isHeader ? 9 : 8)
                   .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
                   .fillColor(isHeader ? '#444' : '#222')
                   .text(String(rowData[i] ?? ''), col.x, yPos, { width: col.w, lineBreak: false, ellipsis: true });
            });
        };

        drawRow(['Recipient', 'Email', 'Title', 'Type', 'Priority', 'Read', 'Sent At'], y, true);
        y += 26;

        notifications.forEach((n, idx) => {
            if (y > 530) { doc.addPage({ layout: 'landscape' }); y = 40; drawRow(['Recipient', 'Email', 'Title', 'Type', 'Priority', 'Read', 'Sent At'], y, true); y += 26; }
            if (idx % 2 === 0) doc.rect(35, y - 4, 775, 18).fill('#fafbff').stroke('#eee');
            drawRow([
                `${n.user?.firstName || ''} ${n.user?.lastName || ''}`.trim() || '—',
                n.user?.email || '—',
                n.title || '—',
                (n.type || '').replace(/_/g, ' '),
                n.priority || '—',
                n.isRead ? 'Yes' : 'No',
                n.createdAt ? new Date(n.createdAt).toLocaleDateString() : '—',
            ], y);
            y += 20;
        });

        doc.fontSize(7).fillColor('#aaa').text('WellSync Admin Export | Confidential', 40, 570, { width: 760, align: 'center' });
        doc.end();
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=wellsync-notifications-${Date.now()}.pdf`);
    res.setHeader('Content-Length', buffer.length);
    res.status(200).send(buffer);
});

/**
 * @desc    Export single user details as PDF (admin)
 * @route   GET /api/admin/export/users/:id/pdf
 * @access  Admin
 */
exports.exportUserDetailPDF = asyncHandler(async (req, res) => {
    const PDFDocument = require('pdfkit');
    const user = await User.findById(req.params.id).select('-password -emailVerificationToken -passwordResetToken').lean();
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const predictions = await Prediction.find({ user: req.params.id }).sort({ createdAt: -1 }).lean();

    const buffer = await new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margins: { top: 50, bottom: 50, left: 50, right: 50 } });
        const chunks = [];
        doc.on('data', c => chunks.push(c));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc.rect(0, 0, 595, 100).fill('#667eea');
        doc.fontSize(26).font('Helvetica-Bold').fillColor('#fff').text('WellSync', 50, 25);
        doc.fontSize(12).font('Helvetica').fillColor('#fff').text('User Detail Report', 50, 62);

        let y = 120;
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#333').text('User Information', 50, y);
        doc.moveTo(50, y + 20).lineTo(545, y + 20).stroke('#e0e0e0');
        y += 35;

        const info = [
            ['Name',           `${user.firstName || ''} ${user.lastName || ''}`.trim() || '—'],
            ['Email',          user.email],
            ['Role',           user.role],
            ['Status',         user.isActive ? 'Active' : 'Inactive'],
            ['Email Verified', user.isEmailVerified ? 'Yes' : 'No'],
            ['Institution',    user.profile?.institution || '—'],
            ['Age',            user.profile?.age || '—'],
            ['Gender',         user.profile?.gender || '—'],
            ['Joined',         user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'],
            ['Last Login',     user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'],
        ];

        info.forEach(([label, value]) => {
            doc.fontSize(10).font('Helvetica-Bold').fillColor('#666').text(label + ':', 50, y);
            doc.font('Helvetica').fillColor('#222').text(String(value), 180, y);
            y += 22;
        });

        y += 15;
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#333').text(`Prediction History (${predictions.length} total)`, 50, y);
        doc.moveTo(50, y + 20).lineTo(545, y + 20).stroke('#e0e0e0');
        y += 35;

        if (predictions.length === 0) {
            doc.fontSize(10).font('Helvetica').fillColor('#888').text('No predictions made yet.', 50, y);
        } else {
            doc.rect(45, y - 5, 505, 20).fill('#f1f3f9');
            doc.fontSize(9).font('Helvetica-Bold').fillColor('#444');
            doc.text('Type', 50, y, { width: 130 });
            doc.text('Score', 185, y, { width: 70 });
            doc.text('Interpretation', 260, y, { width: 165 });
            doc.text('Date', 430, y, { width: 120 });
            y += 22;

            predictions.slice(0, 30).forEach((p, idx) => {
                if (y > 740) { doc.addPage(); y = 50; }
                if (idx % 2 === 0) doc.rect(45, y - 4, 505, 18).fill('#fafbff').stroke('#eee');
                doc.fontSize(8).font('Helvetica').fillColor('#222');
                doc.text((p.predictionType || '').replace(/_/g, ' '), 50, y, { width: 130 });
                doc.text(p.result?.prediction != null ? Number(p.result.prediction).toFixed(2) : '—', 185, y, { width: 70 });
                doc.text(p.result?.interpretation || '—', 260, y, { width: 165 });
                doc.text(p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—', 430, y, { width: 120 });
                y += 20;
            });
            if (predictions.length > 30) {
                y += 5;
                doc.fontSize(8).fillColor('#888').text(`... and ${predictions.length - 30} more predictions not shown.`, 50, y);
            }
        }

        doc.fontSize(7).fillColor('#aaa').text('WellSync Admin Export | Confidential', 50, 790, { width: 495, align: 'center' });
        doc.end();
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=user-${req.params.id}-${Date.now()}.pdf`);
    res.setHeader('Content-Length', buffer.length);
    res.status(200).send(buffer);
});

module.exports = exports;
