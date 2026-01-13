/**
 * Export Controller
 * Handles data export functionality
 */

const Prediction = require('../models/Prediction');
const User = require('../models/User');
const Analytics = require('../models/Analytics');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * @desc    Export user data in JSON format
 * @route   GET /api/export/data
 * @access  Private
 */
exports.exportUserData = asyncHandler(async (req, res) => {
    const { format = 'json', includeAnalytics = true } = req.query;

    // Get user data
    const user = await User.findById(req.user.id).select('-password');

    // Get all predictions
    const predictions = await Prediction.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .lean();

    // Prepare export data
    const exportData = {
        exportDate: new Date().toISOString(),
        user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            profile: user.profile,
            accountCreated: user.createdAt,
            lastLogin: user.lastLogin
        },
        predictions: predictions.map(p => ({
            id: p._id,
            type: p.predictionType,
            date: p.createdAt,
            inputData: p.inputData,
            result: p.result,
            notes: p.notes,
            tags: p.tags,
            isFavorite: p.isFavorite
        })),
        statistics: {
            totalPredictions: predictions.length,
            mentalWellnessPredictions: predictions.filter(p => p.predictionType === 'mental_wellness').length,
            academicImpactPredictions: predictions.filter(p => p.predictionType === 'academic_impact').length,
            memberSince: user.createdAt,
            lastActivity: predictions.length > 0 ? predictions[0].createdAt : null
        }
    };

    // Include analytics if requested
    if (includeAnalytics === 'true') {
        const analytics = await Analytics.find({ user: req.user.id })
            .sort({ periodDate: -1 })
            .limit(12)
            .lean();
        
        exportData.analytics = analytics;
    }

    if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=wellsync-data-${Date.now()}.json`);
        return res.status(200).json(exportData);
    } else if (format === 'csv') {
        // Convert to CSV
        const csv = convertToCSV(predictions);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=wellsync-predictions-${Date.now()}.csv`);
        return res.status(200).send(csv);
    }

    res.status(400).json({
        success: false,
        error: 'Invalid format. Use json or csv'
    });
});

/**
 * @desc    Export predictions to CSV
 * @route   GET /api/export/predictions/csv
 * @access  Private
 */
exports.exportPredictionsCSV = asyncHandler(async (req, res) => {
    const { type, startDate, endDate } = req.query;

    const query = { user: req.user.id };
    
    if (type) {
        query.predictionType = type;
    }
    
    if (startDate && endDate) {
        query.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const predictions = await Prediction.find(query)
        .sort({ createdAt: -1 })
        .lean();

    const csv = convertToCSV(predictions);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=predictions-${Date.now()}.csv`);
    res.status(200).send(csv);
});

/**
 * @desc    Export analytics report
 * @route   GET /api/export/analytics
 * @access  Private
 */
exports.exportAnalytics = asyncHandler(async (req, res) => {
    const { period = 'monthly', months = 6 } = req.query;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const analytics = await Analytics.find({
        user: req.user.id,
        period,
        periodDate: { $gte: startDate }
    }).sort({ periodDate: 1 }).lean();

    const predictions = await Prediction.find({
        user: req.user.id,
        createdAt: { $gte: startDate }
    }).lean();

    const report = {
        reportGenerated: new Date().toISOString(),
        reportPeriod: `Last ${months} months`,
        user: {
            id: req.user.id,
            name: `${req.user.firstName} ${req.user.lastName}`,
            email: req.user.email
        },
        summary: {
            totalPredictions: predictions.length,
            analyticsRecords: analytics.length,
            dateRange: {
                start: startDate,
                end: new Date()
            }
        },
        analytics,
        detailedPredictions: predictions.map(p => ({
            date: p.createdAt,
            type: p.predictionType,
            score: p.result.prediction,
            interpretation: p.result.interpretation
        }))
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=analytics-report-${Date.now()}.json`);
    res.status(200).json(report);
});

/**
 * Helper function to convert predictions to CSV
 */
function convertToCSV(predictions) {
    if (predictions.length === 0) {
        return 'No data available';
    }

    // CSV Headers
    const headers = [
        'Date',
        'Type',
        'Score',
        'Interpretation',
        'Model',
        'R² Score',
        'MAE',
        'Notes',
        'Tags',
        'Favorite'
    ];

    // CSV Rows
    const rows = predictions.map(p => [
        new Date(p.createdAt).toISOString(),
        p.predictionType,
        p.result.prediction,
        p.result.interpretation || '',
        p.result.modelName || '',
        p.result.confidenceMetrics?.modelR2Score || '',
        p.result.confidenceMetrics?.modelMAE || '',
        p.notes || '',
        (p.tags || []).join('; '),
        p.isFavorite ? 'Yes' : 'No'
    ]);

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
}

module.exports = exports;
