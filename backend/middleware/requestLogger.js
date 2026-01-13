/**
 * Request Logger Middleware
 * Enhanced logging for requests and responses
 */

const logger = require('../utils/logger');

/**
 * Log incoming requests with details
 */
exports.requestLogger = (req, res, next) => {
    const startTime = Date.now();

    // Log request details
    logger.info('Incoming Request', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        userId: req.user?.id || 'anonymous'
    });

    // Capture response
    const originalSend = res.send;
    res.send = function(data) {
        const duration = Date.now() - startTime;
        
        // Log response details
        logger.info('Outgoing Response', {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userId: req.user?.id || 'anonymous'
        });

        // Call original send
        originalSend.call(this, data);
    };

    next();
};

/**
 * Log slow requests (> 1 second)
 */
exports.slowRequestLogger = (req, res, next) => {
    const startTime = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - startTime;
        
        if (duration > 1000) {
            logger.warn('Slow Request Detected', {
                method: req.method,
                url: req.originalUrl,
                duration: `${duration}ms`,
                statusCode: res.statusCode,
                userId: req.user?.id || 'anonymous'
            });
        }
    });

    next();
};

module.exports = exports;
