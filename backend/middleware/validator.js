/**
 * Input Validation Middleware
 * Validates request data using express-validator
 */

const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg,
                value: err.value
            }))
        });
    }
    next();
};

// User registration validation
exports.registerValidation = [
    body('firstName')
        .trim()
        .notEmpty().withMessage('First name is required')
        .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
        .trim()
        .notEmpty().withMessage('Last name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('confirmPassword')
        .notEmpty().withMessage('Confirm password is required')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords do not match')
];

// Login validation
exports.loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
];

// Mental wellness prediction validation
exports.mentalWellnessValidation = [
    body('age')
        .isInt({ min: 18, max: 100 }).withMessage('Age must be between 18 and 100'),
    body('gender')
        .notEmpty().withMessage('Gender is required')
        .isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
    body('occupation')
        .trim()
        .notEmpty().withMessage('Occupation is required'),
    body('work_mode')
        .notEmpty().withMessage('Work mode is required')
        .isIn(['Remote', 'Hybrid', 'Office']).withMessage('Invalid work mode'),
    body('screen_time_hours')
        .isFloat({ min: 0, max: 24 }).withMessage('Screen time must be between 0 and 24 hours'),
    body('work_screen_hours')
        .isFloat({ min: 0, max: 24 }).withMessage('Work screen hours must be between 0 and 24'),
    body('leisure_screen_hours')
        .isFloat({ min: 0, max: 24 }).withMessage('Leisure screen hours must be between 0 and 24'),
    body('sleep_hours')
        .isFloat({ min: 0, max: 24 }).withMessage('Sleep hours must be between 0 and 24'),
    body('sleep_quality_1_5')
        .isInt({ min: 1, max: 5 }).withMessage('Sleep quality must be between 1 and 5'),
    body('stress_level_0_10')
        .isInt({ min: 0, max: 10 }).withMessage('Stress level must be between 0 and 10'),
    body('productivity_0_100')
        .isInt({ min: 0, max: 100 }).withMessage('Productivity must be between 0 and 100'),
    body('exercise_minutes_per_week')
        .isInt({ min: 0 }).withMessage('Exercise minutes must be a positive number'),
    body('social_hours_per_week')
        .isFloat({ min: 0 }).withMessage('Social hours must be a positive number')
];

// Academic impact prediction validation
exports.academicImpactValidation = [
    body('age')
        .isInt({ min: 17, max: 30 }).withMessage('Age must be between 17 and 30'),
    body('gender')
        .notEmpty().withMessage('Gender is required')
        .isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
    body('academic_level')
        .notEmpty().withMessage('Academic level is required')
        .isIn(['Bachelor', 'Master', 'PhD']).withMessage('Invalid academic level'),
    body('country')
        .trim()
        .notEmpty().withMessage('Country is required'),
    body('most_used_platform')
        .trim()
        .notEmpty().withMessage('Most used platform is required'),
    body('avg_daily_usage_hours')
        .isFloat({ min: 0, max: 24 }).withMessage('Daily usage must be between 0 and 24 hours'),
    body('sleep_hours_per_night')
        .isFloat({ min: 0, max: 24 }).withMessage('Sleep hours must be between 0 and 24'),
    body('mental_health_score')
        .isInt({ min: 0, max: 10 }).withMessage('Mental health score must be between 0 and 10'),
    body('conflicts_over_social_media')
        .isInt({ min: 0, max: 5 }).withMessage('Conflicts must be between 0 and 5'),
    body('affects_academic_performance')
        .notEmpty().withMessage('Academic performance impact is required')
        .isIn(['Yes', 'No']).withMessage('Must be Yes or No'),
    body('relationship_status')
        .trim()
        .notEmpty().withMessage('Relationship status is required')
];

// Update profile validation
exports.updateProfileValidation = [
    body('firstName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
    body('profile.age')
        .optional()
        .isInt({ min: 13, max: 120 }).withMessage('Age must be between 13 and 120'),
    body('profile.gender')
        .optional()
        .isIn(['Male', 'Female', 'Other', 'Prefer not to say']).withMessage('Invalid gender'),
    body('profile.phoneNumber')
        .optional()
        .isMobilePhone().withMessage('Invalid phone number')
];

// Change password validation
exports.changePasswordValidation = [
    body('currentPassword')
        .notEmpty().withMessage('Current password is required'),
    body('newPassword')
        .notEmpty().withMessage('New password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('confirmPassword')
        .notEmpty().withMessage('Confirm password is required')
        .custom((value, { req }) => value === req.body.newPassword)
        .withMessage('Passwords do not match')
];

// Email validation
exports.emailValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail()
];

// Stress level prediction validation
exports.stressLevelValidation = [
    body('age')
        .isInt({ min: 18, max: 100 }).withMessage('Age must be between 18 and 100'),
    body('gender')
        .notEmpty().withMessage('Gender is required')
        .isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
    body('occupation')
        .trim()
        .notEmpty().withMessage('Occupation is required'),
    body('work_mode')
        .notEmpty().withMessage('Work mode is required')
        .isIn(['Remote', 'Hybrid', 'Office']).withMessage('Invalid work mode'),
    body('screen_time_hours')
        .isFloat({ min: 0, max: 24 }).withMessage('Screen time must be between 0 and 24 hours'),
    body('work_screen_hours')
        .isFloat({ min: 0, max: 24 }).withMessage('Work screen hours must be between 0 and 24'),
    body('leisure_screen_hours')
        .isFloat({ min: 0, max: 24 }).withMessage('Leisure screen hours must be between 0 and 24'),
    body('sleep_hours')
        .isFloat({ min: 0, max: 24 }).withMessage('Sleep hours must be between 0 and 24'),
    body('sleep_quality_1_5')
        .isInt({ min: 1, max: 5 }).withMessage('Sleep quality must be between 1 and 5'),
    body('productivity_0_100')
        .isInt({ min: 0, max: 100 }).withMessage('Productivity must be between 0 and 100'),
    body('exercise_minutes_per_week')
        .isInt({ min: 0 }).withMessage('Exercise minutes must be a positive number'),
    body('social_hours_per_week')
        .isFloat({ min: 0 }).withMessage('Social hours must be a positive number'),
    body('mental_wellness_index_0_100')
        .isFloat({ min: 0, max: 100 }).withMessage('Mental wellness index must be between 0 and 100')
];

// Prediction ID validation
exports.predictionIdValidation = [
    param('id')
        .isMongoId().withMessage('Invalid prediction ID')
];
