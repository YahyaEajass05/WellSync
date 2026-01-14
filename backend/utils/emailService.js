/**
 * Email Service
 * Handles all email sending operations
 */

const transporter = require('../config/email');
const { getEmailTemplate } = require('./emailTemplates');
const logger = require('./logger');

/**
 * Send email using configured transporter
 */
const sendEmail = async (options) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || options.from,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email sent successfully to ${options.to}`, { messageId: info.messageId });
        return info;
    } catch (error) {
        logger.error(`Failed to send email to ${options.to}: ${error.message}`);
        throw new Error(`Email sending failed: ${error.message}`);
    }
};

/**
 * Send welcome email with verification code
 */
exports.sendWelcomeEmail = async (user, verificationCode) => {
    const html = getEmailTemplate('welcome', {
        firstName: user.firstName,
        verificationCode
    });

    await sendEmail({
        to: user.email,
        subject: 'Welcome to WellSync! Verify Your Email',
        html
    });
};

/**
 * Send email verification code
 */
exports.sendVerificationEmail = async (user, verificationCode) => {
    const html = getEmailTemplate('emailVerification', {
        firstName: user.firstName,
        verificationCode
    });

    await sendEmail({
        to: user.email,
        subject: 'Verify Your Email Address - WellSync',
        html
    });
};

/**
 * Send password reset code
 */
exports.sendPasswordResetEmail = async (user, resetCode) => {
    const html = getEmailTemplate('passwordReset', {
        firstName: user.firstName,
        resetCode
    });

    await sendEmail({
        to: user.email,
        subject: 'Reset Your Password - WellSync',
        html
    });
};

/**
 * Send prediction report email
 */
exports.sendPredictionReportEmail = async (user, predictionData) => {
    const dashboardLink = `${process.env.FRONTEND_URL}/dashboard`;
    
    const html = getEmailTemplate('predictionReport', {
        firstName: user.firstName,
        predictionType: predictionData.predictionType === 'mental_wellness' 
            ? 'Mental Wellness' 
            : 'Academic Impact',
        prediction: predictionData.result.prediction.toFixed(2),
        interpretation: predictionData.result.interpretation,
        modelName: predictionData.result.modelName,
        date: new Date(predictionData.createdAt).toLocaleDateString(),
        recommendations: getRecommendations(predictionData),
        dashboardLink
    });

    await sendEmail({
        to: user.email,
        subject: `Your ${predictionData.predictionType === 'mental_wellness' ? 'Mental Wellness' : 'Academic Impact'} Report - WellSync`,
        html
    });
};

/**
 * Send account activation confirmation
 */
exports.sendAccountActivationEmail = async (user) => {
    const loginLink = `${process.env.FRONTEND_URL}/login`;
    
    const html = getEmailTemplate('accountActivation', {
        firstName: user.firstName,
        loginLink
    });

    await sendEmail({
        to: user.email,
        subject: 'Account Activated - Welcome to WellSync!',
        html
    });
};

/**
 * Get recommendations based on prediction
 */
const getRecommendations = (predictionData) => {
    if (predictionData.predictionType === 'mental_wellness') {
        const score = predictionData.result.prediction;
        if (score >= 80) {
            return 'Excellent! Keep maintaining your healthy lifestyle habits.';
        } else if (score >= 70) {
            return 'Good work! Consider increasing exercise or improving sleep quality for better results.';
        } else if (score >= 60) {
            return 'There\'s room for improvement. Focus on better sleep, regular exercise, and reducing screen time.';
        } else {
            return 'Consider making lifestyle changes. Prioritize sleep, exercise, and seek professional support if needed.';
        }
    } else {
        const score = predictionData.result.prediction;
        if (score >= 7) {
            return 'High addiction risk detected. Consider reducing social media usage and seeking academic support.';
        } else if (score >= 5) {
            return 'Moderate risk. Try setting daily usage limits and creating dedicated study time.';
        } else {
            return 'Healthy usage pattern. Continue maintaining balanced social media habits.';
        }
    }
};

module.exports.sendEmail = sendEmail;
