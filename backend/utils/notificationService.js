/**
 * Notification Service
 * Handles notification creation for various events
 */

const Notification = require('../models/Notification');
const logger = require('./logger');

/**
 * Send notification to user
 */
exports.sendNotification = async (userId, type, title, message, data = {}, priority = 'medium') => {
    try {
        const notification = await Notification.createNotification(
            userId,
            type,
            title,
            message,
            data,
            priority
        );
        
        logger.info(`Notification created: ${type} for user ${userId}`);
        return notification;
    } catch (error) {
        logger.error(`Failed to create notification: ${error.message}`);
        throw error;
    }
};

/**
 * Notify user of prediction completion
 */
exports.notifyPredictionCompleted = async (userId, predictionType, score, interpretation) => {
    const titles = {
        mental_wellness: '🧠 Mental Wellness Prediction Complete',
        academic_impact: '🎓 Academic Impact Analysis Complete',
        stress_level: '😰 Stress Level Prediction Complete'
    };

    const title = titles[predictionType] || 'Prediction Complete';
    const message = `Your ${predictionType.replace('_', ' ')} prediction is ready. Score: ${score.toFixed(2)}. ${interpretation}`;

    return await this.sendNotification(
        userId,
        'prediction_completed',
        title,
        message,
        { predictionType, score, interpretation },
        'medium'
    );
};

/**
 * Notify user of email verification
 */
exports.notifyEmailVerified = async (userId) => {
    return await this.sendNotification(
        userId,
        'email_verified',
        '✅ Email Verified Successfully',
        'Your email has been verified. You now have full access to all WellSync features!',
        {},
        'low'
    );
};

/**
 * Notify user of password change
 */
exports.notifyPasswordChanged = async (userId) => {
    return await this.sendNotification(
        userId,
        'password_changed',
        '🔐 Password Changed',
        'Your password has been successfully changed. If you did not make this change, please contact support immediately.',
        {},
        'high'
    );
};

/**
 * Notify user of milestone reached
 */
exports.notifyMilestone = async (userId, milestone, count) => {
    const milestones = {
        10: { emoji: '🎉', message: 'first 10 predictions' },
        25: { emoji: '🌟', message: '25 predictions' },
        50: { emoji: '🏆', message: '50 predictions' },
        100: { emoji: '👑', message: '100 predictions' },
        250: { emoji: '💎', message: '250 predictions' }
    };

    const info = milestones[milestone] || { emoji: '🎊', message: `${milestone} predictions` };

    return await this.sendNotification(
        userId,
        'milestone_reached',
        `${info.emoji} Milestone: ${count} Predictions!`,
        `Congratulations! You've reached ${info.message}. Keep tracking your wellness journey!`,
        { milestone, count },
        'low'
    );
};

/**
 * Notify user of weekly summary
 */
exports.notifyWeeklySummary = async (userId, stats) => {
    const message = `This week: ${stats.totalPredictions} predictions made. 
        Mental Wellness Average: ${stats.mentalWellnessAvg?.toFixed(1) || 'N/A'}. 
        Academic Impact Average: ${stats.academicImpactAvg?.toFixed(1) || 'N/A'}.
        Stress Level Average: ${stats.stressLevelAvg?.toFixed(1) || 'N/A'}.`;

    return await this.sendNotification(
        userId,
        'weekly_summary',
        '📊 Your Weekly Summary',
        message,
        stats,
        'low'
    );
};

/**
 * Send system alert
 */
exports.sendSystemAlert = async (userId, title, message, severity = 'info') => {
    const priority = severity === 'critical' ? 'urgent' : severity === 'warning' ? 'high' : 'medium';

    return await this.sendNotification(
        userId,
        'system_alert',
        title,
        message,
        { severity },
        priority
    );
};

/**
 * Notify user of account update
 */
exports.notifyAccountUpdated = async (userId, updateType) => {
    const messages = {
        profile: 'Your profile has been updated successfully.',
        preferences: 'Your preferences have been updated.',
        general: 'Your account information has been updated.'
    };

    return await this.sendNotification(
        userId,
        'account_updated',
        '✏️ Account Updated',
        messages[updateType] || messages.general,
        { updateType },
        'low'
    );
};

/**
 * Batch send notifications
 */
exports.sendBatchNotifications = async (userIds, type, title, message, data = {}, priority = 'medium') => {
    try {
        const notifications = await Promise.all(
            userIds.map(userId => 
                this.sendNotification(userId, type, title, message, data, priority)
            )
        );
        
        logger.info(`Batch notifications sent: ${notifications.length} notifications`);
        return notifications;
    } catch (error) {
        logger.error(`Failed to send batch notifications: ${error.message}`);
        throw error;
    }
};

module.exports = exports;
