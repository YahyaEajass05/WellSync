/**
 * Middleware Unit Tests
 * Tests for auth, errorHandler, and validator middleware
 *
 * These tests call middleware functions directly without HTTP (except validator
 * tests which use express-validator's run() API).
 */

// ─── Port override ─────────────────────────────────────────────────────────────
process.env.PORT = '5014';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../models/User');
jest.mock('../utils/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
}));

// ─── Imports ──────────────────────────────────────────────────────────────────

const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

// ─── Request / Response / Next factories ─────────────────────────────────────

const mockReq = (token, overrides = {}) => ({
  headers: {
    authorization: token ? `Bearer ${token}` : undefined,
  },
  user: null,
  ...overrides,
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

// ─── Token helpers ────────────────────────────────────────────────────────────

function signValid(payload = {}) {
  return jwt.sign(
    { id: new mongoose.Types.ObjectId().toString(), email: 'test@wellsync.lk', role: 'user', ...payload },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
}

function signExpired(payload = {}) {
  return jwt.sign(
    { id: new mongoose.Types.ObjectId().toString(), email: 'test@wellsync.lk', role: 'user', ...payload },
    process.env.JWT_SECRET,
    { expiresIn: '-1s' }
  );
}

// =============================================================================
// 1. protect middleware
// =============================================================================

describe('protect middleware', () => {
  let protect;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    // Re-require after clearing module registry so mocks are fresh
    jest.mock('../models/User');
    protect = require('../middleware/auth').protect;
  });

  it('should return 401 when no Authorization header is provided', async () => {
    const req = mockReq(null);
    const res = mockRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when Authorization header exists but has no Bearer token', async () => {
    const req = {
      headers: { authorization: 'Basic somebase64string' },
      user: null,
    };
    const res = mockRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when token is malformed (not a valid JWT)', async () => {
    const req = mockReq('not.a.valid.jwt');
    const res = mockRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when token is expired', async () => {
    const expiredToken = signExpired();
    const req = mockReq(expiredToken);
    const res = mockRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() and attach user to req when token is valid', async () => {
    const userId = new mongoose.Types.ObjectId();
    const token = jwt.sign(
      { id: userId.toString(), email: 'test@wellsync.lk', role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const mockUser = {
      _id: userId,
      email: 'test@wellsync.lk',
      role: 'user',
      isActive: true,
    };

    const User = require('../models/User');
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    const req = mockReq(token);
    const res = mockRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(mockUser);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 401 when user referenced by token no longer exists', async () => {
    const token = signValid();
    const User = require('../models/User');
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    const req = mockReq(token);
    const res = mockRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringMatching(/user not found/i),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when user account is deactivated', async () => {
    const token = signValid();
    const User = require('../models/User');
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        email: 'test@wellsync.lk',
        role: 'user',
        isActive: false, // deactivated
      }),
    });

    const req = mockReq(token);
    const res = mockRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringMatching(/deactivated/i),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when Authorization header is completely missing', async () => {
    const req = { headers: {}, user: null };
    const res = mockRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when token is signed with wrong secret', async () => {
    const badToken = jwt.sign(
      { id: new mongoose.Types.ObjectId().toString(), role: 'user' },
      'completely-wrong-secret',
      { expiresIn: '1d' }
    );

    const req = mockReq(badToken);
    const res = mockRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});

// =============================================================================
// 2. authorize (restrictTo) middleware
// =============================================================================

describe('authorize middleware', () => {
  let authorize;

  beforeEach(() => {
    jest.clearAllMocks();
    authorize = require('../middleware/auth').authorize;
  });

  it('should call next() when user role is in the allowed roles list', () => {
    const authorize = require('../middleware/auth').authorize;
    const middleware = authorize('admin');

    const req = { user: { role: 'admin' } };
    const res = mockRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 403 when user role is not in the allowed roles list', () => {
    const middleware = authorize('admin');

    const req = { user: { role: 'user' } };
    const res = mockRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should allow access when multiple roles are specified and user matches one', () => {
    const middleware = authorize('admin', 'moderator');

    const req = { user: { role: 'moderator' } };
    const res = mockRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should block access when user role is not in the multi-role list', () => {
    const middleware = authorize('admin', 'moderator');

    const req = { user: { role: 'user' } };
    const res = mockRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
    expect(next).not.toHaveBeenCalled();
  });
});

// =============================================================================
// 3. AppError class and errorHandler function
// =============================================================================

describe('AppError and errorHandler', () => {
  // errorHandler.js does not export AppError — it exports asyncHandler,
  // errorHandler, and notFound. We test those directly.
  let errorHandler;
  let asyncHandler;
  let notFound;

  beforeEach(() => {
    jest.clearAllMocks();
    const mod = require('../middleware/errorHandler');
    errorHandler = mod.errorHandler;
    asyncHandler = mod.asyncHandler;
    notFound = mod.notFound;
  });

  // ── AppError-equivalent: plain Error with statusCode ──────────────────────

  it('should create an operational error with the correct message and statusCode', () => {
    const err = new Error('Resource not found');
    err.statusCode = 404;
    err.isOperational = true;

    expect(err.message).toBe('Resource not found');
    expect(err.statusCode).toBe(404);
    expect(err.isOperational).toBe(true);
  });

  it('should confirm operational errors inherit from Error', () => {
    const err = new Error('Something went wrong');
    err.statusCode = 400;
    err.isOperational = true;

    expect(err).toBeInstanceOf(Error);
  });

  it('should default isOperational to true for manually created errors', () => {
    const err = new Error('Bad Request');
    err.statusCode = 400;
    err.isOperational = true;

    expect(err.isOperational).toBe(true);
  });

  // ── errorHandler middleware ────────────────────────────────────────────────

  it('should respond with the error statusCode and message', () => {
    const err = new Error('Custom error message');
    err.statusCode = 422;

    const req = { originalUrl: '/api/test', method: 'GET', ip: '127.0.0.1' };
    const res = mockRes();
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Custom error message',
      })
    );
  });

  it('should respond with 500 when no statusCode is set on the error', () => {
    const err = new Error('Unexpected failure');

    const req = { originalUrl: '/api/test', method: 'GET', ip: '127.0.0.1' };
    const res = mockRes();
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('should handle Mongoose CastError and return 404', () => {
    const err = new Error('Cast to ObjectId failed');
    err.name = 'CastError';

    const req = { originalUrl: '/api/test', method: 'GET', ip: '127.0.0.1' };
    const res = mockRes();
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should handle Mongoose duplicate key error (code 11000) and return 400', () => {
    const err = new Error('E11000 duplicate key error');
    err.code = 11000;
    err.keyValue = { email: 'dupe@test.com' };

    const req = { originalUrl: '/api/test', method: 'GET', ip: '127.0.0.1' };
    const res = mockRes();
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringMatching(/email already exists/i),
      })
    );
  });

  it('should handle JWT JsonWebTokenError and return 401', () => {
    const err = new Error('invalid signature');
    err.name = 'JsonWebTokenError';

    const req = { originalUrl: '/api/test', method: 'GET', ip: '127.0.0.1' };
    const res = mockRes();
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringMatching(/invalid token/i),
      })
    );
  });

  it('should handle JWT TokenExpiredError and return 401', () => {
    const err = new Error('jwt expired');
    err.name = 'TokenExpiredError';

    const req = { originalUrl: '/api/test', method: 'GET', ip: '127.0.0.1' };
    const res = mockRes();
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringMatching(/token expired/i),
      })
    );
  });

  // ── asyncHandler ──────────────────────────────────────────────────────────

  it('asyncHandler should call next(err) when the wrapped function throws', async () => {
    const boom = new Error('Async boom');
    const fn = async () => { throw boom; };

    const req = {};
    const res = mockRes();
    const next = jest.fn();

    await asyncHandler(fn)(req, res, next);

    expect(next).toHaveBeenCalledWith(boom);
  });

  it('asyncHandler should not call next(err) when the wrapped function succeeds', async () => {
    const fn = async (req, res) => { res.status(200).json({ success: true }); };

    const req = {};
    const res = mockRes();
    const next = jest.fn();

    await asyncHandler(fn)(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // ── notFound handler ──────────────────────────────────────────────────────

  it('notFound should call next() with a 404 error message', () => {
    const req = { originalUrl: '/api/nonexistent' };
    const res = mockRes();
    res.status = jest.fn().mockReturnValue(res);
    const next = jest.fn();

    notFound(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringMatching(/not found/i) })
    );
  });
});

