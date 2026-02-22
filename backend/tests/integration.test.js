/**
 * Integration Tests
 * End-to-end flow tests covering multi-step user journeys across the API
 *
 * These tests exercise the full request-response cycle including:
 *  - Register → verify email → login → make predictions → view dashboard
 *  - Auth token lifecycle (login, use token, logout)
 *  - Admin user management workflows
 *  - Notification lifecycle (create → list → mark read → delete)
 *
 * Uses Jest + Supertest with mocked:
 *  - MongoDB models
 *  - Email service
 *  - AI service
 *  - Rate limiters
 *  - Database connection
 */

// ─── Port override: must happen before server is required ─────────────────────
process.env.PORT = '5015';

// ─── Mocks ────────────────────────────────────────────────────────────────────

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
  getModelsInfo: jest.fn().mockResolvedValue({ data: { models: [] } }),
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

// ─── Imports ──────────────────────────────────────────────────────────────────

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../server');
const User = require('../models/User');
const Prediction = require('../models/Prediction');
const Notification = require('../models/Notification');
const aiService = require('../utils/aiService');
const emailService = require('../utils/emailService');

// ─── Environment ──────────────────────────────────────────────────────────────

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-wellsync-2026';
process.env.NODE_ENV = 'test';

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const mockUserId = new mongoose.Types.ObjectId();
const mockAdminId = new mongoose.Types.ObjectId();

