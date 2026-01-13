/**
 * Backend Testing Script
 * Tests all major endpoints and functionality
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let testUserId = '';
let testPredictionId = '';

// Test results tracking
const results = {
    passed: 0,
    failed: 0,
    tests: []
};

// Helper function to log test results
function logTest(name, passed, message = '') {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${name}${message ? ': ' + message : ''}`);
    
    results.tests.push({ name, passed, message });
    if (passed) results.passed++;
    else results.failed++;
}

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, token = null) {
    try {
        const config = {
            method,
            url: `${BASE_URL}${endpoint}`,
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        };
        
        if (data) {
            config.data = data;
        }
        
        const response = await axios(config);
        return { success: true, data: response.data, status: response.status };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data || error.message,
            status: error.response?.status
        };
    }
}

// Test 1: Health Check
async function testHealthCheck() {
    console.log('\n🧪 Test 1: Health Check');
    const result = await apiCall('GET', '/health');
    logTest('Health check', result.success && result.data.success);
}

// Test 2: User Registration
async function testUserRegistration() {
    console.log('\n🧪 Test 2: User Registration');
    
    const testUser = {
        firstName: 'Test',
        lastName: 'User',
        email: `test${Date.now()}@example.com`,
        password: 'TestPass123',
        confirmPassword: 'TestPass123'
    };
    
    const result = await apiCall('POST', '/auth/register', testUser);
    
    if (result.success) {
        authToken = result.data.data.token;
        testUserId = result.data.data.user.id;
        logTest('User registration', true);
    } else {
        logTest('User registration', false, result.error.error);
    }
}

// Test 3: User Login
async function testUserLogin() {
    console.log('\n🧪 Test 3: User Login');
    
    // Use the registered user (or a pre-existing one)
    const loginData = {
        email: 'test@example.com',
        password: 'TestPass123'
    };
    
    const result = await apiCall('POST', '/auth/login', loginData);
    
    if (result.success) {
        authToken = result.data.data.token;
        logTest('User login', true);
    } else {
        logTest('User login', false, 'Using registration token instead');
        // Use the token from registration if login fails
    }
}

// Test 4: Get Current User
async function testGetCurrentUser() {
    console.log('\n🧪 Test 4: Get Current User');
    
    const result = await apiCall('GET', '/auth/me', null, authToken);
    logTest('Get current user', result.success && result.data.success);
}

// Test 5: Mental Wellness Prediction
async function testMentalWellnessPrediction() {
    console.log('\n🧪 Test 5: Mental Wellness Prediction');
    
    const predictionData = {
        age: 28,
        gender: 'Male',
        occupation: 'Software Engineer',
        work_mode: 'Hybrid',
        screen_time_hours: 9.5,
        work_screen_hours: 7.0,
        leisure_screen_hours: 2.5,
        sleep_hours: 7.0,
        sleep_quality_1_5: 4,
        stress_level_0_10: 5,
        productivity_0_100: 75,
        exercise_minutes_per_week: 180,
        social_hours_per_week: 10.0
    };
    
    const result = await apiCall('POST', '/predictions/mental-wellness', predictionData, authToken);
    
    if (result.success) {
        testPredictionId = result.data.data.prediction.id;
        logTest('Mental wellness prediction', true, `Score: ${result.data.data.prediction.score}`);
    } else {
        logTest('Mental wellness prediction', false, result.error.error);
    }
}

// Test 6: Academic Impact Prediction
async function testAcademicImpactPrediction() {
    console.log('\n🧪 Test 6: Academic Impact Prediction');
    
    const predictionData = {
        age: 21,
        gender: 'Female',
        academic_level: 'Bachelor',
        country: 'USA',
        most_used_platform: 'Instagram',
        avg_daily_usage_hours: 4.5,
        sleep_hours_per_night: 6.5,
        mental_health_score: 6,
        conflicts_over_social_media: 2,
        affects_academic_performance: 'Yes',
        relationship_status: 'Single'
    };
    
    const result = await apiCall('POST', '/predictions/academic-impact', predictionData, authToken);
    logTest('Academic impact prediction', result.success, result.success ? `Score: ${result.data.data.prediction.score}` : result.error.error);
}

// Test 7: Get All Predictions
async function testGetPredictions() {
    console.log('\n🧪 Test 7: Get All Predictions');
    
    const result = await apiCall('GET', '/predictions', null, authToken);
    logTest('Get all predictions', result.success && result.data.success);
}

// Test 8: Get User Statistics
async function testGetUserStats() {
    console.log('\n🧪 Test 8: Get User Statistics');
    
    const result = await apiCall('GET', '/predictions/stats', null, authToken);
    logTest('Get user statistics', result.success && result.data.success);
}

// Test 9: Get User Dashboard
async function testGetDashboard() {
    console.log('\n🧪 Test 9: Get User Dashboard');
    
    const result = await apiCall('GET', '/users/dashboard', null, authToken);
    logTest('Get user dashboard', result.success && result.data.success);
}

// Test 10: Get Notifications
async function testGetNotifications() {
    console.log('\n🧪 Test 10: Get Notifications');
    
    const result = await apiCall('GET', '/notifications', null, authToken);
    logTest('Get notifications', result.success && result.data.success);
}

// Test 11: Get Analytics Insights
async function testGetInsights() {
    console.log('\n🧪 Test 11: Get Analytics Insights');
    
    const result = await apiCall('GET', '/analytics/insights', null, authToken);
    logTest('Get analytics insights', result.success && result.data.success);
}

// Test 12: Update Profile
async function testUpdateProfile() {
    console.log('\n🧪 Test 12: Update Profile');
    
    const profileData = {
        profile: {
            age: 28,
            gender: 'Male',
            country: 'USA'
        }
    };
    
    const result = await apiCall('PUT', '/users/profile', profileData, authToken);
    logTest('Update profile', result.success && result.data.success);
}

// Test 13: Get Models Info
async function testGetModelsInfo() {
    console.log('\n🧪 Test 13: Get Models Info');
    
    const result = await apiCall('GET', '/models/info');
    logTest('Get models info', result.success);
}

// Test 14: Invalid Token (should fail)
async function testInvalidToken() {
    console.log('\n🧪 Test 14: Invalid Token (Expected Failure)');
    
    const result = await apiCall('GET', '/auth/me', null, 'invalid_token');
    logTest('Invalid token rejected', !result.success && result.status === 401);
}

// Test 15: Missing Required Fields (should fail)
async function testValidationError() {
    console.log('\n🧪 Test 15: Validation Error (Expected Failure)');
    
    const invalidData = {
        age: 'invalid',
        gender: 'Male'
        // Missing required fields
    };
    
    const result = await apiCall('POST', '/predictions/mental-wellness', invalidData, authToken);
    logTest('Validation error caught', !result.success && result.status === 400);
}

// Check if services are running before tests
async function checkServices() {
    console.log('🔍 Checking if services are running...\n');
    
    const services = {
        backend: { url: 'http://localhost:5000/api/health', name: 'Backend API', running: false },
        ai: { url: 'http://localhost:8000/health', name: 'FastAPI AI Service', running: false }
    };
    
    for (const [key, service] of Object.entries(services)) {
        try {
            const response = await axios.get(service.url, { timeout: 2000 });
            service.running = true;
            console.log(`✅ ${service.name} is running`);
        } catch (error) {
            console.log(`❌ ${service.name} is NOT running`);
            console.log(`   Please start: ${service.url}`);
        }
    }
    
    console.log('');
    
    if (!services.backend.running || !services.ai.running) {
        console.log('⚠️  SERVICES NOT RUNNING - TESTS CANNOT PROCEED\n');
        console.log('Please start the required services:\n');
        console.log('1. MongoDB:');
        console.log('   net start MongoDB\n');
        console.log('2. FastAPI AI Service (Terminal 1):');
        console.log('   cd ai/api');
        console.log('   python main.py\n');
        console.log('3. Backend Server (Terminal 2):');
        console.log('   cd backend');
        console.log('   npm run dev\n');
        console.log('Then run the tests again.\n');
        return false;
    }
    
    return true;
}

// Main test runner
async function runTests() {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 WELLSYNC BACKEND TEST SUITE');
    console.log('='.repeat(60) + '\n');
    
    // Check if services are running first
    const servicesReady = await checkServices();
    if (!servicesReady) {
        return;
    }
    
    console.log('✅ All services are running. Starting tests...\n');
    console.log('='.repeat(60));
    
    try {
        await testHealthCheck();
        await testUserRegistration();
        // await testUserLogin(); // Skip if registration provides token
        await testGetCurrentUser();
        await testMentalWellnessPrediction();
        await testAcademicImpactPrediction();
        await testGetPredictions();
        await testGetUserStats();
        await testGetDashboard();
        await testGetNotifications();
        await testGetInsights();
        await testUpdateProfile();
        await testGetModelsInfo();
        await testInvalidToken();
        await testValidationError();
        
        // Print summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total Tests: ${results.passed + results.failed}`);
        console.log(`✅ Passed: ${results.passed}`);
        console.log(`❌ Failed: ${results.failed}`);
        console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(2)}%`);
        console.log('='.repeat(60) + '\n');
        
        if (results.failed > 0) {
            console.log('❌ Failed Tests:');
            results.tests.filter(t => !t.passed).forEach(t => {
                console.log(`   - ${t.name}: ${t.message}`);
            });
        }
        
    } catch (error) {
        console.error('\n❌ Test suite error:', error.message);
    }
}

// Run tests
runTests();
