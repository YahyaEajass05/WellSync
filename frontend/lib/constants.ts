export const APP_NAME = 'WellSync';
export const APP_DESCRIPTION = 'AI-Powered Mental Wellness & Academic Performance Prediction System';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
export const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  PREDICTIONS: '/predictions',
  PREDICTIONS_NEW: '/predictions/new',
  PREDICTIONS_MENTAL_WELLNESS: '/predictions/mental-wellness',
  PREDICTIONS_ACADEMIC: '/predictions/academic',
  PREDICTIONS_STRESS: '/predictions/stress',
  ANALYTICS: '/analytics',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

export const PREDICTION_TYPES = {
  MENTAL_WELLNESS: 'mental_wellness',
  ACADEMIC_IMPACT: 'academic_impact',
  STRESS_LEVEL: 'stress_level',
} as const;

export const WELLNESS_THRESHOLDS = {
  EXCELLENT: 80,
  GOOD: 70,
  FAIR: 60,
  NEEDS_ATTENTION: 40,
} as const;

export const STRESS_THRESHOLDS = {
  LOW: 3,
  MODERATE: 6,
  HIGH: 8,
} as const;
