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
  stressLevel: {
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
    stressLevel?: {
      score: number;
      interpretation: string;
      stressCategory?: string;
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

// Profile Types
export interface MentalWellnessProfile {
  _id: string;
  user: string;
  occupation: string;
  workMode: 'Remote' | 'Hybrid' | 'Office' | 'Self-employed' | 'Student';
  stressLevel: number;
  productivity: number;
  exerciseMinutesPerWeek: number;
  socialHoursPerWeek: number;
  hasChronicConditions: boolean;
  chronicConditions: string[];
  isSeeingTherapist: boolean;
  medicationUsage: 'None' | 'Occasional' | 'Regular' | 'Prefer not to say';
  profileCompleted: boolean;
  stressCategory?: string;
  productivityCategory?: string;
  exerciseCategory?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  _id: string;
  user: string;
  studentId?: string;
  academicLevel: 'High School' | 'Bachelor' | 'Master' | 'PhD' | 'Other';
  country: string;
  institution?: string;
  major?: string;
  yearOfStudy?: number;
  enrollmentYear?: number;
  expectedGraduationYear?: number;
  gpa?: number;
  relationshipStatus: 'Single' | 'In a relationship' | 'Married' | 'Prefer not to say';
  livingArrangement: 'On-campus' | 'Off-campus alone' | 'Off-campus with roommates' | 'With family' | 'Other';
  partTimeJob: boolean;
  hoursWorkedPerWeek: number;
  financialStress: 'None' | 'Low' | 'Moderate' | 'High' | 'Very High';
  studyHoursPerWeek: number;
  attendanceRate?: number;
  extracurricularActivities: string[];
  academicGoals: string[];
  profileCompleted: boolean;
  academicStanding?: string;
  workStudyBalance?: string;
  yearsInProgram?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScreenTimeLog {
  _id: string;
  date: string;
  screenTimeHours: number;
  workScreenHours: number;
  leisureScreenHours: number;
  eyeStrain: boolean;
  headache: boolean;
  mood?: string;
  notes?: string;
  screenTimeCategory?: string;
  createdAt: string;
}

export interface SleepRecord {
  _id: string;
  date: string;
  sleepHours: number;
  sleepQuality: number;
  bedtime?: string;
  wakeTime?: string;
  sleepInterruptions: number;
  screenBeforeSleep: boolean;
  caffeine: boolean;
  mood?: string;
  notes?: string;
  sleepCategory?: string;
  qualityCategory?: string;
  createdAt: string;
}

export interface ProfileOverview {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  profiles: {
    mentalWellness: { exists: boolean; completed?: boolean; readinessScore?: number; stressCategory?: string };
    student: { exists: boolean; completed?: boolean; academicStanding?: string; riskScore?: number };
  };
  recentActivity: {
    screenTime: ScreenTimeLog | null;
    sleep: SleepRecord | null;
  };
  weeklyAverages: {
    screenTime: {
      averageScreenTime: number;
      averageWorkScreen: number;
      averageLeisureScreen: number;
      daysLogged: number;
    } | null;
    sleep: {
      averageSleepHours: number;
      averageSleepQuality: number;
      daysRecorded: number;
    } | null;
  };
}

// Global Window extensions
declare global {
  interface Window {
    __wellsync_deleting?: boolean;
  }
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