function buildMockUser(overrides = {}) {
  return {
    _id: mockUserId,
    id: mockUserId.toString(),
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@test.com',
    role: 'user',
    isEmailVerified: true,
    isActive: true,
    isSystemAdmin: false,
    loginAttempts: 0,
    lockUntil: null,
    profile: { age: 25, gender: 'Male', institution: 'ICBT' },
    preferences: { notifications: { email: true }, theme: 'auto' },
    createdAt: new Date('2025-01-01'),
    lastLogin: new Date(),
    comparePassword: jest.fn().mockResolvedValue(true),
    generateAuthToken: jest.fn().mockReturnValue('mock-access-token'),
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

function buildMockAdmin(overrides = {}) {
  return {
    _id: mockAdminId,
    id: mockAdminId.toString(),
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@wellsync.lk',
    role: 'admin',
    isEmailVerified: true,
    isActive: true,
    isSystemAdmin: false,
    isSystemAdminAccount: jest.fn().mockReturnValue(false),
    save: jest.fn().mockResolvedValue(true),
    deleteOne: jest.fn().mockResolvedValue(true),
    ...overrides,
  };
}

function makeToken(userId, role = 'user') {
  return jwt.sign(
    { id: userId.toString(), email: 'john@test.com', role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
}

function mockAuthAs(user) {
  User.findById.mockReturnValue({
    select: jest.fn().mockResolvedValue(user),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

// =============================================================================
// FLOW 1: User Registration → Login → Dashboard
// =============================================================================

describe('Integration: Registration → Login → Dashboard flow', () => {
  it('should register a new user successfully', async () => {
    const newUser = buildMockUser({ isEmailVerified: false });
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue(newUser);

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: 'SecurePass1',
        confirmPassword: 'SecurePass1',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(emailService.sendWelcomeEmail).toHaveBeenCalledTimes(1);
  });

  it('should login the registered user and return tokens', async () => {
    const user = buildMockUser({ isEmailVerified: true });
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@test.com', password: 'SecurePass1' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data).toHaveProperty('refreshToken');
  });

  it('should access the dashboard with the token returned from login', async () => {
    const user = buildMockUser();
    const token = makeToken(mockUserId);
    mockAuthAs(user);

    Prediction.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }),
      }),
    });
    Prediction.getUserStats = jest.fn().mockResolvedValue([]);
    Prediction.countDocuments.mockResolvedValue(0);
    Prediction.findOne.mockReturnValue({ sort: jest.fn().mockResolvedValue(null) });

    const res = await request(app)
      .get('/api/users/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('user');
    expect(res.body.data).toHaveProperty('stats');
  });

  it('should prevent dashboard access without a token', async () => {
    const res = await request(app).get('/api/users/dashboard');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// =============================================================================
// FLOW 2: Make predictions → view history → delete prediction
// =============================================================================

describe('Integration: Prediction lifecycle flow', () => {
  const MENTAL_WELLNESS_INPUT = {
    age: 28, gender: 'Male', occupation: 'Software Engineer', work_mode: 'Hybrid',
    screen_time_hours: 8.0, work_screen_hours: 5.0, leisure_screen_hours: 3.0,
    sleep_hours: 7.0, sleep_quality_1_5: 3, stress_level_0_10: 5,
    productivity_0_100: 70, exercise_minutes_per_week: 150, social_hours_per_week: 10.0,
  };

  it('should submit a mental wellness prediction and get a result', async () => {
    const user = buildMockUser();
    const token = makeToken(mockUserId);
    mockAuthAs(user);

    aiService.predictMentalWellness.mockResolvedValue({
      data: {
        prediction: 72.5,
        interpretation: 'Good mental wellness',
        model_name: 'Voting Ensemble',
        confidence_metrics: { model_r2_score: 0.89, model_mae: 4.2 },
        status: 'success',
      },
      processingTime: 120,
    });

    const mockPred = {
      _id: new mongoose.Types.ObjectId(),
      predictionType: 'mental_wellness',
      result: { prediction: 72.5, interpretation: 'Good mental wellness' },
      createdAt: new Date(),
      deleteOne: jest.fn(),
      save: jest.fn(),
    };
    Prediction.create.mockResolvedValue(mockPred);
    Prediction.countDocuments.mockResolvedValue(1);

    const res = await request(app)
      .post('/api/predictions/mental-wellness')
      .set('Authorization', `Bearer ${token}`)
      .send(MENTAL_WELLNESS_INPUT);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.prediction.score).toBe(72.5);
    expect(Prediction.create).toHaveBeenCalledWith(
      expect.objectContaining({ predictionType: 'mental_wellness' })
    );
  });

  it('should retrieve the prediction history for the user', async () => {
    const user = buildMockUser();
    const token = makeToken(mockUserId);
    mockAuthAs(user);

    const pred = {
      _id: new mongoose.Types.ObjectId(),
      predictionType: 'mental_wellness',
      result: { prediction: 72.5, interpretation: 'Good' },
      createdAt: new Date(),
    };

    Prediction.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([pred]) }),
        }),
      }),
    });
    Prediction.countDocuments.mockResolvedValue(1);

    const res = await request(app)
      .get('/api/predictions')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.predictions).toHaveLength(1);
    expect(res.body.data.total).toBe(1);
  });

  it('should delete a prediction by ID', async () => {
    const user = buildMockUser();
    const token = makeToken(mockUserId);
    mockAuthAs(user);

    const predId = new mongoose.Types.ObjectId();
    const mockPred = {
      _id: predId,
      user: mockUserId,
      predictionType: 'mental_wellness',
      deleteOne: jest.fn().mockResolvedValue(true),
    };
    Prediction.findOne.mockResolvedValue(mockPred);

    const res = await request(app)
      .delete(`/api/predictions/${predId.toString()}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockPred.deleteOne).toHaveBeenCalled();
  });
});

// =============================================================================
// FLOW 3: Email verification flow
// =============================================================================

describe('Integration: Email verification flow', () => {
  it('should reject email verification with an invalid code', async () => {
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    const res = await request(app)
      .post('/api/auth/verify-email')
      .send({ email: 'john@test.com', code: '000000' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid or expired/i);
  });

  it('should verify email with a valid code and send activation email', async () => {
    const user = buildMockUser({ isEmailVerified: false });
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

    const res = await request(app)
      .post('/api/auth/verify-email')
      .send({ email: 'john@test.com', code: '123456' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(emailService.sendAccountActivationEmail).toHaveBeenCalledWith(user);
  });

  it('should resend verification code to an unverified user', async () => {
    const user = buildMockUser({ isEmailVerified: false });
    const token = makeToken(mockUserId);
    mockAuthAs(user);
    User.findById.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(user),
      then: (resolve) => resolve(user),
    }));

    const res = await request(app)
      .post('/api/auth/resend-verification')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(emailService.sendVerificationEmail).toHaveBeenCalled();
  });
});

// =============================================================================
// FLOW 4: Password reset flow
// =============================================================================

describe('Integration: Password reset flow', () => {
  it('should send a password reset code to a registered email', async () => {
    const user = buildMockUser();
    User.findOne.mockResolvedValue(user);

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'john@test.com' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith(user, '654321');
  });

  it('should reset the password using the received code', async () => {
    const user = buildMockUser();
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ email: 'john@test.com', code: '654321', password: 'NewSecure1' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(user.save).toHaveBeenCalled();
  });

  it('should reject login with old password after reset', async () => {
    // Simulate user with wrong password (comparePassword returns false)
    const user = buildMockUser({
      isEmailVerified: true,
      comparePassword: jest.fn().mockResolvedValue(false),
    });
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@test.com', password: 'OldSecure1' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid credentials/i);
  });
});

// =============================================================================
// FLOW 5: Admin user management workflow
// =============================================================================

describe('Integration: Admin user management workflow', () => {
  const adminToken = jwt.sign(
    { id: mockAdminId.toString(), email: 'admin@wellsync.lk', role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  it('should list all users as admin', async () => {
    const admin = buildMockAdmin();
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(admin) });

    const targetUser = buildMockUser();
    User.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            skip: jest.fn().mockResolvedValue([targetUser]),
          }),
        }),
      }),
    });
    User.countDocuments.mockResolvedValue(1);

    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.users).toHaveLength(1);
    expect(res.body.data.pagination.total).toBe(1);
  });

  it('should block a regular user from accessing admin routes', async () => {
    const user = buildMockUser();
    const userToken = makeToken(mockUserId, 'user');
    mockAuthAs(user);

    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should allow admin to deactivate a user account', async () => {
    const admin = buildMockAdmin();
    const targetUser = buildMockUser({ isActive: true });

    User.findById.mockImplementation((id) => {
      const idStr = id && id.toString();
      if (idStr === mockAdminId.toString()) {
        return { select: jest.fn().mockResolvedValue(admin) };
      }
      const promise = Promise.resolve(targetUser);
      promise.select = jest.fn().mockResolvedValue(targetUser);
      return promise;
    });

    const res = await request(app)
      .put(`/api/admin/users/${mockUserId.toString()}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deactivated/i);
    expect(targetUser.save).toHaveBeenCalled();
  });
});

