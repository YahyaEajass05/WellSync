/**
 * Email Configuration
 * Nodemailer setup for sending emails
 */

const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Create transporter
const createTransporter = () => {
    const config = {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    };

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
