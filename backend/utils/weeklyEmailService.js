/**
 * Weekly Email Service
 * Sends weekly wellness recommendations to all users
 */

const User = require('../models/User');
const Prediction = require('../models/Prediction');
const { getEmailTemplate } = require('./emailTemplates');
const { sendEmail } = require('./emailService');
const logger = require('./logger');

/**
 * Get weekly wellness tips based on user's prediction history
 */
const getWeeklyRecommendations = async (user) => {
    try {
        // Get user's recent predictions (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentPredictions = await Prediction.find({
            userId: user._id,
            createdAt: { $gte: thirtyDaysAgo }
        }).sort({ createdAt: -1 }).limit(10);
        
        if (recentPredictions.length === 0) {
            // No recent predictions - send general wellness tips
            return {
                hasData: false,
                recommendations: getGeneralWellnessTips(),
                summary: 'Welcome to your weekly wellness update! Here are some general tips to help you maintain a healthy lifestyle.'
            };
        }
        
        // Analyze prediction trends
        const mentalWellnessPredictions = recentPredictions.filter(p => p.predictionType === 'mental_wellness');
        const stressPredictions = recentPredictions.filter(p => p.predictionType === 'stress_level');
        const academicPredictions = recentPredictions.filter(p => p.predictionType === 'academic_impact');
        
        // Calculate averages
        const avgMentalWellness = mentalWellnessPredictions.length > 0
            ? mentalWellnessPredictions.reduce((sum, p) => sum + p.result.prediction, 0) / mentalWellnessPredictions.length
            : null;
        
        const avgStress = stressPredictions.length > 0
            ? stressPredictions.reduce((sum, p) => sum + p.result.prediction, 0) / stressPredictions.length
            : null;
        
        const avgAcademic = academicPredictions.length > 0
            ? academicPredictions.reduce((sum, p) => sum + p.result.prediction, 0) / academicPredictions.length
            : null;
        
        // Generate personalized recommendations
        const recommendations = generatePersonalizedRecommendations({
            mentalWellness: avgMentalWellness,
            stress: avgStress,
            academic: avgAcademic,
            totalPredictions: recentPredictions.length
        });
        
        const summary = generateWeeklySummary({
            mentalWellness: avgMentalWellness,
            stress: avgStress,
            academic: avgAcademic,
            userName: user.firstName
        });
        
        return {
            hasData: true,
            recommendations,
            summary,
            stats: {
                mentalWellness: avgMentalWellness,
                stress: avgStress,
                academic: avgAcademic,
                totalPredictions: recentPredictions.length
            }
        };
        
    } catch (error) {
        logger.error(`Error getting weekly recommendations for user ${user._id}: ${error.message}`);
        return {
            hasData: false,
            recommendations: getGeneralWellnessTips(),
            summary: 'Here are your weekly wellness tips!'
        };
    }
};

/**
 * Generate personalized recommendations based on user's trends
 */
const generatePersonalizedRecommendations = (stats) => {
    const recommendations = [];
    
    // Mental Wellness recommendations
    if (stats.mentalWellness !== null) {
        if (stats.mentalWellness < 60) {
            recommendations.push({
                category: 'Mental Wellness',
                priority: 'High',
                tip: 'Your mental wellness scores suggest you may be struggling. Consider prioritizing 7-9 hours of sleep nightly and engaging in at least 30 minutes of physical activity daily.'
            });
        } else if (stats.mentalWellness < 75) {
            recommendations.push({
                category: 'Mental Wellness',
                priority: 'Medium',
                tip: 'Your mental wellness is moderate. Focus on improving one area this week - either sleep quality, exercise frequency, or stress management techniques.'
            });
        } else {
            recommendations.push({
                category: 'Mental Wellness',
                priority: 'Low',
                tip: 'Great job maintaining your mental wellness! Keep up your healthy habits and consider helping friends or family with their wellness journeys.'
            });
        }
    }
    
    // Stress recommendations
    if (stats.stress !== null) {
        if (stats.stress >= 7) {
            recommendations.push({
                category: 'Stress Management',
                priority: 'High',
                tip: 'Your stress levels are elevated. This week, try starting each day with 10 minutes of deep breathing or meditation. Consider talking to a counselor if stress persists.'
            });
        } else if (stats.stress >= 4) {
            recommendations.push({
                category: 'Stress Management',
                priority: 'Medium',
                tip: 'Your stress is moderate. Practice the 5-5-5 rule: Every 5 hours, take 5 minutes to do 5 deep breaths. This simple technique can significantly reduce stress.'
            });
        } else {
            recommendations.push({
                category: 'Stress Management',
                priority: 'Low',
                tip: 'Excellent stress management! Your stress levels are well-controlled. Continue your current practices and build resilience for future challenges.'
            });
        }
    }
    
    // Academic/Social Media recommendations
    if (stats.academic !== null) {
        if (stats.academic >= 6) {
            recommendations.push({
                category: 'Digital Wellness',
                priority: 'High',
                tip: 'Your social media usage may be affecting your academic performance. This week, try the "phone-free hour" rule - no phone for the first hour after waking and before sleeping.'
            });
        } else if (stats.academic >= 4) {
            recommendations.push({
                category: 'Digital Wellness',
                priority: 'Medium',
                tip: 'Your social media use is moderate. Set app time limits and use "Do Not Disturb" mode during study or work hours to improve focus.'
            });
        } else {
            recommendations.push({
                category: 'Digital Wellness',
                priority: 'Low',
                tip: 'You have healthy digital habits! Continue maintaining balance between online engagement and real-world activities.'
            });
        }
    }
    
    // Add general wellness tip
    recommendations.push({
        category: 'General Wellness',
        priority: 'Medium',
        tip: getWeeklyMotivationalTip()
    });
    
    return recommendations;
};

