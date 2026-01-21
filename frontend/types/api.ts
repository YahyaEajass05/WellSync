import type {
  User,
  Prediction,
  DashboardData,
  Notification,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  MentalWellnessInput,
  AcademicImpactInput,
  StressLevelInput,
} from './index';

// API Endpoint Response Types
export interface LoginResponse extends AuthResponse {}

export interface RegisterResponse extends AuthResponse {}

export interface GetUserResponse {
  user: User;
}

export interface GetDashboardResponse {
  data: DashboardData;
}

export interface GetPredictionsResponse {
  data: {
    predictions: Prediction[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface CreatePredictionResponse {
  data: {
    prediction: Prediction;
  };
}

export interface GetNotificationsResponse {
  data: {
    notifications: Notification[];
    unreadCount: number;
  };
}

// API Request Types
export interface CreatePredictionRequest {
  type: 'mental_wellness' | 'academic_impact' | 'stress_level';
  data: MentalWellnessInput | AcademicImpactInput | StressLevelInput;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  profile?: {
    age?: number;
    gender?: string;
    occupation?: string;
    country?: string;
    phoneNumber?: string;
  };
  preferences?: {
    notifications?: {
      email: boolean;
      push: boolean;
    };
    theme?: 'light' | 'dark' | 'auto';
  };
}
