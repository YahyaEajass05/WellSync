'use strict';

// Set test environment variables before any modules load
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-wellsync-2026';
process.env.JWT_EXPIRE = '7d';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-wellsync-2026';
process.env.JWT_REFRESH_EXPIRE = '30d';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/wellsync_test';
process.env.PORT = '5001';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.AI_SERVICE_URL = 'http://localhost:8000';
process.env.EMAIL_USER = 'test@wellsync.lk';
process.env.EMAIL_PASSWORD = 'test-password';
process.env.EMAIL_FROM = 'WellSync Test <test@wellsync.lk>';
process.env.BCRYPT_ROUNDS = '1'; // Speed up bcrypt in tests
process.env.LOG_LEVEL = 'error'; // Suppress info logs during tests
