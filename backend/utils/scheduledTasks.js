/**
 * Scheduled Tasks
 * Background jobs and cron tasks
 */

const Notification = require('../models/Notification');
const Analytics = require('../models/Analytics');
const Prediction = require('../models/Prediction');
const User = require('../models/User');
const notificationService = require('./notificationService');
const logger = require('./logger');

/**
 * Clean up old notifications (run daily)
 */
exports.cleanupOldNotifications = async () => {
    try {
        const result = await Notification.deleteOldNotifications(30);
        logger.info(`Cleaned up old notifications: ${result.deletedCount} removed`);
        return result;
    } catch (error) {
        logger.error(`Failed to cleanup old notifications: ${error.message}`);
        throw error;
    }
};

/**
 * Generate weekly summaries for all active users (run weekly)
 */
exports.generateWeeklySummaries = async () => {
    try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // Get users with predictions in the last week
        const predictions = await Prediction.find({
            createdAt: { $gte: oneWeekAgo }
        }).populate('user');

        // Group by user
        const userPredictions = {};
        predictions.forEach(p => {
            if (!userPredictions[p.user._id]) {
                userPredictions[p.user._id] = {
                    user: p.user,
                    predictions: []
                };
            }
            userPredictions[p.user._id].predictions.push(p);
        });

        // Send weekly summary to each user
        for (const userId in userPredictions) {
            const data = userPredictions[userId];
            const mentalWellness = data.predictions.filter(p => p.predictionType === 'mental_wellness');
            const academicImpact = data.predictions.filter(p => p.predictionType === 'academic_impact');

            const stats = {
                totalPredictions: data.predictions.length,
                mentalWellnessAvg: mentalWellness.length > 0
                    ? mentalWellness.reduce((sum, p) => sum + p.result.prediction, 0) / mentalWellness.length
                    : null,
                academicImpactAvg: academicImpact.length > 0
                    ? academicImpact.reduce((sum, p) => sum + p.result.prediction, 0) / academicImpact.length
                    : null
            };

            try {
                await notificationService.notifyWeeklySummary(userId, stats);
            } catch (error) {
                logger.error(`Failed to send weekly summary to user ${userId}: ${error.message}`);
            }
        }

        logger.info(`Weekly summaries generated for ${Object.keys(userPredictions).length} users`);
    } catch (error) {
        logger.error(`Failed to generate weekly summaries: ${error.message}`);
        throw error;
    }
};

/**
 * Generate analytics for all users (run daily)
 */
exports.generateDailyAnalytics = async () => {
    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        // Get all users with predictions yesterday
        const predictions = await Prediction.find({
            createdAt: {
                $gte: yesterday,
                $lt: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000)
            }
        });

        // Group by user
        const userGroups = predictions.reduce((acc, p) => {
            if (!acc[p.user]) acc[p.user] = [];
            acc[p.user].push(p);
            return acc;
        }, {});

        let count = 0;
        for (const userId in userGroups) {
            const userPredictions = userGroups[userId];
            const mentalWellness = userPredictions.filter(p => p.predictionType === 'mental_wellness');
            const academicImpact = userPredictions.filter(p => p.predictionType === 'academic_impact');

            const metrics = {
                totalPredictions: userPredictions.length,
                mentalWellness: {
                    count: mentalWellness.length,
                    average: mentalWellness.length > 0
                        ? mentalWellness.reduce((sum, p) => sum + p.result.prediction, 0) / mentalWellness.length
                        : 0,
                    min: mentalWellness.length > 0
                        ? Math.min(...mentalWellness.map(p => p.result.prediction))
                        : null,
                    max: mentalWellness.length > 0
                        ? Math.max(...mentalWellness.map(p => p.result.prediction))
                        : null
                },
                academicImpact: {
                    count: academicImpact.length,
                    average: academicImpact.length > 0
                        ? academicImpact.reduce((sum, p) => sum + p.result.prediction, 0) / academicImpact.length
                        : 0,
                    min: academicImpact.length > 0
                        ? Math.min(...academicImpact.map(p => p.result.prediction))
                        : null,
                    max: academicImpact.length > 0
                        ? Math.max(...academicImpact.map(p => p.result.prediction))
                        : null
                },
                engagement: {
                    activeDays: 1,
                    favoritePredictions: userPredictions.filter(p => p.isFavorite).length,
                    emailsSent: 0
                }
            };

            try {
                await Analytics.updateAnalytics(userId, 'daily', yesterday, metrics);
                count++;
            } catch (error) {
                logger.error(`Failed to create analytics for user ${userId}: ${error.message}`);
            }
        }

        logger.info(`Daily analytics generated for ${count} users`);
    } catch (error) {
        logger.error(`Failed to generate daily analytics: ${error.message}`);
        throw error;
    }
};

/**
 * Check for inactive users and send reminder (run weekly)
 */
exports.sendInactiveUserReminders = async () => {
    try {
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        // Find users who haven't made predictions in 2 weeks
        const recentPredictions = await Prediction.find({
            createdAt: { $gte: twoWeeksAgo }
        }).distinct('user');

        const inactiveUsers = await User.find({
            _id: { $nin: recentPredictions },
            isActive: true,
            isEmailVerified: true,
            createdAt: { $lt: twoWeeksAgo }
        });

        let count = 0;
        for (const user of inactiveUsers) {
            try {
                await notificationService.sendNotification(
                    user._id,
                    'system_alert',
                    '👋 We Miss You!',
                    'It\'s been a while since your last prediction. Check in on your wellness journey and see how you\'re doing!',
                    {},
                    'low'
                );
                count++;
            } catch (error) {
                logger.error(`Failed to send reminder to user ${user._id}: ${error.message}`);
            }
        }

        logger.info(`Sent reminders to ${count} inactive users`);
    } catch (error) {
        logger.error(`Failed to send inactive user reminders: ${error.message}`);
        throw error;
    }
};

/**
 * Initialize scheduled tasks
 */
exports.initScheduledTasks = () => {
    // Run cleanup daily at 2 AM
    const cleanupInterval = 24 * 60 * 60 * 1000; // 24 hours
    setInterval(() => {
        const now = new Date();
        if (now.getHours() === 2) {
            exports.cleanupOldNotifications();
            exports.generateDailyAnalytics();
        }
    }, 60 * 60 * 1000); // Check every hour

    // Run weekly tasks on Sunday at 8 AM
    setInterval(() => {
        const now = new Date();
        if (now.getDay() === 0 && now.getHours() === 8) {
            exports.generateWeeklySummaries();
            exports.sendInactiveUserReminders();
        }
    }, 60 * 60 * 1000); // Check every hour

    logger.info('Scheduled tasks initialized');
};

module.exports = exports;
