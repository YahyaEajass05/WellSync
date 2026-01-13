/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting request rates
 */

const rateLimit = require('express-rate-limit');

// General API rate limiter
exports.apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        success: false,
        error: 'Too many requests',
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Strict rate limiter for authentication endpoints
exports.authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    skipSuccessfulRequests: true,
    message: {
        success: false,
        error: 'Too many authentication attempts',
        message: 'Too many login attempts, please try again after 15 minutes.'
    }
});

// Rate limiter for prediction endpoints
exports.predictionLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 predictions per minute
    message: {
        success: false,
        error: 'Too many prediction requests',
        message: 'You have exceeded the prediction limit. Please wait a moment.'
    }
});

// Rate limiter for email endpoints
exports.emailLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 emails per hour
    message: {
        success: false,
        error: 'Too many email requests',
        message: 'Too many email requests. Please try again later.'
    }
});