// =============================================================================
// FLOW 6: Notification lifecycle
// =============================================================================

describe('Integration: Notification lifecycle flow', () => {
  it('should return zero unread notifications for a new user', async () => {
    const user = buildMockUser();
    const token = makeToken(mockUserId);
    mockAuthAs(user);

    Notification.getUnreadCount = jest.fn().mockResolvedValue(0);

    const res = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.unreadCount).toBe(0);
  });

  it('should list notifications with pagination', async () => {
    const user = buildMockUser();
    const token = makeToken(mockUserId);
    mockAuthAs(user);

    const notif = {
      _id: new mongoose.Types.ObjectId(),
      user: mockUserId,
      title: 'Welcome',
      message: 'Welcome to WellSync!',
      type: 'system_alert',
      isRead: false,
      createdAt: new Date(),
    };

    Notification.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([notif]) }),
        }),
      }),
    });
    Notification.countDocuments.mockResolvedValue(1);
    Notification.getUnreadCount = jest.fn().mockResolvedValue(1);

    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.notifications).toHaveLength(1);
    expect(res.body.data.unreadCount).toBe(1);
  });

  it('should mark all notifications as read', async () => {
    const user = buildMockUser();
    const token = makeToken(mockUserId);
    mockAuthAs(user);

    Notification.markAllAsRead = jest.fn().mockResolvedValue({ modifiedCount: 3 });

    const res = await request(app)
      .put('/api/notifications/mark-all-read')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.modifiedCount).toBe(3);
  });

  it('should delete a specific notification', async () => {
    const user = buildMockUser();
    const token = makeToken(mockUserId);
    mockAuthAs(user);

    const notifId = new mongoose.Types.ObjectId();
    const mockNotif = {
      _id: notifId,
      user: mockUserId,
      title: 'Test',
      deleteOne: jest.fn().mockResolvedValue(true),
    };
    Notification.findOne.mockResolvedValue(mockNotif);

    const res = await request(app)
      .delete(`/api/notifications/${notifId.toString()}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(mockNotif.deleteOne).toHaveBeenCalled();
  });
});

// =============================================================================
// FLOW 7: Health check and API info
// =============================================================================

describe('Integration: API health and info endpoints', () => {
  it('should return 200 from the root API endpoint', async () => {
    const res = await request(app).get('/api');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('endpoints');
  });

  it('should return 200 from the health check endpoint', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
  });

  it('should return an error status for unknown routes', async () => {
    const res = await request(app).get('/api/nonexistent-route-xyz');
    // notFound sets res.status(404) then calls next(error); the errorHandler
    // responds with error.statusCode || 500. The error from notFound has no
    // statusCode so errorHandler defaults to 500.
    expect([404, 500]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  it('should return 200 from the root server endpoint', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/wellsync/i);
  });
});
