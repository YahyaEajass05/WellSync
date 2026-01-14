/**
 * Send Test Email with Beautiful Animations
 * Run from backend directory: node send-test-email.js
 */

require('dotenv').config();
const emailService = require('./utils/emailService');

console.log('\n' + '='.repeat(80));
console.log('📧 WELLSYNC EMAIL TESTING TOOL');
console.log('='.repeat(80) + '\n');

console.log('Available Email Templates:');
console.log('  1. 🎉 Welcome Email (with verification code)');
console.log('  2. ✉️  Email Verification');
console.log('  3. 🔐 Password Reset');
console.log('  4. 📊 Prediction Report');
console.log('  5. ✅ Account Activation');
console.log('  6. 🚀 Send All Templates\n');

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Select template (1-6): ', (choice) => {
    rl.question('Enter recipient email address: ', async (email) => {
        console.log(`\n📨 Preparing to send to: ${email}\n`);
        
        const testUser = {
            firstName: 'John',
            lastName: 'Doe',
            email: email
        };
        
        try {
            switch(choice) {
                case '1':
                    console.log('🎉 Sending Welcome Email...');
                    await emailService.sendWelcomeEmail(testUser, '123456');
                    console.log('✅ Welcome email sent!\n');
                    showFeatures('Welcome');
                    break;
                    
                case '2':
                    console.log('✉️  Sending Email Verification...');
                    await emailService.sendVerificationEmail(testUser, '789012');
                    console.log('✅ Verification email sent!\n');
                    showFeatures('Verification');
                    break;
                    
                case '3':
                    console.log('🔐 Sending Password Reset...');
                    await emailService.sendPasswordResetEmail(testUser, '456789');
                    console.log('✅ Password reset email sent!\n');
                    showFeatures('Password Reset');
                    break;
                    
                case '4':
                    console.log('📊 Sending Prediction Report...');
                    const predictionData = {
                        predictionType: 'mental_wellness',
                        result: {
                            prediction: 75.5,
                            interpretation: 'Good mental wellness',
                            modelName: 'Voting Ensemble'
                        },
                        createdAt: new Date()
                    };
                    await emailService.sendPredictionReportEmail(testUser, predictionData);
                    console.log('✅ Prediction report sent!\n');
                    showFeatures('Prediction Report');
                    break;
                    
                case '5':
                    console.log('✅ Sending Account Activation...');
                    await emailService.sendAccountActivationEmail(testUser);
                    console.log('✅ Activation email sent!\n');
                    showFeatures('Account Activation');
                    break;
                    
                case '6':
                    console.log('🚀 Sending ALL Templates...\n');
                    
                    console.log('  1/5 Sending Welcome Email...');
                    await emailService.sendWelcomeEmail(testUser, '123456');
                    await sleep(2000);
                    
                    console.log('  2/5 Sending Email Verification...');
                    await emailService.sendVerificationEmail(testUser, '789012');
                    await sleep(2000);
                    
                    console.log('  3/5 Sending Password Reset...');
                    await emailService.sendPasswordResetEmail(testUser, '456789');
                    await sleep(2000);
                    
                    console.log('  4/5 Sending Prediction Report...');
                    const predData = {
                        predictionType: 'mental_wellness',
                        result: {
                            prediction: 75.5,
                            interpretation: 'Good mental wellness',
                            modelName: 'Voting Ensemble'
                        },
                        createdAt: new Date()
                    };
                    await emailService.sendPredictionReportEmail(testUser, predData);
                    await sleep(2000);
                    
                    console.log('  5/5 Sending Account Activation...');
                    await emailService.sendAccountActivationEmail(testUser);
                    
                    console.log('\n✅ All 5 templates sent successfully!\n');
                    console.log('📬 Check your inbox for all the animated emails!');
                    break;
                    
                default:
                    console.log('❌ Invalid choice. Please run again and select 1-6.');
            }
            
            console.log('\n' + '='.repeat(80));
            console.log('✨ EMAIL SENT SUCCESSFULLY!');
            console.log('='.repeat(80) + '\n');
            console.log('📬 Check your inbox at: ' + email);
            console.log('\n🎨 What to look for in the email:');
            console.log('  ✨ Bouncing animated icons');
            console.log('  ✨ Glowing verification codes');
            console.log('  ✨ Smooth fade-in effects');
            console.log('  ✨ Interactive buttons (hover over them!)');
            console.log('  ✨ Shine effect on purple header');
            console.log('  ✨ Responsive mobile design\n');
            
        } catch (error) {
            console.error('\n❌ Error sending email:', error.message);
            console.log('\n🔧 Troubleshooting:');
            console.log('  1. Check backend/.env for email configuration');
            console.log('  2. Gmail users: Use App Password, not regular password');
            console.log('  3. Your current email: ' + process.env.EMAIL_USER);
            console.log('  4. Verify SMTP settings (host: smtp.gmail.com, port: 587)');
            console.log('  5. Check if backend server is NOT running (port conflict)\n');
        }
        
        rl.close();
        process.exit();
    });
});

function showFeatures(templateName) {
    console.log(`📨 ${templateName} Features:`);
    console.log('  ✨ Bouncing animated icon');
    console.log('  ✨ Glowing verification/reset codes');
    console.log('  ✨ Smooth fade-in animations');
    console.log('  ✨ Interactive button hovers');
    console.log('  ✨ Shine effect on header');
    console.log('  ✨ Responsive mobile design');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
