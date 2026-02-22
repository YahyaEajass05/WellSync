/**
 * Notification API Tests
 * Comprehensive test suite for /api/notifications endpoints
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
process.env.PORT = '5002';

// ─── Imports (after mocks) ────────────────────────────────────────────────────

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../server');
const User = require('../models/User');
const Notification = require('../models/Notification');

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
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@test.com',
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
    { id: new mongoose.Types.ObjectId().toString(), email: 'john@test.com', role: 'user', ...payload },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

/**
 * Sets up User.findById mock for the protect middleware (used on authenticated routes).
 */
function mockAuthUser(mockUser) {
  User.findById.mockImplementation(() => ({
    select: jest.fn().mockResolvedValue(mockUser),
    then: (resolve) => resolve(mockUser),
  }));
}

// ─── Reset all mocks between tests ───────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

// =============================================================================
// 1. GET /api/notifications
// =============================================================================

describe('GET /api/notifications', () => {
  it('should return 200 with a list of notifications for an authenticated user', async () => {
    const mockUser = buildMockUser();
    const token = signToken({ id: mockUser._id.toString() });
    mockAuthUser(mockUser);

    const mockNotification = {
      _id: new mongoose.Types.ObjectId(),
      user: mockUser._id,
      title: 'Test Notification',
      message: 'This is a test notification',
      type: 'prediction_completed',
      isRead: false,
      createdAt: new Date(),
    };

    // Notification.find(query).sort().limit().skip().lean()
    Notification.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([mockNotification]),
          }),
        }),
      }),
    });
    Notification.countDocuments.mockResolvedValue(1);
    Notification.getUnreadCount = jest.fn().mockResolvedValue(1);

    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('notifications');
    expect(Array.isArray(res.body.data.notifications)).toBe(true);
    expect(res.body.data.notifications).toHaveLength(1);
  });

  it('should support pagination via page and limit query params', async () => {
    const mockUser = buildMockUser();
    const token = signToken({ id: mockUser._id.toString() });
    mockAuthUser(mockUser);

    Notification.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
    });
    Notification.countDocuments.mockResolvedValue(25);
    Notification.getUnreadCount = jest.fn().mockResolvedValue(5);

    const res = await request(app)
      .get('/api/notifications?page=2&limit=10')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('pagination');
    expect(res.body.data.pagination).toHaveProperty('page', 2);
    expect(res.body.data.pagination).toHaveProperty('limit', 10);
    expect(res.body.data.pagination).toHaveProperty('total', 25);
  });

  it('should filter notifications by isRead=false when provided', async () => {
    const mockUser = buildMockUser();
    const token = signToken({ id: mockUser._id.toString() });
    mockAuthUser(mockUser);

    const unreadNotification = {
      _id: new mongoose.Types.ObjectId(),
      user: mockUser._id,
      title: 'Unread Notification',
      message: 'You have a new prediction result',
      type: 'prediction_completed',
      isRead: false,
      createdAt: new Date(),
    };

    Notification.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([unreadNotification]),
          }),
        }),
      }),
    });
    Notification.countDocuments.mockResolvedValue(1);
    Notification.getUnreadCount = jest.fn().mockResolvedValue(1);

    const res = await request(app)
      .get('/api/notifications?isRead=false')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.notifications[0].isRead).toBe(false);
    // Verify query filter was applied
    expect(Notification.find).toHaveBeenCalledWith(
      expect.objectContaining({ isRead: false })
    );
  });

  it('should return 401 when no Authorization token is provided', async () => {
    const res = await request(app).get('/api/notifications');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not authorized/i);
  });

  it('should return an empty notifications list when user has no notifications', async () => {
    const mockUser = buildMockUser();
    const token = signToken({ id: mockUser._id.toString() });
    mockAuthUser(mockUser);

    Notification.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
    });
    Notification.countDocuments.mockResolvedValue(0);
    Notification.getUnreadCount = jest.fn().mockResolvedValue(0);

    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.notifications).toHaveLength(0);
    expect(res.body.data.pagination.total).toBe(0);
    expect(res.body.data.unreadCount).toBe(0);
  });
});

// =============================================================================
// 2. GET /api/notifications/unread-count
// =============================================================================

describe('GET /api/notifications/unread-count', () => {
  it('should return 200 with the unread notification count', async () => {
    const mockUser = buildMockUser();
    const token = signToken({ id: mockUser._id.toString() });
    mockAuthUser(mockUser);

    Notification.getUnreadCount = jest.fn().mockResolvedValue(7);

    const res = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('unreadCount', 7);
  });

  it('should return 0 when the user has no unread notifications', async () => {
    const mockUser = buildMockUser();
    const token = signToken({ id: mockUser._id.toString() });
    mockAuthUser(mockUser);

    Notification.getUnreadCount = jest.fn().mockResolvedValue(0);

    const res = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.unreadCount).toBe(0);
  });

  it('should return 401 when no token is provided', async () => {
    const res = await request(app).get('/api/notifications/unread-count');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not authorized/i);
  });
});

