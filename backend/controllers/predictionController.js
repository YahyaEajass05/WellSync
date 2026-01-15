/**
 * Prediction Controller
 * Handles AI predictions and stores results
 */

const Prediction = require('../models/Prediction');
const { asyncHandler } = require('../middleware/errorHandler');
const aiService = require('../utils/aiService');
const emailService = require('../utils/emailService');
const notificationService = require('../utils/notificationService');
const logger = require('../utils/logger');

/**
 * @desc    Get mental wellness prediction
 * @route   POST /api/predictions/mental-wellness
 * @access  Private
 */
exports.predictMentalWellness = asyncHandler(async (req, res) => {
    const startTime = Date.now();
    
    // Get prediction from AI service
    const aiResponse = await aiService.predictMentalWellness(req.body);
    
    // Save prediction to database
    const prediction = await Prediction.create({
        user: req.user.id,
        predictionType: 'mental_wellness',
        inputData: req.body,
        result: {
            prediction: aiResponse.data.prediction,
            interpretation: aiResponse.data.interpretation,
            modelName: aiResponse.data.model_name,
            confidenceMetrics: {
                modelR2Score: aiResponse.data.confidence_metrics?.model_r2_score,
                modelMAE: aiResponse.data.confidence_metrics?.model_mae
            },
            inputFeaturesProcessed: aiResponse.data.input_features_processed
        },
        metadata: {
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            processingTime: aiResponse.processingTime,
            apiVersion: '1.0.0'
        }
    });

    const totalTime = Date.now() - startTime;
    
    logger.info(`Mental wellness prediction created for user: ${req.user.email}`, {
        predictionId: prediction._id,
        score: prediction.result.prediction,
        processingTime: totalTime
    });

    // Send notification
    try {
        await notificationService.notifyPredictionCompleted(
            req.user.id,
            'mental_wellness',
            prediction.result.prediction,
            prediction.result.interpretation
        );
    } catch (error) {
        logger.error(`Failed to send prediction notification: ${error.message}`);
    }

    // Check for milestones
    const totalPredictions = await Prediction.countDocuments({ user: req.user.id });
    if ([10, 25, 50, 100, 250].includes(totalPredictions)) {
        try {
            await notificationService.notifyMilestone(req.user.id, totalPredictions, totalPredictions);
        } catch (error) {
            logger.error(`Failed to send milestone notification: ${error.message}`);
        }
    }

    res.status(201).json({
        success: true,
        message: 'Mental wellness prediction completed successfully',
        data: {
            prediction: {
                id: prediction._id,
                score: prediction.result.prediction,
                interpretation: prediction.result.interpretation,
                modelUsed: prediction.result.modelName,
                confidence: prediction.result.confidenceMetrics,
                createdAt: prediction.createdAt
            },
            processingTime: totalTime
        }
    });
});

/**
 * @desc    Get academic impact prediction
 * @route   POST /api/predictions/academic-impact
 * @access  Private
 */
exports.predictAcademicImpact = asyncHandler(async (req, res) => {
    const startTime = Date.now();
    
    // Get prediction from AI service
    const aiResponse = await aiService.predictAcademicImpact(req.body);
    
    // Save prediction to database
    const prediction = await Prediction.create({
        user: req.user.id,
        predictionType: 'academic_impact',
        inputData: req.body,
        result: {
            prediction: aiResponse.data.prediction,
            interpretation: aiResponse.data.interpretation,
            modelName: aiResponse.data.model_name,
            confidenceMetrics: {
                modelR2Score: aiResponse.data.confidence_metrics?.model_r2_score,
                modelMAE: aiResponse.data.confidence_metrics?.model_mae
            },
            inputFeaturesProcessed: aiResponse.data.input_features_processed
        },
        metadata: {
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            processingTime: aiResponse.processingTime,
            apiVersion: '1.0.0'
        }
    });

    const totalTime = Date.now() - startTime;
    
    logger.info(`Academic impact prediction created for user: ${req.user.email}`, {
        predictionId: prediction._id,
        score: prediction.result.prediction,
        processingTime: totalTime
    });

    // Send notification
    try {
        await notificationService.notifyPredictionCompleted(
            req.user.id,
            'academic_impact',
            prediction.result.prediction,
            prediction.result.interpretation
        );
    } catch (error) {
        logger.error(`Failed to send prediction notification: ${error.message}`);
    }

    // Check for milestones
    const totalPredictions = await Prediction.countDocuments({ user: req.user.id });
    if ([10, 25, 50, 100, 250].includes(totalPredictions)) {
        try {
            await notificationService.notifyMilestone(req.user.id, totalPredictions, totalPredictions);
        } catch (error) {
            logger.error(`Failed to send milestone notification: ${error.message}`);
        }
    }

    res.status(201).json({
        success: true,
        message: 'Academic impact prediction completed successfully',
        data: {
            prediction: {
                id: prediction._id,
                score: prediction.result.prediction,
                interpretation: prediction.result.interpretation,
                modelUsed: prediction.result.modelName,
                confidence: prediction.result.confidenceMetrics,
                createdAt: prediction.createdAt
            },
            processingTime: totalTime
        }
    });
});

