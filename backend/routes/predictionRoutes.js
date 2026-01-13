/**
 * Prediction Routes
 * Handles AI prediction endpoints
 */

const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');
const { protect } = require('../middleware/auth');
const { validate, mentalWellnessValidation, academicImpactValidation, predictionIdValidation } = require('../middleware/validator');
const { predictionLimiter, emailLimiter } = require('../middleware/rateLimiter');

// Public routes
router.get('/examples/:type', predictionController.getExampleData);

// Protected routes - require authentication
router.use(protect);

// Create predictions
router.post('/mental-wellness', predictionLimiter, mentalWellnessValidation, validate, predictionController.predictMentalWellness);
router.post('/academic-impact', predictionLimiter, academicImpactValidation, validate, predictionController.predictAcademicImpact);

// Get predictions
router.get('/', predictionController.getPredictions);
router.get('/stats', predictionController.getUserStats);
router.get('/trends/:type', predictionController.getPredictionTrends);
router.get('/:id', predictionIdValidation, validate, predictionController.getPrediction);

// Update/Delete predictions
router.put('/:id', predictionIdValidation, validate, predictionController.updatePrediction);
router.delete('/:id', predictionIdValidation, validate, predictionController.deletePrediction);

// Email prediction report
router.post('/:id/email', predictionIdValidation, validate, emailLimiter, predictionController.emailPredictionReport);

module.exports = router;
