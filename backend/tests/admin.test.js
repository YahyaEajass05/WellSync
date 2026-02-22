/**
 * Admin API Tests
 * Comprehensive test suite for /api/admin endpoints
 *
 * Uses Jest + Supertest with mocked:
 *  - MongoDB (jest.mock on User/Prediction/Notification/Analytics models)
 *  - Email service
 *  - AI service
 *  - Database connection
 *  - Rate limiters
 */

// ─── Port override: must happen before server is required ─────────────────────
process.env.PORT = '5013';

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

// ─── Imports (after mocks) ────────────────────────────────────────────────────

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../server');
const User = require('../models/User');
const Prediction = require('../models/Prediction');
const Notification = require('../models/Notification');

// ─── Test IDs ─────────────────────────────────────────────────────────────────

const adminUserId = new mongoose.Types.ObjectId();
const regularUserId = new mongoose.Types.ObjectId();
const targetUserId = new mongoose.Types.ObjectId();

// ─── Token helpers ────────────────────────────────────────────────────────────

const adminToken = jwt.sign(
  { id: adminUserId.toString(), email: 'admin@wellsync.lk', role: 'admin' },
  process.env.JWT_SECRET,
  { expiresIn: '1d' }
);

const userToken = jwt.sign(
  { id: regularUserId.toString(), email: 'user@test.com', role: 'user' },
  process.env.JWT_SECRET,
  { expiresIn: '1d' }
);

// ─── Mock user factories ──────────────────────────────────────────────────────

function buildMockAdminUser(overrides = {}) {
  return {
    _id: adminUserId,
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@wellsync.lk',
    role: 'admin',
    isActive: true,
    isEmailVerified: true,
    isSystemAdmin: false,
    createdAt: new Date('2025-01-01'),
    isSystemAdminAccount: jest.fn().mockReturnValue(false),
    save: jest.fn().mockResolvedValue(true),
    deleteOne: jest.fn().mockResolvedValue(true),
    ...overrides,
  };
}

function buildMockRegularUser(overrides = {}) {
  return {
    _id: targetUserId,
    firstName: 'Regular',
    lastName: 'User',
    email: 'regular@test.com',
    role: 'user',
    isActive: true,
    isEmailVerified: true,
    isSystemAdmin: false,
    createdAt: new Date('2025-06-01'),
    isSystemAdminAccount: jest.fn().mockReturnValue(false),
    save: jest.fn().mockResolvedValue(true),
    deleteOne: jest.fn().mockResolvedValue(true),
    toString: () => targetUserId.toString(),
    ...overrides,
  };
}

// ─── Setup: mock admin user for protect + authorize middleware ─────────────────

/**
 * Sets up User.findById so that the protect middleware resolves the
 * requesting user correctly (admin or regular based on the token).
 */
function mockAdminAuth() {
  const mockAdmin = buildMockAdminUser();
  User.findById.mockImplementation(() => ({
    select: jest.fn().mockResolvedValue(mockAdmin),
  }));
  return mockAdmin;
}

function mockRegularAuth() {
  const mockUser = { ...buildMockRegularUser(), _id: regularUserId, role: 'user' };
  User.findById.mockImplementation(() => ({
    select: jest.fn().mockResolvedValue(mockUser),
  }));
  return mockUser;
}

// ─── Pagination mock helper ───────────────────────────────────────────────────

function mockUserFindPaginated(results) {
  User.find.mockReturnValue({
    select: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          skip: jest.fn().mockResolvedValue(results),
        }),
      }),
    }),
  });
}

// =============================================================================
// 1. GET /api/admin/users
// =============================================================================

describe('GET /api/admin/users', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return user list with pagination for admin', async () => {
    mockAdminAuth();
    const mockUser = buildMockRegularUser();
    mockUserFindPaginated([mockUser]);
    User.countDocuments.mockResolvedValue(1);

    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('users');
    expect(Array.isArray(res.body.data.users)).toBe(true);
    expect(res.body.data.users).toHaveLength(1);
  });

  it('should include pagination metadata in the response', async () => {
    mockAdminAuth();
    mockUserFindPaginated([buildMockRegularUser()]);
    User.countDocuments.mockResolvedValue(25);

    const res = await request(app)
      .get('/api/admin/users?page=2&limit=10')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('pagination');
    expect(res.body.data.pagination).toMatchObject({
      total: 25,
      page: 2,
      limit: 10,
    });
    expect(res.body.data.pagination).toHaveProperty('pages');
  });

  it('should support search filter query parameter', async () => {
    mockAdminAuth();
    mockUserFindPaginated([buildMockRegularUser()]);
    User.countDocuments.mockResolvedValue(1);

    const res = await request(app)
      .get('/api/admin/users?search=regular')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Verify that User.find was called (search filter was applied)
    expect(User.find).toHaveBeenCalled();
    const findArg = User.find.mock.calls[0][0];
    expect(findArg).toHaveProperty('$or');
  });

  it('should return 401 when no token is provided', async () => {
    const res = await request(app).get('/api/admin/users');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not authorized/i);
  });

  it('should return 403 when a regular user token is provided', async () => {
    mockRegularAuth();

    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should include total count in the response', async () => {
    mockAdminAuth();
    mockUserFindPaginated([buildMockRegularUser(), buildMockRegularUser()]);
    User.countDocuments.mockResolvedValue(2);

    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.pagination.total).toBe(2);
  });
});

