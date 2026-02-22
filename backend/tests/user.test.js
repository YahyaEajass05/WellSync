/**
 * User & Profile API Tests
 * Comprehensive test suite for /api/users and /api/predictions/stats endpoints
 *
 * Uses Jest + Supertest with mocked:
 *  - MongoDB (jest.mock on User/Prediction/Notification/Analytics models)
 *  - Email service (nodemailer)
 *  - AI service
 *  - Database connection
 *  - Rate limiters
 */

// ─── Port override: must happen before server is required ─────────────────────
process.env.PORT = '5011';

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
jest.mock('../models/Prediction');
jest.mock('../models/Notification');
jest.mock('../models/Analytics');
jest.mock('../models/ScreenTimeLog');
jest.mock('../models/SleepRecord');
jest.mock('../models/SocialMediaUsage');
jest.mock('../models/StudentProfile');
jest.mock('../models/MentalWellnessProfile');

// ─── Imports (after mocks) ────────────────────────────────────────────────────

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../server');
const User = require('../models/User');
const Prediction = require('../models/Prediction');

// ─── Test environment ─────────────────────────────────────────────────────────

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-wellsync-2026';
process.env.NODE_ENV = 'test';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockUserId = new mongoose.Types.ObjectId();

/**
 * Sign a real JWT that the protect middleware can verify.
 */
function signToken(payload = {}) {
  return jwt.sign(
    { id: mockUserId.toString(), email: 'john@test.com', role: 'user', ...payload },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
}

/**
 * Build a base mock user document. Pass overrides to customise per test.
 */
function buildMockUser(overrides = {}) {
  return {
    _id: mockUserId,
    id: mockUserId.toString(), // virtual used by controllers via req.user.id
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@test.com',
    role: 'user',
    isEmailVerified: true,
    isActive: true,
    isSystemAdmin: false,
    loginAttempts: 0,
    lockUntil: null,
    profile: { age: 22, gender: 'Male', institution: 'ICBT' },
    preferences: { notifications: { email: true }, theme: 'auto' },
    createdAt: new Date('2025-01-01T00:00:00Z'),
    lastLogin: new Date(),
    fullName: 'John Doe',
    // Instance methods
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
    deleteOne: jest.fn().mockResolvedValue(true),
    ...overrides,
  };
}

/**
 * Build a mock prediction document.
 */
function buildMockPrediction(overrides = {}) {
  return {
    _id: new mongoose.Types.ObjectId(),
    user: mockUserId,
    predictionType: 'mental_wellness',
    inputData: { age: 22, gender: 'Male' },
    result: {
      prediction: 75,
      interpretation: 'Good mental wellness',
      modelName: 'RandomForest',
      stressCategory: null,
    },
    createdAt: new Date(),
    ...overrides,
  };
}

// ─── Global beforeEach ────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();

  // Default: protect middleware resolves to a valid active user
  User.findById.mockImplementation(() => ({
    select: jest.fn().mockResolvedValue(buildMockUser()),
  }));
});

// =============================================================================
// 1. GET /api/users/dashboard
// =============================================================================

