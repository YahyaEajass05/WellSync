/**
 * Profile Routes
 * Handles all profile-related endpoints
 */

const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const { body } = require('express-validator');

// All routes require authentication
router.use(protect);

// Mental Wellness Profile Routes
router.route('/mental-wellness')
    .get(profileController.getMentalWellnessProfile)
    .post([
        body('occupation').notEmpty().withMessage('Occupation is required'),
        body('workMode').isIn(['Remote', 'Hybrid', 'Office', 'Self-employed', 'Student']).withMessage('Invalid work mode'),
        body('stressLevel').isInt({ min: 0, max: 10 }).withMessage('Stress level must be between 0 and 10'),
        body('productivity').isInt({ min: 0, max: 100 }).withMessage('Productivity must be between 0 and 100'),
        validate
    ], profileController.createOrUpdateMentalWellnessProfile);

// Student Profile Routes
router.route('/student')
    .get(profileController.getStudentProfile)
    .post([
        body('academicLevel').isIn(['High School', 'Bachelor', 'Master', 'PhD', 'Other']).withMessage('Invalid academic level'),
        body('country').notEmpty().withMessage('Country is required'),
        validate
    ], profileController.createOrUpdateStudentProfile);

// Screen Time Routes
router.route('/screen-time')
    .get(profileController.getScreenTimeLogs)
    .post([
        body('screenTimeHours').isFloat({ min: 0, max: 24 }).withMessage('Screen time must be between 0 and 24 hours'),
        body('workScreenHours').optional().isFloat({ min: 0, max: 24 }).withMessage('Work screen hours must be between 0 and 24'),
        body('leisureScreenHours').optional().isFloat({ min: 0, max: 24 }).withMessage('Leisure screen hours must be between 0 and 24'),
        validate
    ], profileController.logScreenTime);

// Sleep Routes
router.route('/sleep')
    .get(profileController.getSleepRecords)
    .post([
        body('sleepHours').isFloat({ min: 0, max: 24 }).withMessage('Sleep hours must be between 0 and 24'),
        body('sleepQuality').isInt({ min: 1, max: 5 }).withMessage('Sleep quality must be between 1 and 5'),
        validate
    ], profileController.logSleep);

// Social Media Usage Routes (Students only)
router.post('/social-media', [
    body('avgDailyUsageHours').isFloat({ min: 0, max: 24 }).withMessage('Usage must be between 0 and 24 hours'),
    body('mostUsedPlatform').notEmpty().withMessage('Most used platform is required'),
    body('conflictsOverSocialMedia').isInt({ min: 0, max: 5 }).withMessage('Conflicts must be between 0 and 5'),
    body('affectsAcademicPerformance').isIn(['Yes', 'No', 'Sometimes']).withMessage('Invalid value'),
    validate
], profileController.logSocialMediaUsage);

// Mental Health Assessment Routes (Students only)
router.post('/mental-health-assessment', [
    body('mentalHealthScore').isInt({ min: 0, max: 10 }).withMessage('Mental health score must be between 0 and 10'),
    body('sleepHoursPerNight').isFloat({ min: 0, max: 24 }).withMessage('Sleep hours must be between 0 and 24'),
    validate
], profileController.logMentalHealthAssessment);

// Overview Route
router.get('/overview', profileController.getProfileOverview);

module.exports = router;