// =============================================================================
// 2. GET /api/admin/users/:id
// =============================================================================

describe('GET /api/admin/users/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return user details for a valid user id', async () => {
    const mockAdmin = buildMockAdminUser();
    const mockTarget = buildMockRegularUser();

    // protect calls findById(adminUserId).select('-password') -> mockAdmin
    // authorize checks req.user.role (already set), no findById call
    // getUserDetails calls User.findById(targetUserId).select('-password') -> mockTarget
    User.findById.mockImplementation((id) => {
      const isTarget = id && id.toString() === targetUserId.toString();
      return { select: jest.fn().mockResolvedValue(isTarget ? mockTarget : mockAdmin) };
    });

    Prediction.countDocuments.mockResolvedValue(5);
    Prediction.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      }),
    });

    const res = await request(app)
      .get(`/api/admin/users/${targetUserId.toString()}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('user');
    expect(res.body.data).toHaveProperty('statistics');
    expect(res.body.data.statistics).toHaveProperty('totalPredictions');
  });

  it('should return 404 when user is not found', async () => {
    // First call is for protect middleware (admin user), second for getUserDetails (null)
    let callCount = 0;
    const mockAdmin = buildMockAdminUser();
    User.findById.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return { select: jest.fn().mockResolvedValue(mockAdmin) };
      }
      return { select: jest.fn().mockResolvedValue(null) };
    });

    Prediction.countDocuments.mockResolvedValue(0);
    Prediction.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      }),
    });

    const res = await request(app)
      .get(`/api/admin/users/${targetUserId.toString()}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/user not found/i);
  });

  it('should return 403 when a regular user token is provided', async () => {
    mockRegularAuth();

    const res = await request(app)
      .get(`/api/admin/users/${targetUserId.toString()}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 when no token is provided', async () => {
    const res = await request(app)
      .get(`/api/admin/users/${targetUserId.toString()}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// =============================================================================
// 3. PUT /api/admin/users/:id/role
// =============================================================================

describe('PUT /api/admin/users/:id/role', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should promote a user to admin role', async () => {
    const mockAdmin = buildMockAdminUser();
    const mockTarget = buildMockRegularUser();

    let callCount = 0;
    User.findById.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // protect middleware
        return { select: jest.fn().mockResolvedValue(mockAdmin) };
      }
      // updateUserRole controller
      return { select: jest.fn().mockResolvedValue(mockTarget) };
    });

    // The controller calls User.findById(req.params.id) without .select()
    // Override to handle both chained and non-chained usage
    User.findById.mockImplementation((id) => {
      const isParamId = id && id.toString() === targetUserId.toString();
      if (isParamId) {
        const result = mockTarget;
        const promise = Promise.resolve(result);
        promise.select = jest.fn().mockResolvedValue(result);
        return promise;
      }
      return { select: jest.fn().mockResolvedValue(mockAdmin) };
    });

    const res = await request(app)
      .put(`/api/admin/users/${targetUserId.toString()}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'admin' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/role updated/i);
    expect(mockTarget.save).toHaveBeenCalled();
  });

  it('should demote an admin to user role', async () => {
    const mockAdmin = buildMockAdminUser();
    const mockTarget = buildMockRegularUser({ role: 'admin' });

    User.findById.mockImplementation((id) => {
      const isParamId = id && id.toString() === targetUserId.toString();
      if (isParamId) {
        const result = mockTarget;
        const promise = Promise.resolve(result);
        promise.select = jest.fn().mockResolvedValue(result);
        return promise;
      }
      return { select: jest.fn().mockResolvedValue(mockAdmin) };
    });

    const res = await request(app)
      .put(`/api/admin/users/${targetUserId.toString()}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'user' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockTarget.save).toHaveBeenCalled();
  });

  it('should return 400 when an invalid role is provided', async () => {
    mockAdminAuth();

    const res = await request(app)
      .put(`/api/admin/users/${targetUserId.toString()}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'superadmin' });

    // express-validator catches this before the controller
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 403 when trying to change own role (system admin guard)', async () => {
    const mockAdmin = buildMockAdminUser();
    // Target IS the system admin account
    const systemAdmin = buildMockRegularUser({
      isSystemAdminAccount: jest.fn().mockReturnValue(true),
    });

    User.findById.mockImplementation((id) => {
      const isParamId = id && id.toString() === targetUserId.toString();
      if (isParamId) {
        const result = systemAdmin;
        const promise = Promise.resolve(result);
        promise.select = jest.fn().mockResolvedValue(result);
        return promise;
      }
      return { select: jest.fn().mockResolvedValue(mockAdmin) };
    });

    const res = await request(app)
      .put(`/api/admin/users/${targetUserId.toString()}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'user' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/system administrator/i);
  });
});