/**
 * @desc    Get stress level prediction
 * @route   POST /api/predictions/stress-level
 * @access  Private
 */
exports.predictStressLevel = asyncHandler(async (req, res) => {
    const startTime = Date.now();
    
    // Get prediction from AI service
    const aiResponse = await aiService.predictStressLevel(req.body);
    
    // Save prediction to database
    const prediction = await Prediction.create({
        user: req.user.id,
        predictionType: 'stress_level',
        inputData: req.body,
        result: {
            prediction: aiResponse.data.prediction,
            interpretation: aiResponse.data.interpretation,
            modelName: aiResponse.data.model_name,
            stressCategory: aiResponse.data.stress_category,
            recommendations: aiResponse.data.recommendations,
            confidenceMetrics: {
                modelR2Score: aiResponse.data.confidence_metrics?.model_r2_score,
                modelMAE: aiResponse.data.confidence_metrics?.model_mae
            },
            inputFeaturesProcessed: aiResponse.data.input_features_processed
        },
        metadata: {
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            processingTime: aiResponse.processingTime,
            apiVersion: '1.0.0'
        }
    });

    const totalTime = Date.now() - startTime;
    
    logger.info(`Stress level prediction created for user: ${req.user.email}`, {
        predictionId: prediction._id,
        score: prediction.result.prediction,
        category: prediction.result.stressCategory,
        processingTime: totalTime
    });

    // Send notification
    try {
        await notificationService.notifyPredictionCompleted(
            req.user.id,
            'stress_level',
            prediction.result.prediction,
            prediction.result.interpretation
        );
    } catch (error) {
        logger.error(`Failed to send prediction notification: ${error.message}`);
    }

    // Check for milestones
    const totalPredictions = await Prediction.countDocuments({ user: req.user.id });
    if ([10, 25, 50, 100, 250].includes(totalPredictions)) {
        try {
            await notificationService.notifyMilestone(req.user.id, totalPredictions, totalPredictions);
        } catch (error) {
            logger.error(`Failed to send milestone notification: ${error.message}`);
        }
    }

    res.status(201).json({
        success: true,
        message: 'Stress level prediction completed successfully',
        data: {
            prediction: {
                id: prediction._id,
                score: prediction.result.prediction,
                category: prediction.result.stressCategory,
                interpretation: prediction.result.interpretation,
                recommendations: prediction.result.recommendations,
                modelUsed: prediction.result.modelName,
                confidence: prediction.result.confidenceMetrics,
                createdAt: prediction.createdAt
            },
            processingTime: totalTime
        }
    });
});

/**
 * @desc    Get all predictions for current user
 * @route   GET /api/predictions
 * @access  Private
 */