/**
 * Generate weekly summary message
 */
const generateWeeklySummary = (data) => {
    const parts = [];
    
    parts.push(`Hi ${data.userName}! Here's your personalized weekly wellness update based on your recent activity.`);
    
    if (data.mentalWellness !== null) {
        const status = data.mentalWellness >= 75 ? 'excellent' : data.mentalWellness >= 60 ? 'good' : 'needs attention';
        parts.push(`Your average mental wellness score is ${data.mentalWellness.toFixed(1)}/100 - ${status}.`);
    }
    
    if (data.stress !== null) {
        const level = data.stress >= 7 ? 'high' : data.stress >= 4 ? 'moderate' : 'low';
        parts.push(`Your stress levels are averaging ${data.stress.toFixed(1)}/10 - ${level}.`);
    }
    
    if (data.academic !== null) {
        const risk = data.academic >= 6 ? 'high' : data.academic >= 4 ? 'moderate' : 'low';
        parts.push(`Your social media impact score averages ${data.academic.toFixed(1)}/9 - ${risk} risk.`);
    }
    
    parts.push('Review the personalized recommendations below to continue improving your wellness journey!');
    
    return parts.join(' ');
};

/**
 * Get general wellness tips for users without prediction data
 */
const getGeneralWellnessTips = () => {
    return [
        {
            category: 'Sleep',
            priority: 'High',
            tip: 'Aim for 7-9 hours of quality sleep each night. Establish a consistent bedtime routine and avoid screens 30-60 minutes before bed.'
        },
        {
            category: 'Exercise',
            priority: 'High',
            tip: 'Try to get at least 150 minutes of moderate aerobic activity per week. Even a 20-minute daily walk can make a big difference!'
        },
        {
            category: 'Nutrition',
            priority: 'Medium',
            tip: 'Focus on whole foods: fruits, vegetables, whole grains, and lean proteins. Stay hydrated with 8 glasses of water daily.'
        },
        {
            category: 'Mental Health',
            priority: 'Medium',
            tip: 'Practice mindfulness or meditation for just 10 minutes daily. Apps like Headspace or Calm can help you get started.'
        },
        {
            category: 'Social Connection',
            priority: 'Medium',
            tip: 'Make time for meaningful connections. Schedule regular catch-ups with friends and family, even if it\'s just a quick video call.'
        }
    ];
};

/**
 * Get rotating motivational tips
 */
const getWeeklyMotivationalTip = () => {
    const tips = [
        'Small changes lead to big results. Focus on one healthy habit this week and build from there.',
        'Your mental health is just as important as your physical health. Take time for self-care daily.',
        'Progress, not perfection. Celebrate small victories on your wellness journey.',
        'Consistency beats intensity. Regular small efforts compound into significant improvements.',
        'Remember: You can\'t pour from an empty cup. Take care of yourself first.',
        'Every day is a new opportunity to make healthier choices. Start fresh today!',
        'Your wellness journey is unique. Don\'t compare yourself to others - focus on your own growth.',
        'Balance is key. Work hard, but also make time to rest and recharge.'
    ];
    
    const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    return tips[weekNumber % tips.length];
};

/**
 * Send weekly email to a single user
 */
const sendWeeklyEmailToUser = async (user) => {
    try {
        const weeklyData = await getWeeklyRecommendations(user);
        
        const html = getEmailTemplate('weeklyWellness', {
            firstName: user.firstName,
            summary: weeklyData.summary,
            recommendations: weeklyData.recommendations,
            hasData: weeklyData.hasData,
            stats: weeklyData.stats,
            date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        });
        
        await sendEmail({
            to: user.email,
            subject: `📊 Your Weekly Wellness Update - ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`,
            html
        });
        
        logger.info(`Weekly email sent to ${user.email}`);
        return { success: true, email: user.email };
        
    } catch (error) {
        logger.error(`Failed to send weekly email to ${user.email}: ${error.message}`);
        return { success: false, email: user.email, error: error.message };
    }
};

/**
 * Send weekly emails to all active users
 */
const sendWeeklyEmailsToAllUsers = async () => {
    try {
        logger.info('Starting weekly email batch send...');
        
        // Get all active users who have opted in for emails
        const users = await User.find({
            isActive: true,
            emailVerified: true,
            'settings.emailNotifications': { $ne: false } // Default to true if not set
        }).select('firstName lastName email');
        
        logger.info(`Found ${users.length} active users for weekly emails`);
        
        const results = {
            total: users.length,
            successful: 0,
            failed: 0,
            errors: []
        };
        
        // Send emails with delay to avoid rate limiting
        for (const user of users) {
            const result = await sendWeeklyEmailToUser(user);
            
            if (result.success) {
                results.successful++;
            } else {
                results.failed++;
                results.errors.push({ email: result.email, error: result.error });
            }
            
            // Wait 2 seconds between emails to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        logger.info(`Weekly email batch completed: ${results.successful} successful, ${results.failed} failed`);
        
        return results;
        
    } catch (error) {
        logger.error(`Error in weekly email batch send: ${error.message}`);
        throw error;
    }
};

module.exports = {
    getWeeklyRecommendations,
    sendWeeklyEmailToUser,
    sendWeeklyEmailsToAllUsers
};