// =============================================================================
// 3. PUT /api/notifications/mark-read  (mark specific notifications as read)
// =============================================================================

describe('PUT /api/notifications/mark-read', () => {
  it('should mark specified notifications as read and return 200', async () => {
    const mockUser = buildMockUser();
    const token = signToken({ id: mockUser._id.toString() });
    mockAuthUser(mockUser);

    const notificationId = new mongoose.Types.ObjectId().toString();
    Notification.markAsRead = jest.fn().mockResolvedValue({ modifiedCount: 1 });

    const res = await request(app)
      .put('/api/notifications/mark-read')
      .set('Authorization', `Bearer ${token}`)
      .send({ notificationIds: [notificationId] });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/marked as read/i);
  });

  it('should return 400 when notificationIds is not an array', async () => {
    const mockUser = buildMockUser();
    const token = signToken({ id: mockUser._id.toString() });
    mockAuthUser(mockUser);

    const res = await request(app)
      .put('/api/notifications/mark-read')
      .set('Authorization', `Bearer ${token}`)
      .send({ notificationIds: 'not-an-array' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when notificationIds is missing from the request body', async () => {
    const mockUser = buildMockUser();
    const token = signToken({ id: mockUser._id.toString() });
    mockAuthUser(mockUser);

    const res = await request(app)
      .put('/api/notifications/mark-read')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 when no token is provided', async () => {
    const res = await request(app)
      .put('/api/notifications/mark-read')
      .send({ notificationIds: [new mongoose.Types.ObjectId().toString()] });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// =============================================================================
// 4. PUT /api/notifications/mark-all-read
// =============================================================================

describe('PUT /api/notifications/mark-all-read', () => {
  it('should mark all notifications as read and return 200', async () => {
    const mockUser = buildMockUser();
    const token = signToken({ id: mockUser._id.toString() });
    mockAuthUser(mockUser);

    Notification.markAllAsRead = jest.fn().mockResolvedValue({ modifiedCount: 5 });

    const res = await request(app)
      .put('/api/notifications/mark-all-read')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/all notifications marked as read/i);
  });

  it('should return the count of modified notifications', async () => {
    const mockUser = buildMockUser();
    const token = signToken({ id: mockUser._id.toString() });
    mockAuthUser(mockUser);

    Notification.markAllAsRead = jest.fn().mockResolvedValue({ modifiedCount: 3 });

    const res = await request(app)
      .put('/api/notifications/mark-all-read')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('modifiedCount', 3);
  });

  it('should return 401 when no token is provided', async () => {
    const res = await request(app).put('/api/notifications/mark-all-read');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not authorized/i);
  });
});

// =============================================================================
// 5. DELETE /api/notifications/:id
// =============================================================================

describe('DELETE /api/notifications/:id', () => {
  it('should delete a notification successfully and return 200', async () => {
    const mockUser = buildMockUser();
    const token = signToken({ id: mockUser._id.toString() });
    mockAuthUser(mockUser);

    const notificationId = new mongoose.Types.ObjectId();
    const mockNotification = {
      _id: notificationId,
      user: mockUser._id,
      title: 'Test Notification',
      message: 'This is a test notification',
      type: 'prediction_completed',
      isRead: false,
      deleteOne: jest.fn().mockResolvedValue(true),
    };

    // Controller uses findOne({ _id: req.params.id, user: req.user.id })
    Notification.findOne.mockResolvedValue(mockNotification);

    const res = await request(app)
      .delete(`/api/notifications/${notificationId.toString()}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/deleted successfully/i);
    expect(mockNotification.deleteOne).toHaveBeenCalled();
  });

  it('should return 404 when the notification is not found', async () => {
    const mockUser = buildMockUser();
    const token = signToken({ id: mockUser._id.toString() });
    mockAuthUser(mockUser);

    Notification.findOne.mockResolvedValue(null);

    const res = await request(app)
      .delete(`/api/notifications/${new mongoose.Types.ObjectId().toString()}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not found/i);
  });

  it('should return 400 when the notification ID is not a valid MongoDB ObjectId', async () => {
    const mockUser = buildMockUser();
    const token = signToken({ id: mockUser._id.toString() });
    mockAuthUser(mockUser);

    const res = await request(app)
      .delete('/api/notifications/invalid-id-format')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 404 when trying to delete another user\'s notification', async () => {
    const mockUser = buildMockUser();
    const token = signToken({ id: mockUser._id.toString() });
    mockAuthUser(mockUser);

    // findOne returns null because the query matches both _id AND user —
    // when the notification belongs to a different user it won't be found.
    Notification.findOne.mockResolvedValue(null);

    const res = await request(app)
      .delete(`/api/notifications/${new mongoose.Types.ObjectId().toString()}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not found/i);
  });

  it('should return 401 when no token is provided', async () => {
    const res = await request(app)
      .delete(`/api/notifications/${new mongoose.Types.ObjectId().toString()}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not authorized/i);
  });
});
