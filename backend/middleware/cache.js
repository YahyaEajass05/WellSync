/**
 * Cache Middleware
 * Simple in-memory cache for frequently accessed data
 */

const logger = require('../utils/logger');

// In-memory cache store
const cache = new Map();

// Cache configuration
const CACHE_DURATION = {
    short: 5 * 60 * 1000,      // 5 minutes
    medium: 15 * 60 * 1000,    // 15 minutes
    long: 60 * 60 * 1000       // 1 hour
};

/**
 * Generate cache key from request
 */
const generateCacheKey = (req) => {
    const userId = req.user?.id || 'anonymous';
    const path = req.originalUrl || req.url;
    return `${userId}:${path}`;
};

/**
 * Cache middleware factory
 */
exports.cacheMiddleware = (duration = CACHE_DURATION.medium) => {
    return (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const key = generateCacheKey(req);
        const cachedResponse = cache.get(key);

        if (cachedResponse) {
            const { data, timestamp } = cachedResponse;
            const age = Date.now() - timestamp;

            // Check if cache is still valid
            if (age < duration) {
                logger.debug(`Cache hit: ${key} (age: ${age}ms)`);
                return res.status(200).json({
                    ...data,
                    cached: true,
                    cacheAge: age
                });
            } else {
                // Cache expired, remove it
                cache.delete(key);
                logger.debug(`Cache expired: ${key}`);
            }
        }

        // Store original res.json
        const originalJson = res.json.bind(res);

        // Override res.json to cache the response
        res.json = function(data) {
            // Only cache successful responses
            if (res.statusCode === 200) {
                cache.set(key, {
                    data,
                    timestamp: Date.now()
                });
                logger.debug(`Cache set: ${key}`);
            }
            return originalJson(data);
        };

        next();
    };
};

/**
 * Clear cache for specific key pattern
 */
exports.clearCache = (pattern) => {
    let count = 0;
    for (const key of cache.keys()) {
        if (key.includes(pattern)) {
            cache.delete(key);
            count++;
        }
    }
    logger.info(`Cleared ${count} cache entries matching: ${pattern}`);
    return count;
};

/**
 * Clear all cache
 */
exports.clearAllCache = () => {
    const size = cache.size;
    cache.clear();
    logger.info(`Cleared all cache: ${size} entries`);
    return size;
};

/**
 * Clear cache for specific user
 */
exports.clearUserCache = (userId) => {
    return exports.clearCache(userId);
};

/**
 * Get cache statistics
 */
exports.getCacheStats = () => {
    const now = Date.now();
    const entries = [];
    
    for (const [key, value] of cache.entries()) {
        entries.push({
            key,
            age: now - value.timestamp,
            size: JSON.stringify(value.data).length
        });
    }

    return {
        totalEntries: cache.size,
        entries: entries.sort((a, b) => b.age - a.age)
    };
};

/**
 * Cleanup expired cache entries (run periodically)
 */
exports.cleanupExpiredCache = () => {
    const now = Date.now();
    let count = 0;

    for (const [key, value] of cache.entries()) {
        const age = now - value.timestamp;
        if (age > CACHE_DURATION.long) {
            cache.delete(key);
            count++;
        }
    }

    if (count > 0) {
        logger.info(`Cleaned up ${count} expired cache entries`);
    }
    
    return count;
};

// Auto cleanup every 10 minutes
setInterval(() => {
    exports.cleanupExpiredCache();
}, 10 * 60 * 1000);

module.exports = exports;
