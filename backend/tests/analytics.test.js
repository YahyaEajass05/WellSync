/**
 * Analytics API Tests
 * Comprehensive test suite for /api/analytics endpoints
 *
 * Uses Jest + Supertest with mocked:
 *  - MongoDB (jest.mock on User/Prediction/Notification/Analytics models)
 *  - Email service (nodemailer)
 *  - AI service
 *  - Database connection
 *  - Rate limiters
 */

// ─── Mocks (must be declared before any require of the app) ───────────────────

jest.mock('../config/database', () => jest.fn().mockResolvedValue(true));

jest.mock('../utils/emailService', () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue(true),
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
  sendAccountActivationEmail: jest.fn().mockResolvedValue(true),
  sendPredictionReportEmail: jest.fn().mockResolvedValue(true),
  sendBroadcastEmail: jest.fn().mockResolvedValue(true),
}));

jest.mock('../utils/aiService', () => ({
  checkAIServiceHealth: jest.fn().mockResolvedValue({ status: 'healthy' }),
  predictMentalWellness: jest.fn(),
  predictStressLevel: jest.fn(),
  predictAcademicImpact: jest.fn(),
  getModelsInfo: jest.fn().mockResolvedValue({}),
  getAvailableModels: jest.fn().mockResolvedValue({}),
  getExampleData: jest.fn().mockResolvedValue({}),
}));

jest.mock('../middleware/rateLimiter', () => ({
  apiLimiter: (req, res, next) => next(),
  authLimiter: (req, res, next) => next(),
  emailLimiter: (req, res, next) => next(),
  predictionLimiter: (req, res, next) => next(),
  generalLimiter: (req, res, next) => next(),
  adminLimiter: (req, res, next) => next(),
}));

jest.mock('../utils/notificationService', () => ({
  notifyEmailVerified: jest.fn().mockResolvedValue(true),
  notifyPasswordChanged: jest.fn().mockResolvedValue(true),
  notifyPredictionCompleted: jest.fn().mockResolvedValue(true),
  notifyMilestone: jest.fn().mockResolvedValue(true),
  notifyWeeklySummary: jest.fn().mockResolvedValue(true),
  sendSystemAlert: jest.fn().mockResolvedValue(true),
  notifyAccountUpdated: jest.fn().mockResolvedValue(true),
  sendBatchNotifications: jest.fn().mockResolvedValue(true),
  sendNotification: jest.fn().mockResolvedValue(true),
}));

jest.mock('../models/User');
jest.mock('../models/Notification');
jest.mock('../models/Analytics');
jest.mock('../models/Prediction');

// ─── Port override: must happen before server is required ─────────────────────
// setup.js sets PORT=5001; override here so this suite binds to a unique port.
process.env.PORT = '5003';

// ─── Imports (after mocks) ────────────────────────────────────────────────────

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../server');
const User = require('../models/User');
const Prediction = require('../models/Prediction');
const Analytics = require('../models/Analytics');

// ─── Test environment setup ───────────────────────────────────────────────────

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing';
process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret';
process.env.JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '30d';
process.env.NODE_ENV = 'test';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Creates a mock user document with all methods the auth middleware relies on.
 */
function buildMockUser(overrides = {}) {
  return {
    _id: new mongoose.Types.ObjectId(),
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@test.com',
    role: 'user',
    isEmailVerified: true,
    isActive: true,
    isSystemAdmin: false,
    loginAttempts: 0,
    lockUntil: null,
    profile: {},
    preferences: {
      notifications: { email: true, push: true },
      theme: 'auto',
    },
    createdAt: new Date(),
    lastLogin: null,
    comparePassword: jest.fn().mockResolvedValue(true),
    generateAuthToken: jest.fn().mockReturnValue('mock-jwt-token'),
    generateRefreshToken: jest.fn().mockReturnValue('mock-refresh-token'),
    generateEmailVerificationCode: jest.fn().mockReturnValue('123456'),
    generatePasswordResetCode: jest.fn().mockReturnValue('654321'),
    isLocked: jest.fn().mockReturnValue(false),
    incLoginAttempts: jest.fn().mockResolvedValue(true),
    resetLoginAttempts: jest.fn().mockResolvedValue(true),
    isSystemAdminAccount: jest.fn().mockReturnValue(false),
    save: jest.fn().mockResolvedValue(true),
    ...overrides,
  };
}

/**
 * Signs a real JWT so the protect middleware can verify it in tests.
 */