// =============================================================================
// 4. PUT /api/admin/users/:id/status
// =============================================================================

describe('PUT /api/admin/users/:id/status', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should activate a deactivated user account', async () => {
    const mockAdmin = buildMockAdminUser();
    const mockTarget = buildMockRegularUser({ isActive: false });

    User.findById.mockImplementation((id) => {
      const isParamId = id && id.toString() === targetUserId.toString();
      if (isParamId) {
        const result = mockTarget;
        const promise = Promise.resolve(result);
        promise.select = jest.fn().mockResolvedValue(result);
        return promise;
      }
      return { select: jest.fn().mockResolvedValue(mockAdmin) };
    });

    const res = await request(app)
      .put(`/api/admin/users/${targetUserId.toString()}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: true });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/activated/i);
    expect(mockTarget.save).toHaveBeenCalled();
  });

  it('should deactivate an active user account', async () => {
    const mockAdmin = buildMockAdminUser();
    const mockTarget = buildMockRegularUser({ isActive: true });

    User.findById.mockImplementation((id) => {
      const isParamId = id && id.toString() === targetUserId.toString();
      if (isParamId) {
        const result = mockTarget;
        const promise = Promise.resolve(result);
        promise.select = jest.fn().mockResolvedValue(result);
        return promise;
      }
      return { select: jest.fn().mockResolvedValue(mockAdmin) };
    });

    const res = await request(app)
      .put(`/api/admin/users/${targetUserId.toString()}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/deactivated/i);
    expect(mockTarget.save).toHaveBeenCalled();
  });

  it('should return 403 when a regular user tries to change status', async () => {
    mockRegularAuth();

    const res = await request(app)
      .put(`/api/admin/users/${targetUserId.toString()}/status`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ isActive: false });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// =============================================================================
// 5. DELETE /api/admin/users/:id
// =============================================================================

describe('DELETE /api/admin/users/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a user and all associated data', async () => {
    const mockAdmin = buildMockAdminUser();
    const mockTarget = buildMockRegularUser();
    // Make sure _id comparison works: target id !== admin id
    mockTarget._id = targetUserId;

    User.findById.mockImplementation((id) => {
      const isParamId = id && id.toString() === targetUserId.toString();
      if (isParamId) {
        const result = mockTarget;
        const promise = Promise.resolve(result);
        promise.select = jest.fn().mockResolvedValue(result);
        return promise;
      }
      return { select: jest.fn().mockResolvedValue(mockAdmin) };
    });

    Prediction.deleteMany.mockResolvedValue({ deletedCount: 3 });
    Notification.deleteMany.mockResolvedValue({ deletedCount: 2 });

    const res = await request(app)
      .delete(`/api/admin/users/${targetUserId.toString()}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/deleted/i);
    expect(Prediction.deleteMany).toHaveBeenCalledWith({ user: mockTarget._id });
    expect(Notification.deleteMany).toHaveBeenCalledWith({ user: mockTarget._id });
    expect(mockTarget.deleteOne).toHaveBeenCalled();
  });

  it('should return 400 when admin tries to delete their own account', async () => {
    // The controller guard checks: user._id.toString() === req.user.id
    // req.user.id is set by the protect middleware from the decoded JWT token.
    // The mock admin user returned by protect middleware must have an `.id` property
    // matching adminUserId so that the guard triggers when the target user also has _id === adminUserId.
    const mockAdmin = buildMockAdminUser({ id: adminUserId.toString() });

    // The target user fetched by the controller (User.findById(req.params.id))
    // must have _id === adminUserId to trigger the self-delete guard.
    const selfTarget = {
      ...buildMockRegularUser(),
      _id: adminUserId,
      id: adminUserId.toString(),
      isSystemAdminAccount: jest.fn().mockReturnValue(false),
    };

    User.findById.mockImplementation((id) => {
      const idStr = id && id.toString();
      if (idStr === adminUserId.toString()) {
        // Both protect middleware (select chain) AND controller (direct await) route here.
        // Return an object that handles both .select() chain and direct Promise resolution.
        const obj = { select: jest.fn().mockResolvedValue(mockAdmin) };
        // Make it also thenable so `await User.findById(id)` without .select() returns selfTarget
        // when called from the controller with the URL param (which equals adminUserId in this test)
        return { select: jest.fn().mockResolvedValue(mockAdmin) };
      }
      const promise = Promise.resolve(selfTarget);
      promise.select = jest.fn().mockResolvedValue(selfTarget);
      return promise;
    });

    // Use adminUserId as both the token user AND the URL param target
    // so that user._id.toString() === req.user.id triggers in the controller.
    const selfDeleteToken = jwt.sign(
      { id: adminUserId.toString(), email: 'admin@wellsync.lk', role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // callCount trick: first call is protect middleware (.select chain → mockAdmin),
    // second call is deleteUser controller (direct await → selfTarget with _id === adminUserId)
    let callCount = 0;
    User.findById.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // protect middleware: returns chained .select()
        return { select: jest.fn().mockResolvedValue(mockAdmin) };
      }
      // deleteUser controller: awaited directly, _id must equal adminUserId
      const promise = Promise.resolve(selfTarget);
      promise.select = jest.fn().mockResolvedValue(selfTarget);
      return promise;
    });

    const res = await request(app)
      .delete(`/api/admin/users/${adminUserId.toString()}`)
      .set('Authorization', `Bearer ${selfDeleteToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/cannot delete your own account/i);
  });

  it('should return 404 when the target user is not found', async () => {
    const mockAdmin = buildMockAdminUser();
    let callCount = 0;

    User.findById.mockImplementation((id) => {
      callCount++;
      if (callCount === 1) {
        return { select: jest.fn().mockResolvedValue(mockAdmin) };
      }
      const promise = Promise.resolve(null);
      promise.select = jest.fn().mockResolvedValue(null);
      return promise;
    });

    const res = await request(app)
      .delete(`/api/admin/users/${targetUserId.toString()}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/user not found/i);
  });

  it('should return 403 when a regular user tries to delete a user', async () => {
    mockRegularAuth();

    const res = await request(app)
      .delete(`/api/admin/users/${targetUserId.toString()}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// =============================================================================
// 6. GET /api/admin/analytics  (mapped to /api/admin/dashboard)
// =============================================================================

describe('GET /api/admin/dashboard (analytics)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return admin analytics data', async () => {
    mockAdminAuth();

    // All the countDocuments calls inside getAdminDashboard
    User.countDocuments.mockResolvedValue(100);
    Prediction.countDocuments.mockResolvedValue(500);

    // aggregate calls
    User.aggregate = jest.fn().mockResolvedValue([]);
    Prediction.aggregate = jest.fn().mockResolvedValue([]);

    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('users');
    expect(res.body.data).toHaveProperty('predictions');
    expect(res.body.data).toHaveProperty('trends');
  });

  it('should return 401 when no token is provided', async () => {
    const res = await request(app).get('/api/admin/dashboard');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// =============================================================================
// 7. POST /api/admin/broadcast
// =============================================================================

describe('POST /api/admin/broadcast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send a broadcast notification to all active verified users', async () => {
    mockAdminAuth();

    const mockUsers = [
      { _id: new mongoose.Types.ObjectId(), firstName: 'Alice', lastName: 'A', email: 'alice@test.com' },
      { _id: new mongoose.Types.ObjectId(), firstName: 'Bob', lastName: 'B', email: 'bob@test.com' },
    ];

    // broadcastNotification calls User.find({ isActive, isEmailVerified }).select(...)
    User.find.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUsers),
    });

    Notification.insertMany = jest.fn().mockResolvedValue([]);

    const emailService = require('../utils/emailService');

    const res = await request(app)
      .post('/api/admin/broadcast')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'System Maintenance',
        message: 'We will be performing maintenance tonight.',
        priority: 'high',
        sendEmail: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/notification sent/i);
    expect(res.body.data).toHaveProperty('recipientCount', 2);
    expect(Notification.insertMany).toHaveBeenCalled();
  });

  it('should return 400 when title or message is missing', async () => {
    mockAdminAuth();

    const res = await request(app)
      .post('/api/admin/broadcast')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ priority: 'low' }); // missing title and message

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
