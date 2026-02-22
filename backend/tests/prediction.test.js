/**
 * Prediction API Tests
 * Comprehensive test suite for /api/predictions endpoints
 *
 * Uses Jest + Supertest with mocked:
 *  - MongoDB (jest.mock on User/Prediction/Notification/Analytics models)
 *  - AI service (aiService)
 *  - Email service (nodemailer)
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

jest.mock('../utils/aiService');

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
const aiService = require('../utils/aiService');

// ─── Test environment setup ───────────────────────────────────────────────────

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-wellsync-2026';
process.env.NODE_ENV = 'test';

// ─── Shared test data ─────────────────────────────────────────────────────────

const mockUserId = new mongoose.Types.ObjectId();

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

// ─── Helper: build a mock user ────────────────────────────────────────────────

function buildMockUser(overrides = {}) {
  return {
    _id: mockUserId,
    firstName: 'Test',
    lastName: 'User',
    email: 'test@test.com',
    role: 'user',
    isEmailVerified: true,
    isActive: true,
    profile: {},
    save: jest.fn().mockResolvedValue(true),
    comparePassword: jest.fn().mockResolvedValue(true),
    ...overrides,
  };
}

// ─── Helper: generate a valid JWT ────────────────────────────────────────────

function makeToken(userId = mockUserId, role = 'user') {
  return jwt.sign(
    { id: userId.toString(), email: 'test@test.com', role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
}

// ─── Helper: build a mock prediction document ─────────────────────────────────

function buildMockPrediction(overrides = {}) {
  const predId = new mongoose.Types.ObjectId();
  return {
    _id: predId,
    user: mockUserId,
    predictionType: 'mental_wellness',
    inputData: VALID_MENTAL_WELLNESS_PAYLOAD,
    result: {
      prediction: 72.5,
      interpretation: 'Good mental wellness',
      modelName: 'Voting Ensemble',
      confidenceMetrics: { modelR2Score: 0.89, modelMAE: 4.2 },
    },
    metadata: { processingTime: 120, apiVersion: '1.0.0' },
    notes: null,
    isFavorite: false,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deleteOne: jest.fn().mockResolvedValue(true),
    save: jest.fn().mockResolvedValue(true),
    ...overrides,
  };
}

// ─── Helper: wire up User.findById for the protect middleware ─────────────────

function mockAuthUser(user) {
  User.findById.mockReturnValue({
    select: jest.fn().mockResolvedValue(user),
  });
}

// ─── AI service mock responses ────────────────────────────────────────────────
// Controller reads aiResponse.data.* so we wrap in { data, processingTime }

const AI_MENTAL_WELLNESS_RESPONSE = {
  data: {
    prediction: 72.5,
    interpretation: 'Good mental wellness',
    model_name: 'Voting Ensemble',
    confidence_metrics: { model_r2_score: 0.89, model_mae: 4.2 },
    input_features_processed: 25,
    status: 'success',
  },
  processingTime: 120,
};

const AI_STRESS_RESPONSE = {
  data: {
    prediction: 6.2,
    stress_category: 'Moderate',
    interpretation: 'Moderate stress level',
    recommendations: ['Improve sleep', 'Reduce screen time'],
    model_name: 'Stress Classifier',
    confidence_metrics: { model_r2_score: 0.82, model_mae: 0.5 },
    status: 'success',
  },
  processingTime: 110,
};

const AI_ACADEMIC_RESPONSE = {
  data: {
    prediction: 5.3,
    interpretation: 'Moderate addiction risk',
    model_name: 'Gradient Boosting',
    confidence_metrics: { model_r2_score: 0.85, model_mae: 0.6 },
    input_features_processed: 20,
    status: 'success',
  },
  processingTime: 130,
};

// =============================================================================
// 1. POST /api/predictions/mental-wellness
// =============================================================================

describe('POST /api/predictions/mental-wellness', () => {
  let validToken;
  let mockUser;

  beforeEach(() => {
    mockUser = buildMockUser();
    validToken = makeToken(mockUserId);
    mockAuthUser(mockUser);

    aiService.predictMentalWellness.mockResolvedValue(AI_MENTAL_WELLNESS_RESPONSE);

    const mockPrediction = buildMockPrediction();
    Prediction.create.mockResolvedValue(mockPrediction);
    Prediction.countDocuments.mockResolvedValue(1);
  });

  it('should return 201 with prediction data for a valid payload', async () => {
    const res = await request(app)
      .post('/api/predictions/mental-wellness')
      .set('Authorization', `Bearer ${validToken}`)
      .send(VALID_MENTAL_WELLNESS_PAYLOAD);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/mental wellness prediction completed/i);
    expect(res.body.data).toHaveProperty('prediction');
    expect(res.body.data.prediction).toHaveProperty('score', 72.5);
    expect(res.body.data.prediction).toHaveProperty('interpretation', 'Good mental wellness');
  });

  it('should save the prediction to the database', async () => {
    await request(app)
      .post('/api/predictions/mental-wellness')
      .set('Authorization', `Bearer ${validToken}`)
      .send(VALID_MENTAL_WELLNESS_PAYLOAD);

    expect(Prediction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        predictionType: 'mental_wellness',
        inputData: expect.objectContaining({ age: 28 }),
      })
    );
  });

  it('should call the AI service with the correct input data', async () => {
    await request(app)
      .post('/api/predictions/mental-wellness')
      .set('Authorization', `Bearer ${validToken}`)
      .send(VALID_MENTAL_WELLNESS_PAYLOAD);

    expect(aiService.predictMentalWellness).toHaveBeenCalledWith(
      expect.objectContaining({
        age: 28,
        gender: 'Male',
        occupation: 'Software Engineer',
      })
    );
  });

  it('should return 400 when a required field is missing (occupation)', async () => {
    const { occupation, ...payload } = VALID_MENTAL_WELLNESS_PAYLOAD;

    const res = await request(app)
      .post('/api/predictions/mental-wellness')
      .set('Authorization', `Bearer ${validToken}`)
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Validation Error');
    expect(res.body.errors.some(e => e.field === 'occupation')).toBe(true);
  });

  it('should return 400 when age is below the minimum (17 is invalid, min is 18)', async () => {
    const res = await request(app)
      .post('/api/predictions/mental-wellness')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ ...VALID_MENTAL_WELLNESS_PAYLOAD, age: 17 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Validation Error');
    expect(res.body.errors.some(e => e.field === 'age')).toBe(true);
  });

  it('should return 401 when no Authorization token is provided', async () => {
    const res = await request(app)
      .post('/api/predictions/mental-wellness')
      .send(VALID_MENTAL_WELLNESS_PAYLOAD);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not authorized/i);
  });

  it('should return 503 when the AI service throws an error', async () => {
    aiService.predictMentalWellness.mockRejectedValue(
      new Error('AI Service is not available. Please try again later.')
    );

    const res = await request(app)
      .post('/api/predictions/mental-wellness')
      .set('Authorization', `Bearer ${validToken}`)
      .send(VALID_MENTAL_WELLNESS_PAYLOAD);

    // The global error handler maps unhandled errors to 500; the controller
    // lets asyncHandler bubble the error up. Accept 500 or 503.
    expect([500, 503]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });
});

// =============================================================================
// 2. POST /api/predictions/stress-level
// =============================================================================

describe('POST /api/predictions/stress-level', () => {
  let validToken;
  let mockUser;

  beforeEach(() => {
    mockUser = buildMockUser();
    validToken = makeToken(mockUserId);
    mockAuthUser(mockUser);

    aiService.predictStressLevel.mockResolvedValue(AI_STRESS_RESPONSE);

    const mockPrediction = buildMockPrediction({
      predictionType: 'stress_level',
      result: {
        prediction: 6.2,
        interpretation: 'Moderate stress level',
        modelName: 'Stress Classifier',
        stressCategory: 'Moderate',
        recommendations: ['Improve sleep', 'Reduce screen time'],
        confidenceMetrics: { modelR2Score: 0.82, modelMAE: 0.5 },
      },
    });
    Prediction.create.mockResolvedValue(mockPrediction);
    Prediction.countDocuments.mockResolvedValue(2);
  });

  it('should return 201 with stress prediction for a valid payload', async () => {
    const res = await request(app)
      .post('/api/predictions/stress-level')
      .set('Authorization', `Bearer ${validToken}`)
      .send(VALID_STRESS_PAYLOAD);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/stress level prediction completed/i);
    expect(res.body.data.prediction).toHaveProperty('category', 'Moderate');
    expect(res.body.data.prediction).toHaveProperty('score', 6.2);
  });

  it('should return 400 when a required field is missing (occupation)', async () => {
    const { occupation, ...payload } = VALID_STRESS_PAYLOAD;

    const res = await request(app)
      .post('/api/predictions/stress-level')
      .set('Authorization', `Bearer ${validToken}`)
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Validation Error');
    expect(res.body.errors.some(e => e.field === 'occupation')).toBe(true);
  });

  it('should return 400 when mental_wellness_index_0_100 exceeds 100', async () => {
    const res = await request(app)
      .post('/api/predictions/stress-level')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ ...VALID_STRESS_PAYLOAD, mental_wellness_index_0_100: 101 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Validation Error');
    expect(res.body.errors.some(e => e.field === 'mental_wellness_index_0_100')).toBe(true);
  });

  it('should return 401 when no Authorization token is provided', async () => {
    const res = await request(app)
      .post('/api/predictions/stress-level')
      .send(VALID_STRESS_PAYLOAD);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return an error status when AI service is unavailable', async () => {
    aiService.predictStressLevel.mockRejectedValue(
      new Error('AI Service is not available. Please try again later.')
    );

    const res = await request(app)
      .post('/api/predictions/stress-level')
      .set('Authorization', `Bearer ${validToken}`)
      .send(VALID_STRESS_PAYLOAD);

    expect([500, 503]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });
});

// =============================================================================
// 3. POST /api/predictions/academic-impact
// =============================================================================

describe('POST /api/predictions/academic-impact', () => {
  let validToken;
  let mockUser;

  beforeEach(() => {
    mockUser = buildMockUser();
    validToken = makeToken(mockUserId);
    mockAuthUser(mockUser);

    aiService.predictAcademicImpact.mockResolvedValue(AI_ACADEMIC_RESPONSE);

    const mockPrediction = buildMockPrediction({
      predictionType: 'academic_impact',
      result: {
        prediction: 5.3,
        interpretation: 'Moderate addiction risk',
        modelName: 'Gradient Boosting',
        confidenceMetrics: { modelR2Score: 0.85, modelMAE: 0.6 },
      },
    });
    Prediction.create.mockResolvedValue(mockPrediction);
    Prediction.countDocuments.mockResolvedValue(3);
  });

  it('should return 201 with academic impact prediction for a valid payload', async () => {
    const res = await request(app)
      .post('/api/predictions/academic-impact')
      .set('Authorization', `Bearer ${validToken}`)
      .send(VALID_ACADEMIC_PAYLOAD);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/academic impact prediction completed/i);
    expect(res.body.data.prediction).toHaveProperty('score', 5.3);
  });

  it('should accept mental_health_score of 0 (boundary minimum)', async () => {
    const res = await request(app)
      .post('/api/predictions/academic-impact')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ ...VALID_ACADEMIC_PAYLOAD, mental_health_score: 0 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should accept mental_health_score of 100 (boundary maximum)', async () => {
    const res = await request(app)
      .post('/api/predictions/academic-impact')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ ...VALID_ACADEMIC_PAYLOAD, mental_health_score: 100 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 when mental_health_score is 101 (above maximum)', async () => {
    const res = await request(app)
      .post('/api/predictions/academic-impact')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ ...VALID_ACADEMIC_PAYLOAD, mental_health_score: 101 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Validation Error');
    expect(res.body.errors.some(e => e.field === 'mental_health_score')).toBe(true);
  });

  it('should accept age of 17 (boundary minimum for academic)', async () => {
    const res = await request(app)
      .post('/api/predictions/academic-impact')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ ...VALID_ACADEMIC_PAYLOAD, age: 17 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 when age is 16 (below minimum for academic)', async () => {
    const res = await request(app)
      .post('/api/predictions/academic-impact')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ ...VALID_ACADEMIC_PAYLOAD, age: 16 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Validation Error');
    expect(res.body.errors.some(e => e.field === 'age')).toBe(true);
  });

  it('should return 401 when no Authorization token is provided', async () => {
    const res = await request(app)
      .post('/api/predictions/academic-impact')
      .send(VALID_ACADEMIC_PAYLOAD);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// =============================================================================
// 4. GET /api/predictions
// =============================================================================

describe('GET /api/predictions', () => {
  let validToken;
  let mockUser;

  beforeEach(() => {
    mockUser = buildMockUser();
    validToken = makeToken(mockUserId);
    mockAuthUser(mockUser);

    // Chain: .find().sort().limit().skip().lean()
    Prediction.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([buildMockPrediction()]),
          }),
        }),
      }),
    });
    Prediction.countDocuments.mockResolvedValue(1);
  });

  it('should return 200 with the user prediction list', async () => {
    const res = await request(app)
      .get('/api/predictions')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('predictions');
    expect(Array.isArray(res.body.data.predictions)).toBe(true);
    expect(res.body.data).toHaveProperty('total', 1);
    expect(res.body.data).toHaveProperty('page', 1);
  });

  it('should support pagination via page=2 query parameter', async () => {
    Prediction.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
    });
    Prediction.countDocuments.mockResolvedValue(25);

    const res = await request(app)
      .get('/api/predictions?page=2&limit=10')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.page).toBe(2);
    expect(res.body.data.limit).toBe(10);
    expect(res.body.data.total).toBe(25);
  });

  it('should filter predictions by type=mental_wellness', async () => {
    const mentalPrediction = buildMockPrediction({ predictionType: 'mental_wellness' });
    Prediction.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([mentalPrediction]),
          }),
        }),
      }),
    });
    Prediction.countDocuments.mockResolvedValue(1);

    const res = await request(app)
      .get('/api/predictions?type=mental_wellness')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Verify the query was called with type filter
    expect(Prediction.find).toHaveBeenCalledWith(
      expect.objectContaining({ predictionType: 'mental_wellness' })
    );
  });

  it('should return 401 when no Authorization token is provided', async () => {
    const res = await request(app).get('/api/predictions');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return an empty list when the user has no predictions', async () => {
    Prediction.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
    });
    Prediction.countDocuments.mockResolvedValue(0);

    const res = await request(app)
      .get('/api/predictions')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.predictions).toHaveLength(0);
    expect(res.body.data.total).toBe(0);
  });
});

// =============================================================================
// 5. GET /api/predictions/:id
// =============================================================================

describe('GET /api/predictions/:id', () => {
  let validToken;
  let mockUser;
  let mockPrediction;
  let validPredictionId;

  beforeEach(() => {
    mockUser = buildMockUser();
    validToken = makeToken(mockUserId);
    mockAuthUser(mockUser);

    mockPrediction = buildMockPrediction();
    validPredictionId = mockPrediction._id.toString();

    Prediction.findOne.mockResolvedValue(mockPrediction);
  });

  it('should return 200 with the prediction for a valid ID', async () => {
    const res = await request(app)
      .get(`/api/predictions/${validPredictionId}`)
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('prediction');
    expect(res.body.data.prediction).toHaveProperty('id');
    expect(res.body.data.prediction).toHaveProperty('type', 'mental_wellness');
    expect(res.body.data.prediction).toHaveProperty('result');
  });

  it('should return 400 when the ID is not a valid MongoDB ObjectId', async () => {
    const res = await request(app)
      .get('/api/predictions/not-a-valid-id')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Validation Error');
  });

  it('should return 404 when the prediction does not exist', async () => {
    Prediction.findOne.mockResolvedValue(null);

    const res = await request(app)
      .get(`/api/predictions/${validPredictionId}`)
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/prediction not found/i);
  });

  it('should return 401 when no Authorization token is provided', async () => {
    const res = await request(app)
      .get(`/api/predictions/${validPredictionId}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// =============================================================================
// 6. DELETE /api/predictions/:id
// =============================================================================

describe('DELETE /api/predictions/:id', () => {
  let validToken;
  let mockUser;
  let mockPrediction;
  let validPredictionId;

  beforeEach(() => {
    mockUser = buildMockUser();
    validToken = makeToken(mockUserId);
    mockAuthUser(mockUser);

    mockPrediction = buildMockPrediction();
    validPredictionId = mockPrediction._id.toString();

    Prediction.findOne.mockResolvedValue(mockPrediction);
  });

  it('should return 200 and delete the prediction successfully', async () => {
    const res = await request(app)
      .delete(`/api/predictions/${validPredictionId}`)
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/deleted successfully/i);
    expect(mockPrediction.deleteOne).toHaveBeenCalled();
  });

  it('should return 404 when the prediction to delete does not exist', async () => {
    Prediction.findOne.mockResolvedValue(null);

    const res = await request(app)
      .delete(`/api/predictions/${validPredictionId}`)
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/prediction not found/i);
  });

  it('should return 401 when no Authorization token is provided', async () => {
    const res = await request(app)
      .delete(`/api/predictions/${validPredictionId}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
