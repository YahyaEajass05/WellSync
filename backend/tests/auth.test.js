/**
 * Authentication API Tests
 * Comprehensive test suite for /api/auth endpoints
 *
 * Uses Jest + Supertest with mocked:
 *  - MongoDB (jest.mock on User/Prediction/Notification/Analytics models)
 *  - Email service (nodemailer)
 *  - AI service
 *  - Database connection
 */

// ─── Port override: must happen before server is required ─────────────────────
process.env.PORT = '5010';

// ─── Mocks (must be declared before any require of the app) ───────────────────

// database.js does `module.exports = connectDB` (default function export)
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

// Disable rate limiters entirely in tests to avoid 429 responses
jest.mock('../middleware/rateLimiter', () => ({
  apiLimiter: (req, res, next) => next(),
  authLimiter: (req, res, next) => next(),
  emailLimiter: (req, res, next) => next(),
  predictionLimiter: (req, res, next) => next(),
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
const emailService = require('../utils/emailService');

// ─── Test environment setup ───────────────────────────────────────────────────

// Ensure JWT_SECRET is always available in tests
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing';
process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret';
process.env.JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '30d';
process.env.NODE_ENV = 'test';

// ─── Helper: build a mock user object ────────────────────────────────────────

/**
 * Creates a mock user document with all the methods the auth controller relies on.
 * Pass overrides to customise specific fields per test.
 */
function buildMockUser(overrides = {}) {
  return {
    _id: new mongoose.Types.ObjectId(),
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@test.com',
    role: 'user',
    isEmailVerified: false,
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
    // ── Instance methods ──
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

// ─── Reset all mocks between tests ───────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

// =============================================================================
// 1. POST /api/auth/register
// =============================================================================

describe('POST /api/auth/register', () => {
  const validPayload = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@test.com',
    password: 'SecurePass1',
    confirmPassword: 'SecurePass1',
  };

  it('should register a new user and return 201 with token', async () => {
    const mockUser = buildMockUser();
    User.findOne.mockResolvedValue(null);   // no existing user
    User.create.mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/api/auth/register')
      .send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user).toMatchObject({
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
      email: mockUser.email,
    });
  });

  it('should send a welcome email after successful registration', async () => {
    const mockUser = buildMockUser();
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue(mockUser);

    await request(app).post('/api/auth/register').send(validPayload);

    expect(emailService.sendWelcomeEmail).toHaveBeenCalledTimes(1);
    expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith(mockUser, '123456');
  });

  it('should return 400 when email already exists', async () => {
    const existingUser = buildMockUser();
    User.findOne.mockResolvedValue(existingUser); // simulate duplicate

    const res = await request(app)
      .post('/api/auth/register')
      .send(validPayload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/already exists/i);
  });

  it('should return 400 validation error when firstName is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validPayload, firstName: '' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Validation Error');
    expect(res.body.errors).toBeInstanceOf(Array);
    expect(res.body.errors.some(e => e.field === 'firstName')).toBe(true);
  });

  it('should return 400 validation error when lastName is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validPayload, lastName: '' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Validation Error');
    expect(res.body.errors.some(e => e.field === 'lastName')).toBe(true);
  });

  it('should return 400 validation error for invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validPayload, email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Validation Error');
    expect(res.body.errors.some(e => e.field === 'email')).toBe(true);
  });

  it('should return 400 when password is too weak (no uppercase)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validPayload, password: 'weakpass1', confirmPassword: 'weakpass1' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Validation Error');
    expect(res.body.errors.some(e => e.field === 'password')).toBe(true);
  });

  it('should return 400 when password is too short (< 8 chars)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validPayload, password: 'Sh0rt', confirmPassword: 'Sh0rt' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation Error');
    expect(res.body.errors.some(e => e.field === 'password')).toBe(true);
  });

  it('should return 400 when passwords do not match', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validPayload, confirmPassword: 'DifferentPass1' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Validation Error');
    expect(res.body.errors.some(e => e.field === 'confirmPassword')).toBe(true);
  });

  it('should return 400 when confirmPassword is missing', async () => {
    const { confirmPassword, ...withoutConfirm } = validPayload;
    const res = await request(app)
      .post('/api/auth/register')
      .send(withoutConfirm);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation Error');
  });
});

// =============================================================================
// 2. POST /api/auth/login
// =============================================================================

