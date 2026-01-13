/**
 * Routes Index
 * Central routing configuration
 */

const express = require('express');
const router = express.Router();
const aiService = require('../utils/aiService');

// Import route modules
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const predictionRoutes = require('./predictionRoutes');
const notificationRoutes = require('./notificationRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const exportRoutes = require('./exportRoutes');

// API Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/predictions', predictionRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/export', exportRoutes);

// Health check route
router.get('/health', async (req, res) => {
    const aiHealth = await aiService.checkAIServiceHealth();
    
    res.status(200).json({
        success: true,
        message: 'WellSync Backend API is running',
        data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                database: 'connected',
                aiService: aiHealth.status
            }
        }
    });
});

// AI models info route
router.get('/models/info', async (req, res) => {
    try {
        const modelsInfo = await aiService.getModelsInfo();
        res.status(200).json({
            success: true,
            data: modelsInfo.data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch models info',
            message: error.message
        });
    }
});

// Root route
router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'WellSync Backend API',
        version: '1.0.0',
        documentation: {
            postman: '/api-docs',
            swagger: '/swagger'
        },
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            predictions: '/api/predictions',
            health: '/api/health'
        }
    });
});

module.exports = router;
