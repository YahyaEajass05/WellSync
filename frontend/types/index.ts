// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// User Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  profile?: UserProfile;
  preferences?: UserPreferences;
  createdAt: string;
  lastLogin?: string;
}

export interface UserProfile {
  age?: number;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  occupation?: string;
  country?: string;
  phoneNumber?: string;
  avatar?: string;
}

export interface UserPreferences {
  notifications?: {
    email: boolean;
    push: boolean;
  };
  theme?: 'light' | 'dark' | 'auto';
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Prediction Types
export interface Prediction {
  _id: string;
  user: string;
  predictionType: 'mental_wellness' | 'academic_impact' | 'stress_level';
  inputData: Record<string, any>;
  result: PredictionResult;
  metadata?: PredictionMetadata;
  notes?: string;
  isFavorite: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PredictionResult {
  prediction: number;
  interpretation?: string;
  modelName?: string;
  confidenceMetrics?: {
    modelR2Score: number;
    modelMAE: number;
  };
  inputFeaturesProcessed?: number;
  stressCategory?: string;
  recommendations?: string[];
}

export interface PredictionMetadata {
  ipAddress?: string;
  userAgent?: string;
  processingTime?: number;
  apiVersion?: string;
}

// Mental Wellness Input
export interface MentalWellnessInput {
  age: number;
  screen_time_hours: number;
  sleep_hours: number;
  physical_activity_hours: number;
  social_media_hours: number;
  academic_workload_hours: number;
  sleep_quality: number; // 1-10
  stress_level: number; // 0-10
  social_support: number; // 1-10
  work_life_balance: number; // 1-10
  days_with_good_sleep?: number;
  excessive_social_media?: boolean;
  high_academic_pressure?: boolean;
  screen_to_sleep_ratio?: number;
}

// Academic Impact Input
export interface AcademicImpactInput {
  age: number;
  gaming_hours: number;
  social_media_hours: number;
  study_hours: number;
  sleep_hours: number;
  gpa?: number;
  attendance_rate?: number;
  stress_level: number;
}

// Stress Level Input
export interface StressLevelInput {
  age: number;
  workload_hours: number;
  sleep_hours: number;
  social_support: number;
  exercise_hours: number;
  anxiety_level: number;
  depression_symptoms: number;
}

// Dashboard Types
export interface DashboardStats {
  totalPredictions: number;
  mentalWellness: {
    count: number;
    averagePrediction: number;
  };
  academicImpact: {
    count: number;
    averagePrediction: number;
  };
}

export interface DashboardData {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    isEmailVerified: boolean;
    memberSince: string;
  };
  stats: DashboardStats;
  latestPredictions: {
    mentalWellness?: {
      score: number;
      interpretation: string;
      date: string;
    };
    academicImpact?: {
      score: number;
      interpretation: string;
      date: string;
    };
  };
  recentActivity: Array<{
    id: string;
    type: string;
    score: number | string;
    date: string;
  }>;
}

// Notification Types
export interface Notification {
  _id: string;
  user: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
}
