import axiosInstance from './axios-instance';
import type { ApiResponse, User } from '@/types';

export const settingsApi = {
  // ── Personal Info ─────────────────────────────────────────────────────────
  getProfile: async (): Promise<User> => {
    const res = await axiosInstance.get<ApiResponse<{ user: User }>>('/users/profile');
    return res.data.data!.user;
  },

  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    profile?: {
      age?: number;
      gender?: string;
      occupation?: string;
      country?: string;
      phoneNumber?: string;
    };
  }): Promise<User> => {
    const res = await axiosInstance.put<ApiResponse<{ user: User }>>('/users/profile', data);
    return res.data.data!.user;
  },

  // ── Preferences ───────────────────────────────────────────────────────────
  updatePreferences: async (preferences: {
    notifications?: { email: boolean; push: boolean };
    theme?: 'light' | 'dark' | 'auto';
  }): Promise<User> => {
    const res = await axiosInstance.put<ApiResponse<{ user: User }>>('/users/profile', { preferences });
    return res.data.data!.user;
  },

  // ── Password ──────────────────────────────────────────────────────────────
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<void> => {
    await axiosInstance.put('/auth/change-password', data);
  },

  // ── Account ───────────────────────────────────────────────────────────────
  deleteAccount: async (password: string): Promise<void> => {
    await axiosInstance.delete('/users/account', { data: { password } });
  },

  deactivateAccount: async (): Promise<void> => {
    await axiosInstance.put('/users/deactivate');
  },
};
