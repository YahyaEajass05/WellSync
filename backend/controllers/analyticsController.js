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

    // Calculate period start date
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
        default:
            periodDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Query predictions directly - most reliable approach
    const predictions = await Prediction.find({
        user: req.user.id,
        createdAt: { $gte: periodDate }
    }).sort({ createdAt: 1 }).lean();

    // Split by type
    const mentalWellnessPreds = predictions.filter(p => p.predictionType === 'mental_wellness');
    const stressLevelPreds    = predictions.filter(p => p.predictionType === 'stress_level');
    const academicImpactPreds = predictions.filter(p => p.predictionType === 'academic_impact');

    // Helper to calculate stats for a group
    const calcStats = (preds) => {
        if (preds.length === 0) return { count: 0, average: 0, min: null, max: null, latest: null, trend: 'stable' };
        const scores = preds.map(p => p.result.prediction);
        const sum = scores.reduce((a, b) => a + b, 0);
        return {
            count: preds.length,
            average: sum / preds.length,
            min: Math.min(...scores),
            max: Math.max(...scores),
            latest: scores[scores.length - 1],
            trend: preds.length >= 2
                ? (scores[scores.length - 1] > scores[0] ? 'improving' : scores[scores.length - 1] < scores[0] ? 'declining' : 'stable')
                : 'stable'
        };
    };

    // Build metrics directly from predictions
    const metrics = {
        totalPredictions: predictions.length,
        mentalWellness: calcStats(mentalWellnessPreds),
        stressLevel:    calcStats(stressLevelPreds),
        academicImpact: calcStats(academicImpactPreds),
        engagement: {
            activeDays: new Set(predictions.map(p => new Date(p.createdAt).toDateString())).size,
            favoritePredictions: predictions.filter(p => p.isFavorite).length,
            emailsSent: 0
        },
        recentPredictions: [...predictions].reverse().slice(0, 7).map(p => ({
            type: p.predictionType,
            score: p.result.prediction,
            interpretation: p.result.interpretation || '',
            date: p.createdAt
        }))
    };

    // Save to Analytics model (for history)
    try {
        await Analytics.updateAnalytics(req.user.id, period, periodDate, metrics);
    } catch (err) {
        logger.warn('Failed to save analytics to DB, returning live data:', err.message);
    }

    // Always return live computed metrics (not the saved model)
    res.status(200).json({
        success: true,
        message: 'Analytics generated successfully',
        data: {
            analytics: {
                period,
                periodDate,
                metrics
            }
        }
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
