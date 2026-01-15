/**
 * Email Configuration
 * Nodemailer setup for sending emails
 */

const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Create transporter
const createTransporter = () => {
    // For development, use ethereal email if credentials not provided
    if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
        logger.warn('⚠️  Email credentials not configured. Using Ethereal for testing.');
        return nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'ethereal.user@ethereal.email',
                pass: 'ethereal.password'
            }
        });
    }

    const config = {
        service: process.env.EMAIL_SERVICE || 'gmail',
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    };

    return nodemailer.createTransport(config);
};

const transporter = createTransporter();

// Verify transporter connection
transporter.verify((error, success) => {
    if (error) {
        logger.error(`❌ Email configuration error: ${error.message}`);
    } else {
        logger.info('✅ Email server is ready to send messages');
    }
});

module.exports = transporter;