describe('POST /api/auth/login', () => {
  const validCredentials = {
    email: 'john@test.com',
    password: 'SecurePass1',
  };

  it('should login successfully and return 200 with token and refreshToken', async () => {
    const mockUser = buildMockUser({ isEmailVerified: true });
    // findOne with .select('+password') chain
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send(validCredentials);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/login successful/i);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data).toHaveProperty('refreshToken');
    expect(res.body.data.user.email).toBe(mockUser.email);
  });

  it('should return 401 when user does not exist', async () => {
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send(validCredentials);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/invalid credentials/i);
  });

  it('should return 401 when password is incorrect', async () => {
    const mockUser = buildMockUser({
      comparePassword: jest.fn().mockResolvedValue(false), // wrong password
    });
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ ...validCredentials, password: 'WrongPass1' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/invalid credentials/i);
    // Should record the failed attempt
    expect(mockUser.incLoginAttempts).toHaveBeenCalled();
  });

  it('should return 423 when account is locked', async () => {
    const mockUser = buildMockUser({
      isLocked: jest.fn().mockReturnValue(true), // account locked
      lockUntil: new Date(Date.now() + 30 * 60 * 1000),
    });
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send(validCredentials);

    expect(res.status).toBe(423);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/account locked/i);
  });

  it('should return 401 when account is deactivated', async () => {
    const mockUser = buildMockUser({
      isActive: false,
      comparePassword: jest.fn().mockResolvedValue(true),
    });
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send(validCredentials);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/deactivated/i);
  });

  it('should return 400 validation error when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'SecurePass1' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation Error');
    expect(res.body.errors.some(e => e.field === 'email')).toBe(true);
  });

  it('should return 400 validation error when password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@test.com' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation Error');
    expect(res.body.errors.some(e => e.field === 'password')).toBe(true);
  });

  it('should return 400 when email format is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bad-email', password: 'SecurePass1' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation Error');
  });
});

// =============================================================================
// 3. GET /api/auth/me
// =============================================================================

describe('GET /api/auth/me', () => {
  it('should return 200 with current user data for a valid token', async () => {
    const mockUser = buildMockUser({ isEmailVerified: true });
    const token = signToken({ id: mockUser._id.toString() });

    // protect middleware calls findById().select('-password')
    // controller calls findById(id) with no chaining
    // Use mockImplementation so both usages resolve to mockUser
    User.findById.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(mockUser),
      then: (resolve) => resolve(mockUser), // makes plain await work too
    }));

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toHaveProperty('email', mockUser.email);
    expect(res.body.data.user).toHaveProperty('firstName', mockUser.firstName);
  });

  it('should return 401 when no Authorization header is provided', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not authorized/i);
  });

  it('should return 401 when token is invalid (tampered)', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer this.is.not.a.valid.jwt');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 when token is expired', async () => {
    // Sign a token that is already expired
    const expiredToken = jwt.sign(
      { id: new mongoose.Types.ObjectId().toString(), email: 'john@test.com', role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '-1s' } // expired 1 second ago
    );

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 when the user referenced by the token no longer exists', async () => {
    const token = signToken();

    // Middleware: findById returns null (user deleted)
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/user not found/i);
  });

  it('should return 401 when the token user account is deactivated', async () => {
    const token = signToken();
    const inactiveUser = buildMockUser({ isActive: false });

    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(inactiveUser),
    });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/deactivated/i);
  });
});

// =============================================================================
// 4. POST /api/auth/logout
// =============================================================================