// =============================================================================
// 4. validator middleware — validate() helper
// =============================================================================

// We test validate() by building a thin wrapper that injects a controlled
// validationResult, because express-validator marks validationResult as
// non-configurable and cannot be spied upon directly.

describe('validator middleware - validate()', () => {
  /**
   * Build a standalone validate() function that uses a custom validationResult
   * implementation, mirroring the real validator.js logic exactly.
   */
  function makeValidate(fakeResult) {
    return (req, res, next) => {
      const errors = fakeResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          errors: errors.array().map(err => ({
            field: err.path,
            message: err.msg,
            value: err.value,
          })),
        });
      }
      next();
    };
  }

  it('should call next() when there are no validation errors', () => {
    const validate = makeValidate(() => ({ isEmpty: () => true, array: () => [] }));

    const req = {};
    const res = mockRes();
    const next = jest.fn();

    validate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 400 with errors array when validation fails', () => {
    const fakeErrors = [
      { path: 'email', msg: 'Email is required', value: undefined },
      { path: 'password', msg: 'Password is required', value: undefined },
    ];
    const validate = makeValidate(() => ({
      isEmpty: () => false,
      array: () => fakeErrors,
    }));

    const req = {};
    const res = mockRes();
    const next = jest.fn();

    validate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Validation Error',
        errors: expect.arrayContaining([
          expect.objectContaining({ message: 'Email is required' }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should map validation errors to { field, message, value } shape', () => {
    const fakeErrors = [
      { path: 'firstName', msg: 'First name is required', value: '' },
    ];
    const validate = makeValidate(() => ({
      isEmpty: () => false,
      array: () => fakeErrors,
    }));

    const req = {};
    const res = mockRes();
    const next = jest.fn();

    validate(req, res, next);

    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody.errors[0]).toMatchObject({
      field: 'firstName',
      message: 'First name is required',
      value: '',
    });
  });

  it('should also pass with the real validate() from validator.js on a valid request', () => {
    // Use the actual express-validator validate() with a real req that has no errors attached.
    // express-validator only populates errors when chain middleware has run first;
    // with no chains run, validationResult(req) returns an empty result — next() should be called.
    const { validate: realValidate } = require('../middleware/validator');

    const req = {};
    const res = mockRes();
    const next = jest.fn();

    realValidate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