function signToken(payload = {}) {
  return jwt.sign(
    { id: new mongoose.Types.ObjectId().toString(), email: 'jane@test.com', role: 'user', ...payload },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

/**
 * Sets up User.findById mock for the protect middleware.
 */
function mockAuthUser(mockUser) {
  User.findById.mockImplementation(() => ({
    select: jest.fn().mockResolvedValue(mockUser),
    then: (resolve) => resolve(mockUser),
  }));
}

/**
 * Creates a mock prediction document.
 */
function buildMockPrediction(overrides = {}) {
  return {
    _id: new mongoose.Types.ObjectId(),
    user: new mongoose.Types.ObjectId(),
    predictionType: 'mental_wellness',
    inputData: { screen_time_hours: 8, sleep_hours: 7 },
    result: {
      prediction: 72.5,
      interpretation: 'Good mental wellness',
      modelName: 'Voting Ensemble',
    },
    isFavorite: false,
    createdAt: new Date(),
    ...overrides,
  };
}

// ─── Reset all mocks between tests ───────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

// =============================================================================
// 1. GET /api/analytics/:period  (dashboard / period analytics)
// =============================================================================

describe('GET /api/analytics/:period', () => {
  it('should return 200 with analytics data for a valid period', async () => {
    const mockUser = buildMockUser();
    const token = signToken({ id: mockUser._id.toString() });
    mockAuthUser(mockUser);

    const mockAnalytics = [
      {
        _id: new mongoose.Types.ObjectId(),
        user: mockUser._id,
        period: 'weekly',
        periodDate: new Date(),
        metrics: {
          totalPredictions: 5,
          mentalWellness: { count: 3, average: 72.5, trend: 'stable' },
          stressLevel: { count: 1, average: 5.0, trend: 'stable' },
          academicImpact: { count: 1, average: 4.0, trend: 'stable' },
        },
      },
    ];

    Analytics.getAnalytics = jest.fn().mockResolvedValue(mockAnalytics);

    const res = await request(app)
      .get('/api/analytics/weekly')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('period', 'weekly');
    expect(res.body.data).toHaveProperty('analytics');
  });

  it('should return 400 for an invalid period value', async () => {
    const mockUser = buildMockUser();
    const token = signToken({ id: mockUser._id.toString() });
    mockAuthUser(mockUser);

    const res = await request(app)
      .get('/api/analytics/invalid-period')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 when no Authorization token is provided', async () => {
    const res = await request(app).get('/api/analytics/weekly');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not authorized/i);
  });

  it('should accept all valid period values: daily, weekly, monthly, yearly', async () => {
    const mockUser = buildMockUser();
    const token = signToken({ id: mockUser._id.toString() });
    mockAuthUser(mockUser);

    Analytics.getAnalytics = jest.fn().mockResolvedValue([]);

    const validPeriods = ['daily', 'weekly', 'monthly', 'yearly'];

    for (const period of validPeriods) {
      mockAuthUser(mockUser); // re-mock for each request
      const res = await request(app)
        .get(`/api/analytics/${period}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.period).toBe(period);
    }
  });

  it('should return analytics data with the correct structure including period and analytics array', async () => {
    const mockUser = buildMockUser();
    const token = signToken({ id: mockUser._id.toString() });
    mockAuthUser(mockUser);

    Analytics.getAnalytics = jest.fn().mockResolvedValue([
      {
        period: 'monthly',
        metrics: { totalPredictions: 10 },
      },
    ]);

    const res = await request(app)
      .get('/api/analytics/monthly')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      period: 'monthly',
    });
    expect(res.body.data).toHaveProperty('analytics');
  });
});

// =============================================================================
// 2. POST /api/analytics/generate  (generate analytics with live prediction data)
// =============================================================================

describe('POST /api/analytics/generate', () => {
  it('should return 200 with generated analytics including metrics', async () => {
    const mockUser = buildMockUser();
    const token = signToken({ id: mockUser._id.toString() });
    mockAuthUser(mockUser);

    const mockPredictions = [
      buildMockPrediction({ predictionType: 'mental_wellness', result: { prediction: 72.5, interpretation: 'Good' } }),
      buildMockPrediction({ predictionType: 'stress_level', result: { prediction: 5.0, interpretation: 'Moderate' } }),
    ];

    Prediction.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockPredictions),
      }),
    });
    Analytics.updateAnalytics = jest.fn().mockResolvedValue({});

    const res = await request(app)
      .post('/api/analytics/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ period: 'weekly' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('analytics');
    expect(res.body.data.analytics).toHaveProperty('metrics');
  });

  it('should include a breakdown of predictions by type in the metrics', async () => {
    const mockUser = buildMockUser();
    const token = signToken({ id: mockUser._id.toString() });
    mockAuthUser(mockUser);

    const mockPredictions = [
      buildMockPrediction({ predictionType: 'mental_wellness', result: { prediction: 80.0, interpretation: 'Excellent' } }),
      buildMockPrediction({ predictionType: 'mental_wellness', result: { prediction: 75.0, interpretation: 'Good' } }),
      buildMockPrediction({ predictionType: 'academic_impact', result: { prediction: 3.5, interpretation: 'Low risk' } }),
    ];

    Prediction.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockPredictions),
      }),
    });
    Analytics.updateAnalytics = jest.fn().mockResolvedValue({});

    const res = await request(app)
      .post('/api/analytics/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ period: 'monthly' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const { metrics } = res.body.data.analytics;
    expect(metrics).toHaveProperty('mentalWellness');
    expect(metrics).toHaveProperty('stressLevel');
    expect(metrics).toHaveProperty('academicImpact');
    expect(metrics.mentalWellness.count).toBe(2);
    expect(metrics.academicImpact.count).toBe(1);
  });

  it('should return 401 when no token is provided', async () => {
    const res = await request(app)
      .post('/api/analytics/generate')
      .send({ period: 'weekly' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not authorized/i);
  });

  it('should include totalPredictions count in the generated metrics', async () => {
    const mockUser = buildMockUser();
    const token = signToken({ id: mockUser._id.toString() });
    mockAuthUser(mockUser);

    const mockPredictions = [
      buildMockPrediction({ predictionType: 'mental_wellness', result: { prediction: 65.0, interpretation: 'Moderate' } }),
      buildMockPrediction({ predictionType: 'stress_level', result: { prediction: 4.0, interpretation: 'Moderate' } }),
      buildMockPrediction({ predictionType: 'academic_impact', result: { prediction: 2.0, interpretation: 'Low' } }),
    ];

    Prediction.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockPredictions),
      }),
    });
    Analytics.updateAnalytics = jest.fn().mockResolvedValue({});

    const res = await request(app)
      .post('/api/analytics/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ period: 'weekly' });

    expect(res.status).toBe(200);
    expect(res.body.data.analytics.metrics.totalPredictions).toBe(3);
  });

  it('should include weekly stats in the generated analytics', async () => {
    const mockUser = buildMockUser();
    const token = signToken({ id: mockUser._id.toString() });
    mockAuthUser(mockUser);

    Prediction.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      }),
    });
    Analytics.updateAnalytics = jest.fn().mockResolvedValue({});

    const res = await request(app)
      .post('/api/analytics/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ period: 'weekly' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.analytics).toHaveProperty('period', 'weekly');
    expect(res.body.data.analytics).toHaveProperty('periodDate');
    expect(res.body.data.analytics).toHaveProperty('metrics');
  });
});

// =============================================================================
// 3. GET /api/analytics/insights
// =============================================================================

describe('GET /api/analytics/insights', () => {
  it('should return 200 with an array of insights for the current user', async () => {
    const mockUser = buildMockUser();
    const token = signToken({ id: mockUser._id.toString() });
    mockAuthUser(mockUser);

    const mockPredictions = [
      buildMockPrediction({ predictionType: 'mental_wellness', result: { prediction: 72.5, interpretation: 'Good' } }),
    ];

    Prediction.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockPredictions),
      }),
    });

    const res = await request(app)
      .get('/api/analytics/insights')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('insights');
    expect(Array.isArray(res.body.data.insights)).toBe(true);
  });

  it('should return 401 when no token is provided', async () => {
    const res = await request(app).get('/api/analytics/insights');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not authorized/i);
  });

  it('should include recommendations in insights when predictions exist', async () => {
    const mockUser = buildMockUser();
    const token = signToken({ id: mockUser._id.toString() });
    mockAuthUser(mockUser);

    const mockPredictions = [
      buildMockPrediction({ predictionType: 'mental_wellness', result: { prediction: 40.0, interpretation: 'Low wellness' } }),
    ];

    Prediction.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockPredictions),
      }),
    });

    const res = await request(app)
      .get('/api/analytics/insights')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const { insights } = res.body.data;
    expect(insights.length).toBeGreaterThan(0);
    // Each insight should contain a recommendation field
    insights.forEach((insight) => {
      expect(insight).toHaveProperty('recommendation');
    });
  });

  it('should generate an insight based on recent mental wellness predictions', async () => {
    const mockUser = buildMockUser();
    const token = signToken({ id: mockUser._id.toString() });
    mockAuthUser(mockUser);

    // Low wellness score should trigger a warning insight
    const mockPredictions = [
      buildMockPrediction({ predictionType: 'mental_wellness', result: { prediction: 35.0, interpretation: 'Poor wellness' } }),
      buildMockPrediction({ predictionType: 'mental_wellness', result: { prediction: 30.0, interpretation: 'Poor wellness' } }),
    ];

    Prediction.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockPredictions),
      }),
    });

    const res = await request(app)
      .get('/api/analytics/insights')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const { insights } = res.body.data;
    const wellnessInsight = insights.find((i) => i.category === 'mental_wellness');
    expect(wellnessInsight).toBeDefined();
    expect(wellnessInsight.type).toBe('warning');
  });

  it('should return a default "start your journey" insight when user has no predictions', async () => {
    const mockUser = buildMockUser();
    const token = signToken({ id: mockUser._id.toString() });
    mockAuthUser(mockUser);

    // No predictions at all
    Prediction.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      }),
    });

    const res = await request(app)
      .get('/api/analytics/insights')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const { insights, totalPredictionsCount } = res.body.data;
    expect(totalPredictionsCount).toBe(0);
    expect(insights.length).toBeGreaterThan(0);
    // The default insight for new users should be an engagement tip
    const engagementInsight = insights.find((i) => i.category === 'engagement');
    expect(engagementInsight).toBeDefined();
    expect(engagementInsight.type).toBe('tip');
  });
});
