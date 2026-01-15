/**
 * WellSync Backend Server
 * Main application entry point
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');

const connectDB = require('./config/database');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const { requestLogger, slowRequestLogger } = require('./middleware/requestLogger');
const scheduledTasks = require('./utils/scheduledTasks');
const logger = require('./utils/logger');

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet());
app.use(mongoSanitize());

// CORS configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined', {
        stream: {
            write: (message) => logger.info(message.trim())
        }
    }));
}

// Trust proxy (for rate limiting and IP tracking)
app.set('trust proxy', 1);

// Request logging middleware
if (process.env.NODE_ENV !== 'test') {
    app.use(requestLogger);
    app.use(slowRequestLogger);
}

// Apply rate limiting to all routes
app.use(apiLimiter);

// Favicon route (prevent 500 error)
app.get('/favicon.ico', (req, res) => {
    res.status(204).end(); // No content
});

// Root route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: '🚀 WellSync Backend API is running',
        version: '1.0.0',
        environment: process.env.NODE_ENV,
        endpoints: {
            api: '/api',
            health: '/api/health',
            documentation: '/api'
        },
        features: [
            'User Authentication & Authorization',
            'Mental Wellness Predictions',
            'Academic Impact Analysis',
            'Stress Level Predictions',
            'Email Notifications',
            'Prediction History & Trends',
            'User Dashboard & Statistics'
        ]
    });
});

// Mount API routes
app.use('/api', routes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Server configuration
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

// Start server
const server = app.listen(PORT, () => {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 WellSync Backend Server Started Successfully!');
    console.log('='.repeat(80));
    console.log(`\n📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Server running on: http://${HOST}:${PORT}`);
    console.log(`🔗 API Base URL: http://${HOST}:${PORT}/api`);
    console.log(`💊 Health Check: http://${HOST}:${PORT}/api/health`);
    console.log(`🤖 AI Service: ${process.env.AI_SERVICE_URL}`);
    console.log(`📧 Email Service: ${process.env.EMAIL_SERVICE === 'gmail' ? 'Gmail' : 'Configured'}`);
    console.log('\n📚 Available Endpoints:');
    console.log('   • POST   /api/auth/register          - Register new user');
    console.log('   • POST   /api/auth/login             - Login user');
    console.log('   • GET    /api/auth/me                - Get current user');
    console.log('   • POST   /api/predictions/mental-wellness - Mental wellness prediction');
    console.log('   • POST   /api/predictions/academic-impact - Academic impact prediction');
    console.log('   • POST   /api/predictions/stress-level - Stress level prediction');
    console.log('   • GET    /api/predictions            - Get all predictions');
    console.log('   • GET    /api/users/dashboard        - Get user dashboard');
    console.log('   • GET    /api/models/info            - Get AI models info');
    console.log('\n' + '='.repeat(80) + '\n');
    
    logger.info(`Server started on port ${PORT} in ${process.env.NODE_ENV} mode`);
    
    // Initialize scheduled tasks
    if (process.env.NODE_ENV !== 'test') {
        scheduledTasks.initScheduledTasks();
    }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => {
        process.exit(1);
    });
});

// Handle SIGTERM
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, closing server gracefully');
    server.close(() => {
        logger.info('Process terminated');
    });
});

module.exports = app;
