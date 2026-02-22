'use strict';

const jwt = require('jsonwebtoken');

// ── Valid payload samples ────────────────────────────────────────────────────

const VALID_REGISTER_PAYLOAD = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@test.com',
  password: 'Password123',
  confirmPassword: 'Password123',
};

const VALID_LOGIN_PAYLOAD = {
  email: 'john.doe@test.com',
  password: 'Password123',
};

const VALID_MENTAL_WELLNESS_PAYLOAD = {
  age: 28,
  gender: 'Male',
  occupation: 'Software Engineer',
  work_mode: 'Hybrid',
  screen_time_hours: 8.0,
  work_screen_hours: 5.0,
  leisure_screen_hours: 3.0,
  sleep_hours: 7.0,
  sleep_quality_1_5: 3,
  stress_level_0_10: 5,
  productivity_0_100: 70,
  exercise_minutes_per_week: 150,
  social_hours_per_week: 10.0,
};

const VALID_STRESS_PAYLOAD = {
  age: 28,
  gender: 'Male',
  occupation: 'Software Engineer',
  work_mode: 'Hybrid',
  screen_time_hours: 8.0,
  work_screen_hours: 5.0,
  leisure_screen_hours: 3.0,
  sleep_hours: 7.0,
  sleep_quality_1_5: 3,
  productivity_0_100: 70,
  exercise_minutes_per_week: 150,
  social_hours_per_week: 10.0,
  mental_wellness_index_0_100: 65.0,
};

const VALID_ACADEMIC_PAYLOAD = {
  age: 21,
  gender: 'Female',
  academic_level: 'Bachelor',
  country: 'Sri Lanka',
  most_used_platform: 'Instagram',
  avg_daily_usage_hours: 4.5,
  sleep_hours_per_night: 6.5,
  mental_health_score: 60,
  conflicts_over_social_media: 2,
  affects_academic_performance: 'Yes',
  relationship_status: 'Single',
};

// ── Token helpers ────────────────────────────────────────────────────────────

/**
 * Generate a JWT token for a mock user
 */
function generateToken(userId, role = 'user') {
  return jwt.sign(
    { id: userId, email: 'test@wellsync.lk', role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
}

/**
 * Generate an expired JWT token
 */
function generateExpiredToken(userId) {
  return jwt.sign(
    { id: userId, email: 'test@wellsync.lk', role: 'user' },
    process.env.JWT_SECRET,
    { expiresIn: '-1s' }
  );
}

/**
 * Generate a malformed token string
 */
function generateInvalidToken() {
  return 'invalid.token.string';
}

// ── Mock AI service response factory ─────────────────────────────────────────

function mockMentalWellnessResponse() {
  return {
    prediction: 72.5,
    interpretation: 'Good mental wellness',
    model_name: 'Voting Ensemble',
    confidence_metrics: { r2_score: 0.89, mae: 4.2 },
    input_features_processed: 25,
    status: 'success',
  };
}

function mockStressResponse() {
  return {
    prediction: 6.2,
    stress_category: 'Moderate',
    interpretation: 'Moderate stress level detected.',
    recommendations: ['Improve sleep schedule', 'Reduce screen time'],
    model_info: { model_name: 'Stress Classifier' },
    status: 'success',
  };
}

function mockAcademicResponse() {
  return {
    prediction: 5.3,
    interpretation: 'Moderate addiction risk',
    model_name: 'Gradient Boosting',
    confidence_metrics: { r2_score: 0.85, mae: 0.6 },
    input_features_processed: 20,
    status: 'success',
  };
}

module.exports = {
  VALID_REGISTER_PAYLOAD,
  VALID_LOGIN_PAYLOAD,
  VALID_MENTAL_WELLNESS_PAYLOAD,
  VALID_STRESS_PAYLOAD,
  VALID_ACADEMIC_PAYLOAD,
  generateToken,
  generateExpiredToken,
  generateInvalidToken,
  mockMentalWellnessResponse,
  mockStressResponse,
  mockAcademicResponse,
};