describe('GET /api/users/dashboard', () => {
  /**
   * Set up all Prediction mocks needed by getDashboard:
   *   - Prediction.find().sort().limit().lean()        → recentActivity
   *   - Prediction.getUserStats()                      → stats by type
   *   - Prediction.countDocuments()                    → totalPredictions
   *   - Prediction.findOne().sort()  (×3)              → latest per type
   */
  function setupDashboardMocks({
    recentPredictions = [],
    userStats = [],
    totalCount = 0,
    latestMW = null,
    latestSL = null,
    latestAI = null,
  } = {}) {
    // Prediction.find().sort().limit().lean()
    Prediction.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(recentPredictions),
        }),
      }),
    });

    // Prediction.getUserStats() — static method
    Prediction.getUserStats = jest.fn().mockResolvedValue(userStats);

    // Prediction.countDocuments()
    Prediction.countDocuments.mockResolvedValue(totalCount);

    // Prediction.findOne().sort() — called three times for latest per type
    Prediction.findOne.mockReturnValue({
      sort: jest.fn().mockResolvedValue(null),
    });
  }

  it('should return 200 with full dashboard payload for an authenticated user', async () => {
    const token = signToken();
    setupDashboardMocks({ totalCount: 3 });

    const res = await request(app)
      .get('/api/users/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('user');
    expect(res.body.data).toHaveProperty('stats');
    expect(res.body.data).toHaveProperty('recentActivity');
    expect(res.body.data).toHaveProperty('latestPredictions');
  });

  it('should return 401 when no Authorization token is provided', async () => {
    const res = await request(app).get('/api/users/dashboard');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not authorized/i);
  });

  it('should return correct stats structure with totalPredictions', async () => {
    const token = signToken();
    setupDashboardMocks({
      totalCount: 10,
      userStats: [
        { _id: 'mental_wellness', count: 5, averagePrediction: 72 },
        { _id: 'stress_level', count: 3, averagePrediction: 4 },
        { _id: 'academic_impact', count: 2, averagePrediction: 60 },
      ],
    });

    const res = await request(app)
      .get('/api/users/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const { stats } = res.body.data;
    expect(stats.totalPredictions).toBe(10);
    expect(stats).toHaveProperty('mentalWellness');
    expect(stats).toHaveProperty('stressLevel');
    expect(stats).toHaveProperty('academicImpact');
    expect(stats.mentalWellness.count).toBe(5);
    expect(stats.stressLevel.count).toBe(3);
    expect(stats.academicImpact.count).toBe(2);
  });

  it('should include recentActivity array in the response', async () => {
    const token = signToken();
    const mockPrediction = buildMockPrediction();
    setupDashboardMocks({
      recentPredictions: [mockPrediction],
      totalCount: 1,
    });

    const res = await request(app)
      .get('/api/users/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.recentActivity)).toBe(true);
    expect(res.body.data.recentActivity).toHaveLength(1);
    expect(res.body.data.recentActivity[0]).toHaveProperty('type', 'mental_wellness');
    expect(res.body.data.recentActivity[0]).toHaveProperty('score', 75);
  });

  it('should include latestPredictions structure with keys for each type', async () => {
    const token = signToken();
    setupDashboardMocks({ totalCount: 5 });

    const res = await request(app)
      .get('/api/users/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const { latestPredictions } = res.body.data;
    expect(latestPredictions).toHaveProperty('mentalWellness');
    expect(latestPredictions).toHaveProperty('stressLevel');
    expect(latestPredictions).toHaveProperty('academicImpact');
  });

  it('should return zero stats and empty recentActivity when user has no predictions', async () => {
    const token = signToken();
    setupDashboardMocks({ recentPredictions: [], userStats: [], totalCount: 0 });

    const res = await request(app)
      .get('/api/users/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.stats.totalPredictions).toBe(0);
    expect(res.body.data.stats.mentalWellness.count).toBe(0);
    expect(res.body.data.recentActivity).toHaveLength(0);
  });

  it('should include user info with firstName, lastName, and email', async () => {
    const token = signToken();
    setupDashboardMocks();

    const res = await request(app)
      .get('/api/users/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const { user } = res.body.data;
    expect(user).toHaveProperty('firstName', 'John');
    expect(user).toHaveProperty('lastName', 'Doe');
    expect(user).toHaveProperty('email', 'john@test.com');
  });

  it('should return 401 when the account referenced by the token is deactivated', async () => {
    const token = signToken();
    const inactiveUser = buildMockUser({ isActive: false });

    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(inactiveUser),
    });

    const res = await request(app)
      .get('/api/users/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/deactivated/i);
  });
});

// =============================================================================
// 2. PUT /api/users/profile
// =============================================================================

describe('PUT /api/users/profile', () => {
  /**
   * Helper: set up User.findByIdAndUpdate to return an updated user doc.
   */
  function setupUpdateMock(updatedUser) {
    User.findByIdAndUpdate.mockResolvedValue(updatedUser);
  }

  it('should update profile fields and return 200 with the updated user', async () => {
    const token = signToken();
    const updatedUser = buildMockUser({
      firstName: 'Jane',
      lastName: 'Smith',
      profile: { age: 25, gender: 'Female', institution: 'MIT' },
    });
    setupUpdateMock(updatedUser);

    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'Jane',
        lastName: 'Smith',
        profile: { age: 25, gender: 'Female', institution: 'MIT' },
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/profile updated/i);
    expect(res.body.data).toHaveProperty('user');
    expect(res.body.data.user.firstName).toBe('Jane');
  });

  it('should allow a partial update with only firstName changed', async () => {
    const token = signToken();
    const updatedUser = buildMockUser({ firstName: 'Jonathan' });
    setupUpdateMock(updatedUser);

    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Jonathan' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.firstName).toBe('Jonathan');
  });

  it('should return 400 validation error when profile.age is negative (< 13)', async () => {
    const token = signToken();

    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ profile: { age: -5 } });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Validation Error');
    expect(res.body.errors.some(e => e.field === 'profile.age')).toBe(true);
  });

  it('should return 400 validation error when profile.age exceeds 120', async () => {
    const token = signToken();

    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ profile: { age: 150 } });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Validation Error');
    expect(res.body.errors.some(e => e.field === 'profile.age')).toBe(true);
  });

  it('should return 401 when no Authorization token is provided', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .send({ firstName: 'NoAuth' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not authorized/i);
  });

  it('should allow updating the institution field inside profile', async () => {
    const token = signToken();
    const updatedUser = buildMockUser({
      profile: { age: 22, gender: 'Male', institution: 'Harvard' },
    });
    setupUpdateMock(updatedUser);

    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ profile: { institution: 'Harvard' } });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.profile.institution).toBe('Harvard');
  });

  it('should call User.findByIdAndUpdate with $set operator so profile fields merge correctly', async () => {
    const token = signToken();
    const updatedUser = buildMockUser({ firstName: 'Updated' });
    setupUpdateMock(updatedUser);

    await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Updated', profile: { age: 30 } });

    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      mockUserId.toString(),
      expect.objectContaining({ $set: expect.objectContaining({ firstName: 'Updated', 'profile.age': 30 }) }),
      expect.objectContaining({ new: true, runValidators: true })
    );
  });

  it('should return the updated user object in data.user', async () => {
    const token = signToken();
    const updatedUser = buildMockUser({
      firstName: 'Alice',
      lastName: 'Wonderland',
      email: 'john@test.com',
    });
    setupUpdateMock(updatedUser);

    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Alice', lastName: 'Wonderland' });

    expect(res.status).toBe(200);
    const { user } = res.body.data;
    expect(user).toBeDefined();
    expect(user.firstName).toBe('Alice');
    expect(user.lastName).toBe('Wonderland');
  });
});

