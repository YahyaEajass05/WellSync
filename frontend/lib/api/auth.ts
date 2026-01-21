import axiosInstance from './axios-instance';
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  ApiResponse,
  User,
} from '@/types';

export const authApi = {
  // Register new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      data
    );
    return response.data.data!;
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      credentials
    );
    return response.data.data!;
  },

  // Get current user
  getMe: async (): Promise<User> => {
    const response = await axiosInstance.get<ApiResponse<{ user: User }>>(
      '/auth/me'
    );
    return response.data.data!.user;
  },

  // Logout
  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
  },

  // Verify email
  verifyEmail: async (code: string, email?: string): Promise<void> => {
    // Get email from localStorage if not provided
    let userEmail = email;
    if (!userEmail && typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        userEmail = user.email;
      }
    }
    
    await axiosInstance.post('/auth/verify-email', { 
      code, 
      email: userEmail 
    });
  },

  // Resend verification email
  resendVerification: async (): Promise<void> => {
    await axiosInstance.post('/auth/resend-verification');
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<void> => {
    await axiosInstance.post('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (
    code: string,
    password: string,
    email: string
  ): Promise<void> => {
    await axiosInstance.post('/auth/reset-password', { 
      code, 
      password, 
      email 
    });
  },

  // Change password
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    await axiosInstance.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },
};