exports.getPredictions = asyncHandler(async (req, res) => {
    const { type, limit = 20, page = 1, sortBy = 'createdAt', order = 'desc' } = req.query;

    const query = { user: req.user.id };
    
    if (type) {
        query.predictionType = type;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'desc' ? -1 : 1;

    const predictions = await Prediction.find(query)
        .sort({ [sortBy]: sortOrder })
        .limit(parseInt(limit))
        .skip(skip)
        .lean();

    const total = await Prediction.countDocuments(query);

    res.status(200).json({
        success: true,
        data: {
            predictions: predictions.map(p => ({
                id: p._id,
                type: p.predictionType,
                score: p.result.prediction,
                interpretation: p.result.interpretation,
                modelUsed: p.result.modelName,
                createdAt: p.createdAt,
                isFavorite: p.isFavorite,
                tags: p.tags
            })),
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
 * @desc    Get single prediction by ID
 * @route   GET /api/predictions/:id
 * @access  Private
 */
exports.getPrediction = asyncHandler(async (req, res) => {
    const prediction = await Prediction.findOne({
        _id: req.params.id,
        user: req.user.id
    });

    if (!prediction) {
        return res.status(404).json({
            success: false,
            error: 'Prediction not found'
        });
    }

    res.status(200).json({
        success: true,
        data: {
            prediction: {
                id: prediction._id,
                type: prediction.predictionType,
                inputData: prediction.inputData,
                result: prediction.result,
                metadata: prediction.metadata,
                notes: prediction.notes,
                isFavorite: prediction.isFavorite,
                tags: prediction.tags,
                createdAt: prediction.createdAt,
                updatedAt: prediction.updatedAt
            }
        }
    });
});

/**
 * @desc    Update prediction (notes, tags, favorite)
 * @route   PUT /api/predictions/:id
 * @access  Private
 */
exports.updatePrediction = asyncHandler(async (req, res) => {
    const { notes, tags, isFavorite } = req.body;

    const prediction = await Prediction.findOne({
        _id: req.params.id,
        user: req.user.id
    });

    if (!prediction) {
        return res.status(404).json({
            success: false,
            error: 'Prediction not found'
        });
    }

    // Update allowed fields
    if (notes !== undefined) prediction.notes = notes;
    if (tags !== undefined) prediction.tags = tags;
    if (isFavorite !== undefined) prediction.isFavorite = isFavorite;

    await prediction.save();

    res.status(200).json({
        success: true,
        message: 'Prediction updated successfully',
        data: { prediction }
    });
});

/**
 * @desc    Delete prediction
 * @route   DELETE /api/predictions/:id
 * @access  Private
 */
exports.deletePrediction = asyncHandler(async (req, res) => {
    const prediction = await Prediction.findOne({
        _id: req.params.id,
        user: req.user.id
    });

    if (!prediction) {
        return res.status(404).json({
            success: false,
            error: 'Prediction not found'
        });
    }

    await prediction.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Prediction deleted successfully'
    });
});

/**
 * @desc    Get user statistics
 * @route   GET /api/predictions/stats
 * @access  Private
 */
exports.getUserStats = asyncHandler(async (req, res) => {
    const stats = await Prediction.getUserStats(req.user.id);

    const totalPredictions = await Prediction.countDocuments({ user: req.user.id });

    res.status(200).json({
        success: true,
        data: {
            totalPredictions,
            byType: stats,
            summary: {
                mentalWellness: stats.find(s => s._id === 'mental_wellness') || { count: 0, averagePrediction: 0 },
                academicImpact: stats.find(s => s._id === 'academic_impact') || { count: 0, averagePrediction: 0 },
                stressLevel: stats.find(s => s._id === 'stress_level') || { count: 0, averagePrediction: 0 }
            }
        }
    });
});

/**
 * @desc    Get prediction trends
 * @route   GET /api/predictions/trends/:type
 * @access  Private
 */
exports.getPredictionTrends = asyncHandler(async (req, res) => {
    const { type } = req.params;
    const { days = 30 } = req.query;

    if (!['mental_wellness', 'academic_impact', 'stress_level'].includes(type)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid prediction type'
        });
    }

    const trends = await Prediction.getPredictionTrends(req.user.id, type, parseInt(days));

    res.status(200).json({
        success: true,
        data: {
            type,
            period: `${days} days`,
            trends: trends.map(t => ({
                score: t.result.prediction,
                date: t.createdAt
            }))
        }
    });
});

/**
 * @desc    Send prediction report via email
 * @route   POST /api/predictions/:id/email
 * @access  Private
 */
exports.emailPredictionReport = asyncHandler(async (req, res) => {
    const prediction = await Prediction.findOne({
        _id: req.params.id,
        user: req.user.id
    });

    if (!prediction) {
        return res.status(404).json({
            success: false,
            error: 'Prediction not found'
        });
    }

    // Send email
    await emailService.sendPredictionReportEmail(req.user, prediction);

    res.status(200).json({
        success: true,
        message: 'Prediction report sent to your email successfully'
    });
});

/**
 * @desc    Get example input data
 * @route   GET /api/predictions/examples/:type
 * @access  Public
 */
exports.getExampleData = asyncHandler(async (req, res) => {
    const { type } = req.params;

    if (!['mental_wellness', 'academic_impact', 'stress_level'].includes(type)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid prediction type. Use mental_wellness, academic_impact, or stress_level'
        });
    }

    const exampleData = await aiService.getExampleData(type);

    res.status(200).json({
        success: true,
        data: exampleData.data
    });
});
