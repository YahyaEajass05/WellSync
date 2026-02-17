/**
 * Comprehensive Email Functions Test Script
 * Tests all email functionalities in the WellSync system
 * 
 * Usage: node test-email-functions.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Prediction = require('./models/Prediction');
const emailService = require('./utils/emailService');
const weeklyEmailService = require('./utils/weeklyEmailService');
const { getEmailTemplate } = require('./utils/emailTemplates');

// Test configuration
const TEST_USER = {
    firstName: 'Test',
    lastName: 'User',
    email: process.env.TEST_EMAIL || process.env.EMAIL_USER || 'test@example.com',
    password: 'TestPassword123!',
    role: 'user',
    isEmailVerified: true,
    isActive: true,
    profile: {
        age: 25,
        gender: 'Male',
        occupation: 'Student',
        country: 'USA'
    },
    preferences: {
        notifications: {
            email: true,
            push: true
        }
    }
};

// Test results tracker
const testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
};

/**
 * Log test result
 */
function logTest(testName, passed, error = null) {
    testResults.total++;
    if (passed) {
        testResults.passed++;
        console.log(`✅ ${testName}`);
    } else {
        testResults.failed++;
        console.log(`❌ ${testName}`);
        if (error) {
            console.log(`   Error: ${error.message}`);
        }
    }
    testResults.tests.push({ name: testName, passed, error: error?.message });
}

/**
 * Print section header
 */
function printHeader(title) {
    console.log('\n' + '='.repeat(80));
    console.log(title);
    console.log('='.repeat(80) + '\n');
}

/**
 * Print test summary
 */
