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
    // Get ALL predictions sorted by date (no 30-day limit)
    const allPredictions = await Prediction.find({
        user: req.user.id
    }).sort({ createdAt: 1 }).lean();

    const insights = [];
    const totalPredictions = allPredictions.length;

    // Split by type
    const mentalWellnessPreds = allPredictions.filter(p => p.predictionType === 'mental_wellness');
    const stressLevelPreds    = allPredictions.filter(p => p.predictionType === 'stress_level');
    const academicImpactPreds = allPredictions.filter(p => p.predictionType === 'academic_impact');

    // ── Mental Wellness Insights ──────────────────────────────────────────────
    if (mentalWellnessPreds.length >= 1) {
        const scores = mentalWellnessPreds.map(p => p.result.prediction);
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        const latest = scores[scores.length - 1];
        const trend = scores.length >= 2
            ? (scores[scores.length - 1] > scores[0] ? 'improving' : scores[scores.length - 1] < scores[0] ? 'declining' : 'stable')
            : 'stable';

        if (avg < 50) {
            insights.push({
                type: 'warning',
                category: 'mental_wellness',
                title: '⚠️ Low Mental Wellness Detected',
                message: `Your average mental wellness score is ${avg.toFixed(1)}/100, which is below average. Consider improving sleep quality, reducing screen time, and increasing physical activity.`,
                severity: 'warning',
                recommendation: 'Focus on self-care: aim for 7-9 hours of sleep, 30 minutes of daily exercise, and limit screen time before bed.'
            });
        } else if (avg >= 50 && avg < 70) {
            insights.push({
                type: 'tip',
                category: 'mental_wellness',
                title: '💙 Mental Wellness Needs Attention',
                message: `Your average mental wellness score is ${avg.toFixed(1)}/100. There's room for improvement with some lifestyle changes.`,
                severity: 'info',
                recommendation: 'Try adding 15 minutes of meditation daily and reduce social media usage to improve your wellness score.'
            });
        } else if (avg >= 70 && avg < 80) {
            insights.push({
                type: 'achievement',
                category: 'mental_wellness',
                title: '✅ Good Mental Wellness',
                message: `Your average mental wellness score is ${avg.toFixed(1)}/100. You\'re doing well! Keep maintaining your healthy habits.`,
                severity: 'info',
                recommendation: 'Continue your current habits and aim for consistent sleep and exercise routines.'
            });
        } else if (avg >= 80) {
            insights.push({
                type: 'achievement',
                category: 'mental_wellness',
                title: '🌟 Excellent Mental Wellness!',
                message: `Your average mental wellness score is ${avg.toFixed(1)}/100. Outstanding! You\'re maintaining excellent mental health.`,
                severity: 'info',
                recommendation: 'Keep up the great work! Share your wellness strategies with others.'
            });
        }

        // Trend insight
        if (scores.length >= 2 && trend === 'declining') {
            insights.push({
                type: 'warning',
                category: 'mental_wellness',
                title: '📉 Declining Mental Wellness Trend',
                message: `Your mental wellness score has declined from ${scores[0].toFixed(1)} to ${latest.toFixed(1)}. Early intervention can prevent further decline.`,
                severity: 'warning',
                recommendation: 'Review recent lifestyle changes and consider what may be affecting your wellness negatively.'
            });
        } else if (scores.length >= 2 && trend === 'improving') {
            insights.push({
                type: 'achievement',
                category: 'mental_wellness',
                title: '📈 Improving Mental Wellness Trend!',
                message: `Your mental wellness has improved from ${scores[0].toFixed(1)} to ${latest.toFixed(1)}. Great progress!`,
                severity: 'info',
                recommendation: 'Keep doing what you\'re doing - your current habits are clearly working!'
            });
        }
    }

    // ── Stress Level Insights ─────────────────────────────────────────────────
    if (stressLevelPreds.length >= 1) {
        const scores = stressLevelPreds.map(p => p.result.prediction);
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        const latest = scores[scores.length - 1];

        if (avg >= 8) {
            insights.push({
                type: 'warning',
                category: 'stress_level',
                title: '🚨 Very High Stress Levels Detected',
                message: `Your average stress level is ${avg.toFixed(1)}/10 - this is very concerning. Chronic high stress can seriously impact your physical and mental health.`,
                severity: 'critical',
                recommendation: 'Seek immediate support: talk to a counselor, practice emergency stress relief techniques, and consider reducing workload immediately.'
            });
        } else if (avg >= 6) {
            insights.push({
                type: 'warning',
                category: 'stress_level',
                title: '⚠️ High Stress Levels',
                message: `Your average stress level is ${avg.toFixed(1)}/10. This level of stress may impact your performance and health over time.`,
                severity: 'warning',
                recommendation: 'Implement daily stress management: try 10-minute meditation, regular exercise, and ensure you\'re taking proper breaks.'
            });
        } else if (avg >= 4) {
            insights.push({
                type: 'tip',
                category: 'stress_level',
                title: '🟡 Moderate Stress Levels',
                message: `Your average stress level is ${avg.toFixed(1)}/10. This is manageable but worth monitoring to prevent escalation.`,
                severity: 'info',
                recommendation: 'Maintain stress management practices: regular exercise, good sleep hygiene, and social connections can help keep stress in check.'
            });
        } else {
            insights.push({
                type: 'achievement',
                category: 'stress_level',
                title: '✅ Low Stress Levels - Well Done!',
                message: `Your average stress level is ${avg.toFixed(1)}/10. Excellent stress management!`,
                severity: 'info',
                recommendation: 'Continue your current stress management practices and help others learn your techniques.'
            });
        }
    }

    // ── Academic Impact Insights ──────────────────────────────────────────────
    if (academicImpactPreds.length >= 1) {
        const scores = academicImpactPreds.map(p => p.result.prediction);
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

        if (avg >= 7) {
            insights.push({
                type: 'warning',
                category: 'academic_impact',
                title: '🚨 High Social Media Addiction Risk',
                message: `Your addiction score is ${avg.toFixed(1)}/9, indicating high risk. This is likely significantly impacting your academic performance.`,
                severity: 'critical',
                recommendation: 'Set strict daily limits (max 1 hour), use app blockers during study time, and create phone-free study zones.'
            });
        } else if (avg >= 5) {
            insights.push({
                type: 'warning',
                category: 'academic_impact',
                title: '⚠️ Moderate Social Media Impact',
                message: `Your addiction score is ${avg.toFixed(1)}/9. Social media usage is moderately affecting your academic performance.`,
                severity: 'warning',
                recommendation: 'Try the Pomodoro technique: 25 minutes of focused study followed by a 5-minute break. Limit social media to break times only.'
            });
        } else {
            insights.push({
                type: 'achievement',
                category: 'academic_impact',
                title: '✅ Healthy Social Media Usage',
                message: `Your addiction score is ${avg.toFixed(1)}/9. You maintain a healthy balance with social media - great discipline!`,
                severity: 'info',
                recommendation: 'Keep maintaining this healthy balance. Your academic performance is likely benefiting from your disciplined approach.'
            });
        }
    }

    // ── Engagement Insights ───────────────────────────────────────────────────
    if (totalPredictions === 0) {
        insights.push({
            type: 'tip',
            category: 'engagement',
            title: '🚀 Start Your Wellness Journey',
            message: 'You haven\'t made any predictions yet. Start tracking your wellness to get personalized AI insights.',
            severity: 'info',
            recommendation: 'Make your first prediction to unlock personalized insights and recommendations.'
        });
    } else if (totalPredictions < 5) {
        insights.push({
            type: 'tip',
            category: 'engagement',
            title: '📊 Keep Tracking for Better Insights',
            message: `You've made ${totalPredictions} prediction${totalPredictions > 1 ? 's' : ''} so far. More predictions help identify patterns and improve recommendations.`,
            severity: 'info',
            recommendation: 'Aim to track all three prediction types (Mental Wellness, Stress Level, Academic Impact) regularly.'
        });
    }

    // Milestone insights
    if (totalPredictions >= 5 && totalPredictions % 5 === 0) {
        insights.push({
            type: 'milestone',
            category: 'engagement',
            title: `🏆 Milestone: ${totalPredictions} Predictions!`,
            message: `Congratulations! You've completed ${totalPredictions} predictions. Consistent tracking is the key to better self-awareness.`,
            severity: 'info',
            recommendation: 'Review your analytics page to see trends and patterns in your wellness data.'
        });
    }

    // Cross-prediction insight: High stress + Low wellness
    if (mentalWellnessPreds.length >= 1 && stressLevelPreds.length >= 1) {
        const mwAvg = mentalWellnessPreds.reduce((a, p) => a + p.result.prediction, 0) / mentalWellnessPreds.length;
        const slAvg = stressLevelPreds.reduce((a, p) => a + p.result.prediction, 0) / stressLevelPreds.length;

        if (slAvg >= 6 && mwAvg < 60) {
            insights.push({
                type: 'warning',
                category: 'combined',
                title: '🔗 Stress is Affecting Your Wellness',
                message: `Your high stress (${slAvg.toFixed(1)}/10) appears to be negatively impacting your mental wellness (${mwAvg.toFixed(1)}/100). These two are strongly correlated.`,
                severity: 'warning',
                recommendation: 'Prioritize stress reduction - this will have a positive knock-on effect on your overall mental wellness score.'
            });
        }
    }

    res.status(200).json({
        success: true,
        data: {
            insights,
            totalInsights: insights.length,
            totalPredictionsCount: totalPredictions
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
