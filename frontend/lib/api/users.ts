import axiosInstance from './axios-instance';
import type { User, ApiResponse, DashboardData } from '@/types';

export const usersApi = {
  // Get user profile
  getProfile: async (): Promise<User> => {
    const response = await axiosInstance.get<ApiResponse<{ user: User }>>(
      '/users/profile'
    );
    return response.data.data!.user;
  },

  // Update user profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await axiosInstance.put<ApiResponse<{ user: User }>>(
      '/users/profile',
      data
    );
    return response.data.data!.user;
  },

  // Get dashboard data
  getDashboard: async (): Promise<DashboardData> => {
    const response = await axiosInstance.get<ApiResponse<DashboardData>>(
      '/users/dashboard'
    );
    return response.data.data!;
  },

  // Delete account
  deleteAccount: async (password: string): Promise<void> => {
    await axiosInstance.delete('/users/account', { data: { password } });
  },

  // Deactivate account
  deactivateAccount: async (): Promise<void> => {
    await axiosInstance.put('/users/deactivate');
  },
};
