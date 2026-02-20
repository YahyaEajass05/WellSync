import axiosInstance from './axios-instance';

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  institution?: string;
  age?: number;
  gender?: string;
}

export interface AdminAnalytics {
  users: {
    total: number;
    verified: number;
    active: number;
    admins: number;
    newLastWeek: number;
    verificationRate: string;
  };
  predictions: {
    total: number;
    mentalWellness: number;
    stressLevel: number;
    academicImpact: number;
    recentLastWeek: number;
    avgMentalWellnessScore: string;
    avgStressLevel: string;
    avgAcademicImpactScore: string;
  };
  trends: {
    userGrowth: Array<{ _id: string; count: number }>;
    predictions: Array<{ _id: { date: string; type: string }; count: number }>;
  };
  charts: {
    wellnessTrend: Array<{ date: string; avgScore: number; count: number }>;
    stressDistribution: Array<{ level: string; count: number }>;
    hourlyActivity: Array<{ hour: number; users: number; predictions: number }>;
  };
}

export const adminApi = {
  // Get all users with pagination and filters
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    verified?: string;
    active?: string;
  }) => {
    const response = await axiosInstance.get('/admin/users', { params });
    return response.data;
  },

  // Get admin dashboard analytics
  getAnalytics: async () => {
    const response = await axiosInstance.get<{ success: boolean; data: AdminAnalytics }>('/admin/dashboard');
    return response.data.data;
  },

  // Update user role
  updateUserRole: async (userId: string, role: 'user' | 'admin') => {
    const response = await axiosInstance.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  // Update user status (activate/deactivate)
  updateUserStatus: async (userId: string, isActive: boolean) => {
    const response = await axiosInstance.put(`/admin/users/${userId}/status`, { isActive });
    return response.data;
  },

  // Delete user
  deleteUser: async (userId: string) => {
    const response = await axiosInstance.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Get single user details
  getUserDetails: async (userId: string) => {
    const response = await axiosInstance.get(`/admin/users/${userId}`);
    return response.data.data;
  },

  // Get all predictions (admin view)
  getAllPredictions: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    userId?: string;
  }) => {
    const response = await axiosInstance.get('/admin/predictions', { params });
    return response.data;
  },

  // Get system stats
  getSystemStats: async () => {
    const response = await axiosInstance.get('/admin/stats');
    return response.data.data;
  },

  // Broadcast notification to all users
  broadcastNotification: async (data: { title: string; message: string; priority?: string }) => {
    const response = await axiosInstance.post('/admin/broadcast', data);
    return response.data;
  },
};
