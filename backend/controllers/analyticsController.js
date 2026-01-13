/**
 * Analytics Controller
 * Handles analytics and insights
 */

const Analytics = require('../models/Analytics');
const Prediction = require('../models/Prediction');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * @desc    Get user analytics for period
 * @route   GET /api/analytics/:period
 * @access  Private
 */
exports.getAnalytics = asyncHandler(async (req, res) => {
    const { period } = req.params;
    const { startDate, endDate } = req.query;

    if (!['daily', 'weekly', 'monthly', 'yearly'].includes(period)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid period. Use daily, weekly, monthly, or yearly'
        });
    }

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const analytics = await Analytics.getAnalytics(req.user.id, period, start, end);

    res.status(200).json({
        success: true,
        data: { period, analytics }
    });
});

/**
 * @desc    Generate analytics report
 * @route   POST /api/analytics/generate
 * @access  Private
 */
exports.generateAnalytics = asyncHandler(async (req, res) => {
    const { period = 'weekly' } = req.body;

    // Calculate period date
    const now = new Date();
    let periodDate;
    
    switch(period) {
        case 'daily':
            periodDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case 'weekly':
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            periodDate = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
            break;
        case 'monthly':
            periodDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'yearly':
            periodDate = new Date(now.getFullYear(), 0, 1);
            break;
    }

    // Get predictions for period
    const predictions = await Prediction.find({
        user: req.user.id,
        createdAt: { $gte: periodDate }
    });

    // Calculate metrics
    const mentalWellnessPreds = predictions.filter(p => p.predictionType === 'mental_wellness');
    const academicImpactPreds = predictions.filter(p => p.predictionType === 'academic_impact');

    const metrics = {
        totalPredictions: predictions.length,
        mentalWellness: {
            count: mentalWellnessPreds.length,
            average: mentalWellnessPreds.length > 0
                ? mentalWellnessPreds.reduce((sum, p) => sum + p.result.prediction, 0) / mentalWellnessPreds.length
                : 0,
            min: mentalWellnessPreds.length > 0
                ? Math.min(...mentalWellnessPreds.map(p => p.result.prediction))
                : null,
            max: mentalWellnessPreds.length > 0
                ? Math.max(...mentalWellnessPreds.map(p => p.result.prediction))
                : null
        },
        academicImpact: {
            count: academicImpactPreds.length,
            average: academicImpactPreds.length > 0
                ? academicImpactPreds.reduce((sum, p) => sum + p.result.prediction, 0) / academicImpactPreds.length
                : 0,
            min: academicImpactPreds.length > 0
                ? Math.min(...academicImpactPreds.map(p => p.result.prediction))
                : null,
            max: academicImpactPreds.length > 0
                ? Math.max(...academicImpactPreds.map(p => p.result.prediction))
                : null
        },
        engagement: {
            activeDays: new Set(predictions.map(p => p.createdAt.toDateString())).size,
            favoritePredictions: predictions.filter(p => p.isFavorite).length,
            emailsSent: 0 // Can be tracked separately
        }
    };

    // Save analytics
    const analytics = await Analytics.updateAnalytics(
        req.user.id,
        period,
        periodDate,
        metrics
    );

    res.status(200).json({
        success: true,
        message: 'Analytics generated successfully',
        data: { analytics }
    });
});

/**
 * @desc    Get insights and recommendations
 * @route   GET /api/analytics/insights
 * @access  Private
 */
