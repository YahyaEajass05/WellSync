/**
 * Email Configuration Test Script
 * Tests if email is configured correctly
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const nodemailer = require('nodemailer');

console.log('\n' + '='.repeat(60));
console.log('📧 TESTING EMAIL CONFIGURATION');
console.log('='.repeat(60) + '\n');

// Show configuration (hide password)
console.log('Configuration:');
console.log('  Email Service:', process.env.EMAIL_SERVICE);
console.log('  Email Host:', process.env.EMAIL_HOST);
console.log('  Email Port:', process.env.EMAIL_PORT);
console.log('  Email User:', process.env.EMAIL_USER);
console.log('  Email Password:', process.env.EMAIL_PASSWORD ? '********' + process.env.EMAIL_PASSWORD.slice(-4) : 'NOT SET');
console.log('  Email From:', process.env.EMAIL_FROM);
console.log('');

// Create transporter
const transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Verify connection
console.log('Testing connection to email server...\n');

transporter.verify((error, success) => {
    if (error) {
        console.log('❌ EMAIL CONFIGURATION ERROR\n');
        console.log('Error:', error.message);
        console.log('');
        
        if (error.message.includes('Invalid login')) {
            console.log('💡 SOLUTION:');
            console.log('   1. Make sure you\'re using an App Password (not your Gmail password)');
            console.log('   2. Check that the password has NO SPACES');
            console.log('   3. Verify 2-Step Verification is enabled');
            console.log('   4. Regenerate app password if needed');
            console.log('');
            console.log('📚 Follow: GMAIL_SETUP_COMPLETE_GUIDE.md');
        }
        
        process.exit(1);
    } else {
        console.log('✅ EMAIL SERVER CONNECTION SUCCESSFUL!\n');
        console.log('Sending test email...\n');
        
        // Send test email
        transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: process.env.EMAIL_USER,
            subject: '✅ WellSync Email Configuration Test',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
                    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
                        <h1 style="color: #4CAF50;">✅ Success!</h1>
                        <p style="font-size: 16px; color: #333;">
                            Your WellSync email configuration is working correctly!
                        </p>
                        <div style="background: #e8f5e9; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
                            <strong>Configuration Details:</strong>
                            <ul style="margin: 10px 0;">
                                <li>Email Service: Gmail</li>
                                <li>SMTP Host: ${process.env.EMAIL_HOST}</li>
                                <li>Port: ${process.env.EMAIL_PORT}</li>
                                <li>From: ${process.env.EMAIL_FROM}</li>
                            </ul>
                        </div>
                        <p style="color: #666; font-size: 14px;">
                            You can now register users and send emails from your WellSync application!
                        </p>
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                        <p style="color: #999; font-size: 12px;">
                            This is a test email from WellSync Backend
                        </p>
                    </div>
                </div>
            `
        }, (err, info) => {
            if (err) {
                console.log('❌ FAILED TO SEND TEST EMAIL\n');
                console.log('Error:', err.message);
                console.log('');
                process.exit(1);
            } else {
                console.log('✅ TEST EMAIL SENT SUCCESSFULLY!\n');
                console.log('Message ID:', info.messageId);
                console.log('');
                console.log('='.repeat(60));
                console.log('📬 CHECK YOUR INBOX');
                console.log('='.repeat(60));
                console.log('');
                console.log('Email sent to:', process.env.EMAIL_USER);
                console.log('Subject: ✅ WellSync Email Configuration Test');
                console.log('');
                console.log('If you received the email, your configuration is perfect!');
                console.log('If not, check your spam folder.');
                console.log('');
                console.log('='.repeat(60));
                console.log('✅ EMAIL CONFIGURATION IS WORKING!');
                console.log('='.repeat(60) + '\n');
                process.exit(0);
            }
        });
    }
});