function printSummary() {
    printHeader('📊 TEST SUMMARY');
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%\n`);
    
    if (testResults.failed > 0) {
        console.log('Failed Tests:');
        testResults.tests.filter(t => !t.passed).forEach(t => {
            console.log(`  - ${t.name}: ${t.error}`);
        });
        console.log('');
    }
}

/**
 * Test 1: Email Configuration Verification
 */
async function testEmailConfiguration() {
    printHeader('TEST 1: EMAIL CONFIGURATION VERIFICATION');
    
    try {
        const transporter = require('./config/email');
        
        // Check environment variables
        console.log('Checking environment variables...');
        const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASSWORD', 'EMAIL_FROM'];
        let allVarsPresent = true;
        
        for (const varName of requiredVars) {
            if (!process.env[varName]) {
                console.log(`  ❌ Missing: ${varName}`);
                allVarsPresent = false;
            } else {
                console.log(`  ✅ Found: ${varName}`);
            }
        }
        
        logTest('Environment variables check', allVarsPresent);
        
        if (!allVarsPresent) {
            console.log('\n⚠️  Please configure email settings in .env file');
            return false;
        }
        
        // Verify SMTP connection
        console.log('\nVerifying SMTP connection...');
        await transporter.verify();
        logTest('SMTP connection verification', true);
        
        return true;
    } catch (error) {
        logTest('Email configuration', false, error);
        console.log('\n⚠️  Email configuration failed. Please check your settings.');
        return false;
    }
}

/**
 * Test 2: Email Template Generation
 */
async function testEmailTemplates() {
    printHeader('TEST 2: EMAIL TEMPLATE GENERATION');
    
    const templates = [
        { 
            type: 'welcome', 
            data: { 
                firstName: 'John', 
                verificationCode: '123456'
            } 
        },
        { 
            type: 'emailVerification', 
            data: { 
                firstName: 'Jane', 
                verificationCode: '654321'
            } 
        },
        { 
            type: 'passwordReset', 
            data: { 
                firstName: 'Bob', 
                resetCode: '999888'
            } 
        },
        { 
            type: 'accountActivation', 
            data: { 
                firstName: 'Alice', 
                loginLink: 'http://localhost:3000/login'
            } 
        },
        { 
            type: 'predictionReport', 
            data: {
                firstName: 'Charlie',
                predictionType: 'Mental Wellness',
                prediction: '75.50',
                interpretation: 'Good',
                modelName: 'GradientBoosting',
                date: new Date().toLocaleDateString(),
                recommendations: 'Continue your healthy habits',
                recommendationsList: [
                    'Maintain 7-9 hours of sleep',
                    'Exercise regularly',
                    'Manage stress effectively'
                ]
            }
        },
        {
            type: 'weeklyWellness',
            data: {
                firstName: 'David',
                summary: 'Here is your weekly update',
                hasData: true,
                stats: {
                    mentalWellness: 78.5,
                    stress: 4.2,
                    academic: 3.5,
                    totalPredictions: 12
                },
                recommendations: [
                    { category: 'Sleep', priority: 'High', tip: 'Aim for 7-9 hours' },
                    { category: 'Exercise', priority: 'Medium', tip: 'Exercise 150 min/week' }
                ],
                date: new Date().toLocaleDateString()
            }
        }
    ];
    
    for (const template of templates) {
        try {
            const html = getEmailTemplate(template.type, template.data);
            
            // Validate HTML structure
            const hasHTML = html.includes('<!DOCTYPE html>') && html.includes('</html>');
            const hasContent = html.length > 1000; // Should be substantial
            const hasUserName = html.includes(template.data.firstName);
            
            if (hasHTML && hasContent && hasUserName) {
                logTest(`Template: ${template.type}`, true);
            } else {
                throw new Error('Template validation failed');
            }
        } catch (error) {
            logTest(`Template: ${template.type}`, false, error);
        }
    }
}

/**
 * Test 3: Welcome Email
 */
async function testWelcomeEmail(user) {
    printHeader('TEST 3: WELCOME EMAIL');
    
    try {
        const verificationCode = '123456';
        await emailService.sendWelcomeEmail(user, verificationCode);
        logTest('Send welcome email', true);
        console.log(`  → Email sent to: ${user.email}`);
        console.log(`  → Verification code: ${verificationCode}`);
    } catch (error) {
        logTest('Send welcome email', false, error);
    }
}

/**
 * Test 4: Email Verification
 */
async function testVerificationEmail(user) {
    printHeader('TEST 4: EMAIL VERIFICATION');
    
    try {
        const verificationCode = '654321';
        await emailService.sendVerificationEmail(user, verificationCode);
        logTest('Send verification email', true);
        console.log(`  → Email sent to: ${user.email}`);
        console.log(`  → Verification code: ${verificationCode}`);
    } catch (error) {
        logTest('Send verification email', false, error);
    }
}

/**
 * Test 5: Password Reset Email
 */
async function testPasswordResetEmail(user) {
    printHeader('TEST 5: PASSWORD RESET EMAIL');
    
    try {
        const resetCode = '999888';
        await emailService.sendPasswordResetEmail(user, resetCode);
        logTest('Send password reset email', true);
        console.log(`  → Email sent to: ${user.email}`);
        console.log(`  → Reset code: ${resetCode}`);
    } catch (error) {
        logTest('Send password reset email', false, error);
    }
}

/**
 * Test 6: Account Activation Email
 */
async function testAccountActivationEmail(user) {
    printHeader('TEST 6: ACCOUNT ACTIVATION EMAIL');
    
    try {
        await emailService.sendAccountActivationEmail(user);
        logTest('Send account activation email', true);
        console.log(`  → Email sent to: ${user.email}`);
    } catch (error) {
        logTest('Send account activation email', false, error);
    }
}

/**
 * Test 7: Prediction Report Emails (All Types)
 */
async function testPredictionReportEmails(user) {
    printHeader('TEST 7: PREDICTION REPORT EMAILS');
    
    const predictionTypes = [
        {
            type: 'mental_wellness',
            name: 'Mental Wellness',
            data: {
                predictionType: 'mental_wellness',
                result: {
                    prediction: 75.5,
                    interpretation: 'Good - Your mental wellness is above average',
                    modelName: 'Tuned Gradient Boosting Regressor',
                    confidenceMetrics: {
                        modelR2Score: 0.85,
                        modelMAE: 5.2
                    },
                    inputFeaturesProcessed: 12
                },
                inputData: {
                    age: 25,
                    gender: 'Male',
                    screen_time_hours: 8.5,
                    sleep_hours: 7.5
                },
                createdAt: new Date(),
                _id: new mongoose.Types.ObjectId()
            }
        },
        {
            type: 'academic_impact',
            name: 'Academic Impact',
            data: {
                predictionType: 'academic_impact',
                result: {
                    prediction: 4.2,
                    interpretation: 'Moderate Impact - Monitor your social media usage',
                    modelName: 'Random Forest Classifier',
                    confidenceMetrics: {
                        modelR2Score: 0.78,
                        modelMAE: 0.8
                    },
                    inputFeaturesProcessed: 10
                },
                inputData: {
                    age: 21,
                    academic_level: 'Bachelor',
                    avg_daily_usage_hours: 4.5
                },
                createdAt: new Date(),
                _id: new mongoose.Types.ObjectId()
            }
        },
        {
            type: 'stress_level',
            name: 'Stress Level',
            data: {
                predictionType: 'stress_level',
                result: {
                    prediction: 6.8,
                    interpretation: 'High Stress Level',
                    stressCategory: 'High',
                    modelName: 'Voting Ensemble Regressor',
                    confidenceMetrics: {
                        modelR2Score: 0.82,
                        modelMAE: 0.7
                    },
                    recommendations: [
                        'Practice deep breathing exercises daily',
                        'Improve sleep quality - aim for 7-9 hours',
                        'Reduce screen time by 2 hours per day',
                        'Exercise at least 30 minutes daily',
                        'Consider stress counseling if needed'
                    ],
                    inputFeaturesProcessed: 13
                },
                inputData: {
                    age: 28,
                    occupation: 'Software Engineer',
                    screen_time_hours: 12.5,
                    sleep_hours: 5.5
                },
                createdAt: new Date(),
                _id: new mongoose.Types.ObjectId()
            }
        }
    ];
    
    for (const prediction of predictionTypes) {
        try {
            console.log(`\nTesting ${prediction.name} report email...`);
            await emailService.sendPredictionReportEmail(user, prediction.data);
            logTest(`Prediction report: ${prediction.name}`, true);
            console.log(`  → Email with PDF sent to: ${user.email}`);
            console.log(`  → Prediction score: ${prediction.data.result.prediction}`);
            console.log(`  → Model: ${prediction.data.result.modelName}`);
        } catch (error) {
            logTest(`Prediction report: ${prediction.name}`, false, error);
        }
        
        // Wait 2 seconds between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}

/**
 * Test 8: Weekly Wellness Email
 */
async function testWeeklyWellnessEmail(user) {
    printHeader('TEST 8: WEEKLY WELLNESS EMAIL');
    
    try {
        await weeklyEmailService.sendWeeklyEmailToUser(user);
        logTest('Send weekly wellness email', true);
        console.log(`  → Email sent to: ${user.email}`);
    } catch (error) {
        logTest('Send weekly wellness email', false, error);
    }
}

/**
 * Test 9: Batch Email Sending
 */
async function testBatchEmailSending() {
    printHeader('TEST 9: BATCH EMAIL CAPABILITIES');
    
    try {
        // Test getting weekly recommendations
        const testUser = await User.findOne({ email: TEST_USER.email });
        if (testUser) {
            const recommendations = await weeklyEmailService.getWeeklyRecommendations(testUser);
            
            const hasRecommendations = recommendations.recommendations && 
                                     Array.isArray(recommendations.recommendations) && 
                                     recommendations.recommendations.length > 0;
            
            logTest('Generate weekly recommendations', hasRecommendations);
            
            if (hasRecommendations) {
                console.log(`  → Generated ${recommendations.recommendations.length} recommendations`);
                console.log(`  → Has data: ${recommendations.hasData}`);
            }
        } else {
            logTest('Generate weekly recommendations', false, new Error('Test user not found'));
        }
    } catch (error) {
        logTest('Batch email capabilities', false, error);
    }
}

/**
 * Test 10: Email Error Handling
 */
async function testEmailErrorHandling() {
    printHeader('TEST 10: EMAIL ERROR HANDLING');
    
    try {
        // Test with invalid email
        const invalidUser = { ...TEST_USER, email: 'invalid-email' };
        
        try {
            await emailService.sendWelcomeEmail(invalidUser, '123456');
            logTest('Invalid email handling', false, new Error('Should have thrown error'));
        } catch (error) {
            logTest('Invalid email handling', true);
            console.log('  → Correctly caught invalid email error');
        }
        
        // Test with missing required data
        try {
            await emailService.sendPasswordResetEmail(null, '123456');
            logTest('Null user handling', false, new Error('Should have thrown error'));
        } catch (error) {
            logTest('Null user handling', true);
            console.log('  → Correctly caught null user error');
        }
    } catch (error) {
        logTest('Email error handling', false, error);
    }
}

/**
 * Test 11: Create Sample Predictions for Testing
 */
async function createSamplePredictions(user) {
    printHeader('TEST 11: CREATE SAMPLE PREDICTIONS');
    
    const predictions = [
        {
            user: user._id,
            predictionType: 'mental_wellness',
            inputData: { age: 25, gender: 'Male', sleep_hours: 7.5 },
            result: {
                prediction: 78.5,
                interpretation: 'Good mental wellness',
                modelName: 'Gradient Boosting'
            }
        },
        {
            user: user._id,
            predictionType: 'stress_level',
            inputData: { age: 25, occupation: 'Student' },
            result: {
                prediction: 5.2,
                interpretation: 'Moderate stress',
                stressCategory: 'Moderate',
                modelName: 'Voting Ensemble',
                recommendations: ['Exercise more', 'Sleep better']
            }
        },
        {
            user: user._id,
            predictionType: 'academic_impact',
            inputData: { age: 21, avg_daily_usage_hours: 3.5 },
            result: {
                prediction: 3.8,
                interpretation: 'Low impact',
                modelName: 'Random Forest'
            }
        }
    ];
    
    try {
        for (const predData of predictions) {
            await Prediction.create(predData);
        }
        logTest('Create sample predictions', true);
        console.log(`  → Created ${predictions.length} sample predictions`);
    } catch (error) {
        logTest('Create sample predictions', false, error);
    }
}

/**
 * Cleanup test data
 */
async function cleanupTestData() {
    printHeader('CLEANUP TEST DATA');
    
    try {
        const testUser = await User.findOne({ email: TEST_USER.email });
        if (testUser) {
            // Delete predictions
            const deletedPredictions = await Prediction.deleteMany({ user: testUser._id });
            console.log(`  → Deleted ${deletedPredictions.deletedCount} predictions`);
            
            // Delete user
            await User.deleteOne({ _id: testUser._id });
            console.log(`  → Deleted test user: ${TEST_USER.email}`);
        }
        console.log('✅ Cleanup completed');
    } catch (error) {
        console.log(`⚠️  Cleanup error: ${error.message}`);
    }
}

/**
 * Main test runner
 */
async function runAllTests() {
    console.clear();
    printHeader('🧪 WELLSYNC EMAIL FUNCTIONS TEST SUITE');
    console.log('Testing all email functionalities...\n');
    console.log(`Test Email: ${TEST_USER.email}`);
    console.log(`Date: ${new Date().toLocaleString()}\n`);
    
    let testUser = null;
    
    try {
        // Connect to database
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');
        
        // Test 1: Email Configuration
        const configValid = await testEmailConfiguration();
        if (!configValid) {
            console.log('\n⚠️  Skipping email sending tests due to configuration issues\n');
            printSummary();
            return;
        }
        
        // Test 2: Email Templates
        await testEmailTemplates();
        
        // Create or find test user
        printHeader('SETUP: CREATE TEST USER');
        testUser = await User.findOne({ email: TEST_USER.email });
        if (testUser) {
            console.log('  → Using existing test user');
        } else {
            testUser = await User.create(TEST_USER);
            console.log('  → Created new test user');
        }
        console.log(`  → User ID: ${testUser._id}\n`);
        
        // Test 3-8: Email sending functions
        await testWelcomeEmail(testUser);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        await testVerificationEmail(testUser);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        await testPasswordResetEmail(testUser);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        await testAccountActivationEmail(testUser);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        await testPredictionReportEmails(testUser);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test 11: Create sample predictions
        await createSamplePredictions(testUser);
        
        await testWeeklyWellnessEmail(testUser);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test 9-10: Advanced features
        await testBatchEmailSending();
        await testEmailErrorHandling();
        
        // Print summary
        printSummary();
        
        // Final instructions
        printHeader('📧 CHECK YOUR EMAIL INBOX');
        console.log(`Email Address: ${TEST_USER.email}\n`);
        console.log('You should have received the following emails:');
        console.log('  1. ✉️  Welcome Email with verification code');
        console.log('  2. ✉️  Email Verification');
        console.log('  3. ✉️  Password Reset with reset code');
        console.log('  4. ✉️  Account Activation confirmation');
        console.log('  5. ✉️  Mental Wellness Report (with PDF)');
        console.log('  6. ✉️  Academic Impact Report (with PDF)');
        console.log('  7. ✉️  Stress Level Report (with PDF)');
        console.log('  8. ✉️  Weekly Wellness Update (with PDF)\n');
        
        console.log('💡 Tips:');
        console.log('  - Check your spam/junk folder if emails are missing');
        console.log('  - PDFs are attached to prediction reports AND weekly wellness emails');
        console.log('  - Weekly PDF includes: prediction history, trends, recommendations & summary');
        console.log('  - Verify all email templates display correctly\n');
        
        // Ask about cleanup
        console.log('⚠️  Test user and predictions remain in database for inspection');
        console.log('   Run with --cleanup flag to remove test data\n');
        
        if (process.argv.includes('--cleanup')) {
            await cleanupTestData();
        }
        
    } catch (error) {
        console.error('\n❌ TEST SUITE FAILED!');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        // Disconnect from database
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
            console.log('✅ Disconnected from MongoDB\n');
        }
    }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
    console.log('\n📧 WellSync Email Functions Test Suite\n');
    console.log('Usage: node test-email-functions.js [options]\n');
    console.log('Options:');
    console.log('  --help, -h     Show this help message');
    console.log('  --cleanup      Delete test data after completion');
    console.log('\nEnvironment Variables:');
    console.log('  TEST_EMAIL     Email address for testing (defaults to EMAIL_USER)');
    console.log('  MONGODB_URI    MongoDB connection string');
    console.log('  EMAIL_*        Email configuration (HOST, PORT, USER, PASSWORD, FROM)\n');
    process.exit(0);
}

// Run the test suite
runAllTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