describe('POST /api/auth/logout', () => {
  it('should logout successfully when a valid token is provided', async () => {
    const mockUser = buildMockUser();
    const token = signToken({ id: mockUser._id.toString() });

    // protect middleware calls findById().select('-password')
    User.findById.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(mockUser),
      then: (resolve) => resolve(mockUser),
    }));

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/logged out/i);
  });

  it('should return 401 when no token is provided on logout', async () => {
    const res = await request(app).post('/api/auth/logout');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not authorized/i);
  });

  it('should return 401 when an invalid token is provided on logout', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', 'Bearer invalid.token.here');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// =============================================================================
// 5. POST /api/auth/verify-email
// =============================================================================

describe('POST /api/auth/verify-email', () => {
  it('should verify email successfully with a valid code', async () => {
    const mockUser = buildMockUser({ isEmailVerified: false });
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    const res = await request(app)
      .post('/api/auth/verify-email')
      .send({ email: 'john@test.com', code: '123456' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/verified/i);
    expect(mockUser.save).toHaveBeenCalled();
  });

  it('should return 400 when verification code is invalid or expired', async () => {
    // findOne returns null — no user matched the code/expiry query
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    const res = await request(app)
      .post('/api/auth/verify-email')
      .send({ email: 'john@test.com', code: '000000' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/invalid or expired/i);
  });

  it('should return 400 when email is missing from the request', async () => {
    const res = await request(app)
      .post('/api/auth/verify-email')
      .send({ code: '123456' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when verification code is missing', async () => {
    const res = await request(app)
      .post('/api/auth/verify-email')
      .send({ email: 'john@test.com' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should send activation email after successful verification', async () => {
    const mockUser = buildMockUser();
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    await request(app)
      .post('/api/auth/verify-email')
      .send({ email: 'john@test.com', code: '123456' });

    expect(emailService.sendAccountActivationEmail).toHaveBeenCalledWith(mockUser);
  });
});

// =============================================================================
// 6. POST /api/auth/forgot-password
// =============================================================================

describe('POST /api/auth/forgot-password', () => {
  it('should send a password reset email for a valid registered email', async () => {
    const mockUser = buildMockUser();
    User.findOne.mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'john@test.com' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/reset code sent/i);
    expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith(mockUser, '654321');
  });

  it('should return 404 when no account is found for the given email', async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nobody@test.com' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/user not found/i);
  });

  it('should return 400 validation error when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation Error');
    expect(res.body.errors.some(e => e.field === 'email')).toBe(true);
  });

  it('should return 400 validation error when email format is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'not-a-valid-email' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation Error');
  });
});

// =============================================================================
// 7. POST /api/auth/reset-password
// =============================================================================

describe('POST /api/auth/reset-password', () => {
  const validResetPayload = {
    email: 'john@test.com',
    code: '654321',
    password: 'NewSecure1',
  };

  it('should reset the password and return a new auth token', async () => {
    const mockUser = buildMockUser();
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send(validResetPayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/reset successful/i);
    expect(res.body.data).toHaveProperty('token');
    expect(mockUser.save).toHaveBeenCalled();
  });

  it('should return 400 when the reset code is invalid or expired', async () => {
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send(validResetPayload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/invalid or expired/i);
  });

  it('should return 400 when email is missing from the request body', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ code: '654321', password: 'NewSecure1' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when reset code is missing from the request body', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ email: 'john@test.com', password: 'NewSecure1' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when new password is missing from the request body', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ email: 'john@test.com', code: '654321' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// =============================================================================
// 8. PUT /api/auth/change-password
// =============================================================================

describe('PUT /api/auth/change-password', () => {
  const validChangePayload = {
    currentPassword: 'OldSecure1',
    newPassword: 'NewSecure1',
    confirmPassword: 'NewSecure1',
  };

  it('should change the password successfully for an authenticated user', async () => {
    const mockUser = buildMockUser();
    const token = signToken({ id: mockUser._id.toString() });

    // Both protect middleware and controller call findById().select(...)
    // Use mockImplementation so both chained .select() calls return mockUser
    User.findById.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(mockUser),
      then: (resolve) => resolve(mockUser),
    }));

    const res = await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send(validChangePayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/changed successfully/i);
    expect(mockUser.save).toHaveBeenCalled();
  });

  it('should return 401 when the current password is incorrect', async () => {
    const mockUser = buildMockUser({
      comparePassword: jest.fn().mockResolvedValue(false), // wrong password
    });
    const token = signToken({ id: mockUser._id.toString() });

    User.findById.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(mockUser),
      then: (resolve) => resolve(mockUser),
    }));

    const res = await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send(validChangePayload);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/invalid password/i);
  });

  it('should return 400 validation error when new password is too weak', async () => {
    const mockUser = buildMockUser();
    const token = signToken({ id: mockUser._id.toString() });

    User.findById.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(mockUser),
      then: (resolve) => resolve(mockUser),
    }));

    const res = await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'OldSecure1',
        newPassword: 'weakpassword', // no uppercase, no digit
        confirmPassword: 'weakpassword',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation Error');
    expect(res.body.errors.some(e => e.field === 'newPassword')).toBe(true);
  });

  it('should return 400 validation error when new passwords do not match', async () => {
    const mockUser = buildMockUser();
    const token = signToken({ id: mockUser._id.toString() });

    User.findById.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(mockUser),
      then: (resolve) => resolve(mockUser),
    }));

    const res = await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'OldSecure1',
        newPassword: 'NewSecure1',
        confirmPassword: 'MismatchPass1',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation Error');
    expect(res.body.errors.some(e => e.field === 'confirmPassword')).toBe(true);
  });

  it('should return 401 when no Authorization token is provided', async () => {
    const res = await request(app)
      .put('/api/auth/change-password')
      .send(validChangePayload);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when currentPassword is missing', async () => {
    const mockUser = buildMockUser();
    const token = signToken({ id: mockUser._id.toString() });

    User.findById.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(mockUser),
      then: (resolve) => resolve(mockUser),
    }));

    const res = await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ newPassword: 'NewSecure1', confirmPassword: 'NewSecure1' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation Error');
    expect(res.body.errors.some(e => e.field === 'currentPassword')).toBe(true);
  });
});

// =============================================================================
// 9. POST /api/auth/resend-verification (bonus section)
// =============================================================================

describe('POST /api/auth/resend-verification', () => {
  it('should resend a verification code to an unverified authenticated user', async () => {
    const mockUser = buildMockUser({ isEmailVerified: false });
    const token = signToken({ id: mockUser._id.toString() });

    // protect middleware calls findById().select('-password')
    // controller calls findById(id) directly (plain await)
    User.findById.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(mockUser),
      then: (resolve) => resolve(mockUser),
    }));

    const res = await request(app)
      .post('/api/auth/resend-verification')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/sent/i);
    expect(emailService.sendVerificationEmail).toHaveBeenCalled();
  });

  it('should return 400 when the user email is already verified', async () => {
    const mockUser = buildMockUser({ isEmailVerified: true });
    const token = signToken({ id: mockUser._id.toString() });

    User.findById.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(mockUser),
      then: (resolve) => resolve(mockUser),
    }));

    const res = await request(app)
      .post('/api/auth/resend-verification')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/already verified/i);
  });

  it('should return 401 when no token is provided', async () => {
    const res = await request(app).post('/api/auth/resend-verification');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
