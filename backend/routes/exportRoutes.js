/**
 * Export Routes
 * Handles data export endpoints
 */

const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const { protect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

// All routes require authentication
router.use(protect);

// Apply rate limiting to export endpoints (limited to prevent abuse)
router.use(apiLimiter);

// Export all user data
router.get('/data', exportController.exportUserData);

// Export predictions to CSV
router.get('/predictions/csv', exportController.exportPredictionsCSV);

// Export analytics report
router.get('/analytics', exportController.exportAnalytics);

module.exports = router;
