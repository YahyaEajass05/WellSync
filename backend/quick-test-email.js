/**
 * Quick Test Email - Sends Welcome Email Immediately
 * Usage: node quick-test-email.js your-email@example.com
 */

require('dotenv').config();
const emailService = require('./utils/emailService');

// Get email from command line argument
const recipientEmail = process.argv[2];

if (!recipientEmail) {
    console.log('\n❌ Please provide an email address!');
    console.log('Usage: node quick-test-email.js your-email@example.com\n');
    process.exit(1);
}

console.log('\n' + '='.repeat(80));
console.log('📧 SENDING TEST EMAIL WITH ANIMATIONS');
console.log('='.repeat(80) + '\n');

console.log(`📨 Recipient: ${recipientEmail}`);
console.log(`📤 From: ${process.env.EMAIL_FROM || process.env.EMAIL_USER}`);
console.log(`🎨 Template: Welcome Email with Beautiful Animations\n`);

const testUser = {
    firstName: 'John',
    lastName: 'Doe',
    email: recipientEmail
};

const verificationCode = '123456';

console.log('⏳ Sending email...\n');

emailService.sendWelcomeEmail(testUser, verificationCode)
    .then(() => {
        console.log('✅ EMAIL SENT SUCCESSFULLY!\n');
        console.log('=' .repeat(80));
        console.log('🎉 CHECK YOUR INBOX!');
        console.log('='.repeat(80) + '\n');
        
        console.log('📬 What to look for in the email:\n');
        console.log('  ✨ Bouncing celebration icon (🎉)');
        console.log('  ✨ Glowing verification code: 123456');
        console.log('  ✨ Animated feature list (slides in)');
        console.log('  ✨ Shine effect on purple header');
        console.log('  ✨ Interactive button (hover to see effect)');
        console.log('  ✨ Social media icons in footer');
        console.log('  ✨ Responsive design (check on mobile!)\n');
        
        console.log('💡 TIP: The animations work best in:');
        console.log('  - Gmail (web & mobile app)');
        console.log('  - Apple Mail');
        console.log('  - Yahoo Mail');
        console.log('  - Most modern email clients\n');
        
        console.log('🎨 Email Features:');
        console.log('  - Modern gradient header');
        console.log('  - CSS animations (bounce, fade, glow)');
        console.log('  - Professional typography');
        console.log('  - Mobile-responsive layout\n');
        
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ ERROR SENDING EMAIL:\n');
        console.error(error.message);
        
        console.log('\n🔧 TROUBLESHOOTING:\n');
        console.log('1. Check your .env file configuration:');
        console.log(`   EMAIL_USER: ${process.env.EMAIL_USER || 'NOT SET'}`);
        console.log(`   EMAIL_HOST: ${process.env.EMAIL_HOST || 'NOT SET'}`);
        console.log(`   EMAIL_PORT: ${process.env.EMAIL_PORT || 'NOT SET'}`);
        
        console.log('\n2. For Gmail users:');
        console.log('   - Use an App Password (not your regular password)');
        console.log('   - Generate at: https://myaccount.google.com/apppasswords');
        
        console.log('\n3. Make sure backend server is NOT running');
        console.log('   - Stop server to avoid port conflicts\n');
        
        process.exit(1);
    });
