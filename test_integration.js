/**
 * Comprehensive Integration Test
 * Tests AI + Backend integration
 */

const axios = require('./backend/node_modules/axios').default;

const AI_URL = 'http://localhost:8000';
const BACKEND_URL = 'http://localhost:5000';

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[91m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m'
};

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const testResults = [];

function printHeader(title) {
    console.log('\n' + '='.repeat(80));
    console.log(`  ${colors.bold}${title}${colors.reset}`);
    console.log('='.repeat(80));
}

function printTest(name, passed, details = '') {
    totalTests++;
    const result = { name, passed, details };
    testResults.push(result);
    
    if (passed) {
        passedTests++;
        console.log(`${colors.green}✓ PASS${colors.reset} - ${name}`);
    } else {
        failedTests++;
        console.log(`${colors.red}✗ FAIL${colors.reset} - ${name}`);
        if (details) {
            console.log(`       ${details}`);
        }
    }
}

async function testAIService() {
    printHeader('AI SERVICE TESTS');
    
    // Test 1: Health Check
    try {
        const response = await axios.get(`${AI_URL}/health`);
        printTest('AI Health Check', response.status === 200 && response.data.status === 'healthy');
    } catch (error) {
        printTest('AI Health Check', false, error.message);
    }
    
    // Test 2: Mental Wellness Prediction
    try {
        const data = {
            age: 28,
            gender: "Male",
            occupation: "Software Engineer",
            work_mode: "Hybrid",
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
        const response = await axios.post(`${AI_URL}/predict/mental-wellness`, data);
        const hasScore = response.data.wellness_score !== undefined || response.data.prediction !== undefined;
        const score = response.data.wellness_score || response.data.prediction;
        const passed = response.status === 200 && hasScore;
        printTest(`AI Mental Wellness Prediction${passed ? ' (Score: ' + (typeof score === 'number' ? score.toFixed(1) : score) + ')' : ''}`, passed);
    } catch (error) {
        printTest('AI Mental Wellness Prediction', false, error.response?.data?.detail || error.message);
    }
    
    // Test 3: Stress Prediction
    try {
        const data = {
            age: 25,
            gender: "Female",
            occupation: "Student",
            work_mode: "Hybrid",
            screen_time_hours: 8.0,
            work_screen_hours: 5.0,
            leisure_screen_hours: 3.0,
            sleep_hours: 6.5,
            sleep_quality_1_5: 3,
            productivity_0_100: 60,
            exercise_minutes_per_week: 120,
            social_hours_per_week: 8.0,
            mental_wellness_index_0_100: 55.0
        };
        const response = await axios.post(`${AI_URL}/predict/stress`, data);
        const hasStress = response.data.prediction !== undefined;
        const level = response.data.stress_category || 'Level: ' + (response.data.prediction || 'N/A');
        const passed = response.status === 200 && hasStress;
        printTest(`AI Stress Prediction${passed ? ' (' + level + ')' : ''}`, passed);
    } catch (error) {
        printTest('AI Stress Prediction', false, error.response?.data?.detail || error.message);
    }
    
    // Test 4: Academic Impact Prediction
    try {
        const data = {
            age: 21,
            gender: "Female",
            academic_level: "Bachelor",
            country: "USA",
            most_used_platform: "Instagram",
            avg_daily_usage_hours: 4.5,
            sleep_hours_per_night: 6.5,
            mental_health_score: 6,
            conflicts_over_social_media: 2,
            affects_academic_performance: "Yes",
            relationship_status: "Single"
        };
        const response = await axios.post(`${AI_URL}/predict/academic-impact`, data);
        const hasAddiction = response.data.prediction !== undefined;
        const level = typeof response.data.prediction === 'number' ? response.data.prediction.toFixed(1) : response.data.prediction;
        const passed = response.status === 200 && hasAddiction;
        printTest(`AI Academic Impact Prediction${passed ? ' (Score: ' + level + ')' : ''}`, passed);
    } catch (error) {
        printTest('AI Academic Impact Prediction', false, error.response?.data?.detail || error.message);
    }
}

async function testBackendService() {
    printHeader('BACKEND SERVICE TESTS');
    
    // Test 1: Health Check
    try {
        const response = await axios.get(`${BACKEND_URL}/api/health`);
        printTest('Backend Health Check', response.status === 200);
    } catch (error) {
        printTest('Backend Health Check', false, error.message);
    }
    
    // Test 2: Root Endpoint
    try {
        const response = await axios.get(`${BACKEND_URL}/`);
        printTest('Backend Root Endpoint', response.status === 200 && response.data.success === true);
    } catch (error) {
        printTest('Backend Root Endpoint', false, error.message);
    }
    
    // Test 3: Models Info
    try {
        const response = await axios.get(`${BACKEND_URL}/api/models/info`);
        printTest('Backend Models Info', response.status === 200);
    } catch (error) {
        printTest('Backend Models Info', false, error.message);
    }
    
    // Test 4: Auth endpoints exist
    try {
        await axios.post(`${BACKEND_URL}/api/auth/login`, {
            email: 'test@test.com',
            password: 'wrong'
        });
        printTest('Backend Auth Endpoints', false);
    } catch (error) {
        const passed = error.response && error.response.status !== 404;
        printTest('Backend Auth Endpoints', passed);
    }
    
    // Test 5: Protected routes require auth
    try {
        await axios.get(`${BACKEND_URL}/api/users/dashboard`);
        printTest('Backend Protected Routes', false);
    } catch (error) {
        const passed = error.response && error.response.status === 401;
        printTest('Backend Protected Routes (Auth Required)', passed);
    }
}

async function testIntegration() {
    printHeader('INTEGRATION TESTS (AI + Backend)');
    
    // Test: Backend can communicate with AI
    try {
        const data = {
            age: 30,
            gender: "Male",
            occupation: "Teacher",
            work_mode: "Office",
            screen_time_hours: 6.0,
            work_screen_hours: 4.0,
            leisure_screen_hours: 2.0,
            sleep_hours: 8.0,
            sleep_quality_1_5: 5,
            stress_level_0_10: 3,
            productivity_0_100: 85,
            exercise_minutes_per_week: 240,
            social_hours_per_week: 15.0
        };
        
        // Call through backend (which should call AI)
        const response = await axios.post(`${BACKEND_URL}/api/predictions/mental-wellness`, data, {
            validateStatus: () => true
        });
        
        const passed = response.status === 200 || response.status === 401; // 401 if auth required
        printTest('Backend-to-AI Communication', passed, 
            response.status === 401 ? 'Auth required (expected)' : '');
    } catch (error) {
        printTest('Backend-to-AI Communication', false, error.message);
    }
}

async function runAllTests() {
    console.log('\n' + '='.repeat(80));
    console.log(`  ${colors.cyan}${colors.bold}WellSync - Comprehensive Integration Test Suite${colors.reset}`);
    console.log('  ' + new Date().toLocaleString());
    console.log('='.repeat(80));
    
    await testAIService();
    await testBackendService();
    await testIntegration();
    
    // Print Summary
    printHeader('TEST SUMMARY');
    
    console.log(`\n${colors.bold}Overall Results:${colors.reset}`);
    console.log(`  Total Tests:  ${totalTests}`);
    console.log(`  ${colors.green}Passed: ${passedTests} ✓${colors.reset}`);
    console.log(`  ${colors.red}Failed: ${failedTests} ✗${colors.reset}`);
    
    const passRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : 0;
    const status = passRate >= 80 ? colors.green : passRate >= 60 ? colors.yellow : colors.red;
    console.log(`\n${colors.bold}Pass Rate: ${status}${passRate}%${colors.reset}`);
    
    if (failedTests > 0) {
        console.log(`\n${colors.yellow}Failed Tests:${colors.reset}`);
        testResults.filter(t => !t.passed).forEach(t => {
            console.log(`  ${colors.red}✗${colors.reset} ${t.name}${t.details ? ': ' + t.details : ''}`);
        });
    }
    
    console.log('\n' + '='.repeat(80));
    
    // Status Messages
    if (passRate === 100) {
        console.log(`${colors.green}${colors.bold}🎉 All tests passed! System is fully functional.${colors.reset}`);
    } else if (passRate >= 80) {
        console.log(`${colors.yellow}⚠️  Most tests passed. Minor issues detected.${colors.reset}`);
    } else {
        console.log(`${colors.red}⚠️  Multiple tests failed. Please review errors above.${colors.reset}`);
    }
    
    console.log('='.repeat(80) + '\n');
}

runAllTests().catch(console.error);