exports.getInsights = asyncHandler(async (req, res) => {
    // Get recent predictions
    const recentPredictions = await Prediction.find({
        user: req.user.id,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }).sort({ createdAt: -1 });

    const insights = [];

    // Mental wellness insights
    const mentalWellness = recentPredictions
        .filter(p => p.predictionType === 'mental_wellness')
        .map(p => p.result.prediction);

    if (mentalWellness.length >= 3) {
        const avg = mentalWellness.reduce((a, b) => a + b, 0) / mentalWellness.length;
        const trend = mentalWellness[0] > mentalWellness[mentalWellness.length - 1] ? 'improving' : 'declining';

        if (avg < 50) {
            insights.push({
                type: 'warning',
                category: 'mental_wellness',
                title: 'Low Mental Wellness Detected',
                message: 'Your recent mental wellness scores are below average. Consider increasing exercise, improving sleep quality, or seeking professional support.',
                severity: 'warning',
                recommendation: 'Focus on self-care activities and maintain a healthy work-life balance.'
            });
        } else if (avg >= 70 && trend === 'improving') {
            insights.push({
                type: 'achievement',
                category: 'mental_wellness',
                title: 'Great Progress!',
                message: 'Your mental wellness scores are improving. Keep up the good work!',
                severity: 'info',
                recommendation: 'Continue your current healthy habits.'
            });
        }
    }

    // Academic impact insights
    const academicImpact = recentPredictions
        .filter(p => p.predictionType === 'academic_impact')
        .map(p => p.result.prediction);

    if (academicImpact.length >= 3) {
        const avg = academicImpact.reduce((a, b) => a + b, 0) / academicImpact.length;

        if (avg >= 7) {
            insights.push({
                type: 'warning',
                category: 'academic_impact',
                title: 'High Social Media Addiction Risk',
                message: 'Your social media usage shows high addiction potential. This may significantly impact your academic performance.',
                severity: 'critical',
                recommendation: 'Consider setting daily usage limits and creating dedicated study time without distractions.'
            });
        } else if (avg < 4) {
            insights.push({
                type: 'achievement',
                category: 'academic_impact',
                title: 'Healthy Social Media Usage',
                message: 'You maintain a healthy balance with social media. Your academic performance is likely unaffected.',
                severity: 'info',
                recommendation: 'Continue maintaining balanced digital habits.'
            });
        }
    }

    // Engagement insights
    if (recentPredictions.length === 0) {
        insights.push({
            type: 'tip',
            category: 'engagement',
            title: 'Start Tracking Your Wellness',
            message: 'You haven\'t made any predictions recently. Regular tracking helps identify patterns and improve your well-being.',
            severity: 'info',
            recommendation: 'Make a prediction to get personalized insights.'
        });
    }

    // Milestone insights
    const totalPredictions = await Prediction.countDocuments({ user: req.user.id });
    if (totalPredictions >= 10 && totalPredictions % 10 === 0) {
        insights.push({
            type: 'milestone',
            category: 'engagement',
            title: `Milestone: ${totalPredictions} Predictions!`,
            message: `Congratulations! You've completed ${totalPredictions} predictions. Consistent tracking leads to better insights.`,
            severity: 'info',
            recommendation: 'Review your trends to see your progress over time.'
        });
    }

    res.status(200).json({
        success: true,
        data: {
            insights,
            totalInsights: insights.length,
            recentPredictionsCount: recentPredictions.length
        }
    });
});

/**
 * @desc    Get comparative analytics
 * @route   GET /api/analytics/compare
 * @access  Private
 */
exports.compareAnalytics = asyncHandler(async (req, res) => {
    const { startDate1, endDate1, startDate2, endDate2 } = req.query;

    if (!startDate1 || !endDate1 || !startDate2 || !endDate2) {
        return res.status(400).json({
            success: false,
            error: 'Please provide both date ranges for comparison'
        });
    }

    // Period 1
    const period1Predictions = await Prediction.find({
        user: req.user.id,
        createdAt: { $gte: new Date(startDate1), $lte: new Date(endDate1) }
    });

    // Period 2
    const period2Predictions = await Prediction.find({
        user: req.user.id,
        createdAt: { $gte: new Date(startDate2), $lte: new Date(endDate2) }
    });

    const calculateMetrics = (predictions) => {
        const mw = predictions.filter(p => p.predictionType === 'mental_wellness');
        const ai = predictions.filter(p => p.predictionType === 'academic_impact');

        return {
            total: predictions.length,
            mentalWellness: {
                count: mw.length,
                average: mw.length > 0 ? mw.reduce((sum, p) => sum + p.result.prediction, 0) / mw.length : 0
            },
            academicImpact: {
                count: ai.length,
                average: ai.length > 0 ? ai.reduce((sum, p) => sum + p.result.prediction, 0) / ai.length : 0
            }
        };
    };

    const period1Metrics = calculateMetrics(period1Predictions);
    const period2Metrics = calculateMetrics(period2Predictions);

    // Calculate changes
    const changes = {
        totalPredictions: period2Metrics.total - period1Metrics.total,
        mentalWellnessAverage: period2Metrics.mentalWellness.average - period1Metrics.mentalWellness.average,
        academicImpactAverage: period2Metrics.academicImpact.average - period1Metrics.academicImpact.average
    };

    res.status(200).json({
        success: true,
        data: {
            period1: {
                dateRange: { start: startDate1, end: endDate1 },
                metrics: period1Metrics
            },
            period2: {
                dateRange: { start: startDate2, end: endDate2 },
                metrics: period2Metrics
            },
            changes
        }
    });
});

module.exports = exports;
