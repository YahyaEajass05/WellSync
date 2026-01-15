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
            text: options.text,
            attachments: options.attachments || []
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
 * Send prediction report email with PDF attachment
 */
exports.sendPredictionReportEmail = async (user, predictionData) => {
    const { generatePredictionReportPDF } = require('./pdfGenerator');
    
    // Generate PDF report
    const pdfBuffer = await generatePredictionReportPDF(user, predictionData);
    
    const predictionType = predictionData.predictionType === 'mental_wellness' 
        ? 'Mental Wellness' 
        : predictionData.predictionType === 'academic_impact'
        ? 'Academic Impact'
        : 'Stress Level';
    
    const html = getEmailTemplate('predictionReport', {
        firstName: user.firstName,
        predictionType: predictionType,
        prediction: predictionData.result.prediction.toFixed(2),
        interpretation: predictionData.result.interpretation,
        modelName: predictionData.result.modelName,
        date: new Date(predictionData.createdAt).toLocaleDateString(),
        recommendations: getRecommendations(predictionData),
        recommendationsList: getRecommendationsList(predictionData)
    });

    // Send email with PDF attachment
    await sendEmail({
        to: user.email,
        subject: `Your ${predictionType} Report - WellSync`,
        html,
        attachments: [
            {
                filename: `WellSync_${predictionType.replace(' ', '_')}_Report_${new Date().toISOString().split('T')[0]}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }
        ]
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
    } else if (predictionData.predictionType === 'academic_impact') {
        const score = predictionData.result.prediction;
        if (score >= 7) {
            return 'High addiction risk detected. Consider reducing social media usage and seeking academic support.';
        } else if (score >= 5) {
            return 'Moderate risk. Try setting daily usage limits and creating dedicated study time.';
        } else {
            return 'Healthy usage pattern. Continue maintaining balanced social media habits.';
        }
    } else if (predictionData.predictionType === 'stress_level') {
        // Use the recommendations array from the prediction
        if (predictionData.result.recommendations && predictionData.result.recommendations.length > 0) {
            return predictionData.result.recommendations.join('. ') + '.';
        }
        // Fallback based on stress level
        const score = predictionData.result.prediction;
        if (score >= 8) {
            return 'Very high stress detected. Consider stress management techniques, improve sleep, and seek professional support.';
        } else if (score >= 6) {
            return 'Elevated stress levels. Focus on reducing screen time, getting better sleep, and increasing physical activity.';
        } else if (score >= 3) {
            return 'Moderate stress. Maintain your current healthy habits and monitor your stress levels regularly.';
        } else {
            return 'Low stress levels. Excellent! Keep maintaining your healthy lifestyle and wellness habits.';
        }
    }
};

/**
 * Get recommendations as an array for better email formatting
 */
const getRecommendationsList = (predictionData) => {
    // Use provided recommendations if available
    if (predictionData.result.recommendations && Array.isArray(predictionData.result.recommendations)) {
        return predictionData.result.recommendations;
    }
    
    if (predictionData.predictionType === 'mental_wellness') {
        const score = predictionData.result.prediction;
        if (score >= 80) {
            return [
                'Continue your excellent sleep schedule (7-9 hours)',
                'Maintain regular exercise routine',
                'Keep balanced screen time habits',
                'Stay socially connected'
            ];
        } else if (score >= 70) {
            return [
                'Aim for 7-9 hours of quality sleep each night',
                'Increase exercise to 150+ minutes per week',
                'Reduce non-work screen time',
                'Practice stress management techniques'
            ];
        } else if (score >= 60) {
            return [
                'Prioritize sleep - aim for consistent 7-9 hours',
                'Start with 30 minutes of exercise 3x per week',
                'Limit screen time, especially before bed',
                'Take regular breaks from work/study',
                'Consider mindfulness or meditation'
            ];
        } else {
            return [
                'Seek professional mental health support',
                'Establish a consistent sleep routine',
                'Reduce screen time significantly',
                'Start gentle physical activity (walking, yoga)',
                'Connect with friends and family',
                'Consider stress counseling or therapy'
            ];
        }
    } else if (predictionData.predictionType === 'academic_impact') {
        const score = predictionData.result.prediction;
        if (score >= 7) {
            return [
                'Set strict daily social media time limits (1-2 hours max)',
                'Use app blockers during study time',
                'Create a dedicated study environment without phone',
                'Seek academic support or tutoring',
                'Consider a digital detox weekend',
                'Talk to a counselor about social media habits'
            ];
        } else if (score >= 5) {
            return [
                'Limit social media to 2-3 hours per day',
                'Turn off notifications during study sessions',
                'Use the Pomodoro technique (25 min focus, 5 min break)',
                'Schedule specific times for social media',
                'Track your daily usage with an app'
            ];
        } else {
            return [
                'Maintain current healthy social media habits',
                'Continue balanced screen time usage',
                'Keep prioritizing studies over social media',
                'Stay mindful of usage patterns'
            ];
        }
    } else if (predictionData.predictionType === 'stress_level') {
        // Use the recommendations array from the prediction if available
        if (predictionData.result.recommendations && predictionData.result.recommendations.length > 0) {
            return predictionData.result.recommendations;
        }
        
        // Fallback recommendations based on stress level
        const score = predictionData.result.prediction;
        if (score >= 8) {
            return [
                'Seek professional mental health support immediately',
                'Practice deep breathing exercises (5-10 minutes, 3x daily)',
                'Prioritize 7-9 hours of sleep each night',
                'Reduce screen time, especially before bed',
                'Take short breaks every hour during work',
                'Consider stress counseling or therapy',
                'Engage in physical activity (even a 10-minute walk helps)',
                'Talk to someone you trust about your stress'
            ];
        } else if (score >= 6) {
            return [
                'Practice daily stress management (meditation, yoga, deep breathing)',
                'Improve sleep quality - aim for 7-9 hours',
                'Reduce screen time by 1-2 hours per day',
                'Take regular breaks during work/study',
                'Exercise 30 minutes, 3-5 times per week',
                'Consider talking to a counselor'
            ];
        } else if (score >= 3) {
            return [
                'Continue monitoring your stress levels',
                'Maintain healthy sleep habits (7-9 hours)',
                'Keep regular exercise routine',
                'Practice mindfulness or meditation weekly',
                'Balance work and leisure time'
            ];
        } else {
            return [
                'Excellent stress management! Keep it up',
                'Maintain your healthy lifestyle habits',
                'Continue regular exercise and good sleep',
                'Stay socially connected',
                'Keep work-life balance'
            ];
        }
    }
    
    // Fallback - return empty array if nothing matches
    return ['Continue monitoring your wellness and maintain healthy habits.'];
};

module.exports.sendEmail = sendEmail;
