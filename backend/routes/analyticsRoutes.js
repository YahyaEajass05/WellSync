/**
 * Analytics Routes
 * Handles analytics endpoints
 */

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const { param, query } = require('express-validator');
const { validate } = require('../middleware/validator');

// All routes require authentication
router.use(protect);

// Get insights and recommendations
router.get('/insights', analyticsController.getInsights);

// Generate analytics
router.post('/generate', analyticsController.generateAnalytics);

// Compare analytics between two periods
router.get('/compare',
    query('startDate1').notEmpty().withMessage('startDate1 is required'),
    query('endDate1').notEmpty().withMessage('endDate1 is required'),
    query('startDate2').notEmpty().withMessage('startDate2 is required'),
    query('endDate2').notEmpty().withMessage('endDate2 is required'),
    validate,
    analyticsController.compareAnalytics
);

// Get analytics for specific period
router.get('/:period',
    param('period').isIn(['daily', 'weekly', 'monthly', 'yearly']).withMessage('Invalid period'),
    validate,
    analyticsController.getAnalytics
);

module.exports = router;