// =============================================================================
// 3. GET /api/predictions/stats  (user statistics endpoint)
// =============================================================================

describe('GET /api/predictions/stats', () => {
  /**
   * Helper: set up mocks for the getUserStats controller.
   * The controller calls Prediction.getUserStats() and Prediction.countDocuments().
   */
  function setupStatsMocks({ stats = [], totalCount = 0 } = {}) {
    Prediction.getUserStats = jest.fn().mockResolvedValue(stats);
    Prediction.countDocuments.mockResolvedValue(totalCount);
  }

  it('should return 200 with statistics for an authenticated user', async () => {
    const token = signToken();
    setupStatsMocks({
      totalCount: 8,
      stats: [
        { _id: 'mental_wellness', count: 4, averagePrediction: 70 },
        { _id: 'stress_level', count: 2, averagePrediction: 5 },
        { _id: 'academic_impact', count: 2, averagePrediction: 65 },
      ],
    });

    const res = await request(app)
      .get('/api/predictions/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalPredictions', 8);
    expect(res.body.data).toHaveProperty('byType');
    expect(res.body.data).toHaveProperty('summary');
  });

  it('should return 401 when no Authorization token is provided', async () => {
    const res = await request(app).get('/api/predictions/stats');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not authorized/i);
  });

  it('should return correct counts broken down by prediction type', async () => {
    const token = signToken();
    setupStatsMocks({
      totalCount: 6,
      stats: [
        { _id: 'mental_wellness', count: 3, averagePrediction: 68 },
        { _id: 'academic_impact', count: 2, averagePrediction: 55 },
        { _id: 'stress_level', count: 1, averagePrediction: 3 },
      ],
    });

    const res = await request(app)
      .get('/api/predictions/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const { summary } = res.body.data;
    expect(summary.mentalWellness.count).toBe(3);
    expect(summary.academicImpact.count).toBe(2);
    expect(summary.stressLevel.count).toBe(1);
  });

  it('should return zeros in summary when user has no predictions', async () => {
    const token = signToken();
    setupStatsMocks({ stats: [], totalCount: 0 });

    const res = await request(app)
      .get('/api/predictions/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalPredictions).toBe(0);
    const { summary } = res.body.data;
    expect(summary.mentalWellness.count).toBe(0);
    expect(summary.academicImpact.count).toBe(0);
    expect(summary.stressLevel.count).toBe(0);
  });

  it('should include byType array in the response matching the stats returned', async () => {
    const token = signToken();
    const mockStats = [
      { _id: 'mental_wellness', count: 7, averagePrediction: 78 },
    ];
    setupStatsMocks({ stats: mockStats, totalCount: 7 });

    const res = await request(app)
      .get('/api/predictions/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.byType)).toBe(true);
    expect(res.body.data.byType).toHaveLength(1);
    expect(res.body.data.byType[0]._id).toBe('mental_wellness');
    expect(res.body.data.byType[0].count).toBe(7);
  });
});

// =============================================================================
// 4. DELETE /api/users/account
// =============================================================================

describe('DELETE /api/users/account', () => {
  /**
   * The deleteAccount controller calls:
   *   - User.findById(req.user.id).select('+password')  → to verify password
   *   - user.comparePassword(password)
   *   - Prediction.deleteMany({ user: req.user.id })
   *   - user.deleteOne()
   */
  function setupDeleteMocks(mockUser) {
    // Controller calls User.findById().select('+password')
    // The protect middleware calls User.findById().select('-password')
    // We use mockImplementation so both chained .select() calls resolve to mockUser
    User.findById.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(mockUser),
    }));

    Prediction.deleteMany.mockResolvedValue({ deletedCount: 3 });
  }

  it('should delete the account and return 200 when correct password is provided', async () => {
    const token = signToken();
    const mockUser = buildMockUser({ comparePassword: jest.fn().mockResolvedValue(true) });
    setupDeleteMocks(mockUser);

    const res = await request(app)
      .delete('/api/users/account')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'SecurePass1' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/deleted successfully/i);
    expect(mockUser.deleteOne).toHaveBeenCalled();
    expect(Prediction.deleteMany).toHaveBeenCalledWith({ user: mockUserId.toString() });
  });

  it('should return 401 when the provided password is incorrect', async () => {
    const token = signToken();
    const mockUser = buildMockUser({ comparePassword: jest.fn().mockResolvedValue(false) });
    setupDeleteMocks(mockUser);

    const res = await request(app)
      .delete('/api/users/account')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'WrongPassword1' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/invalid password/i);
    expect(mockUser.deleteOne).not.toHaveBeenCalled();
  });

  it('should return 400 when no password is provided in the request body', async () => {
    const token = signToken();
    const mockUser = buildMockUser();
    setupDeleteMocks(mockUser);

    const res = await request(app)
      .delete('/api/users/account')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/password is required/i);
  });

  it('should return 401 when no Authorization token is provided', async () => {
    const res = await request(app)
      .delete('/api/users/account')
      .send({ password: 'SecurePass1' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not authorized/i);
  });

  it('should also delete all associated predictions when account is deleted', async () => {
    const token = signToken();
    const mockUser = buildMockUser({ comparePassword: jest.fn().mockResolvedValue(true) });
    setupDeleteMocks(mockUser);

    const res = await request(app)
      .delete('/api/users/account')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'SecurePass1' });

    expect(res.status).toBe(200);
    expect(Prediction.deleteMany).toHaveBeenCalledTimes(1);
    expect(Prediction.deleteMany).toHaveBeenCalledWith({ user: mockUserId.toString() });
  });
});
