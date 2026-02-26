import axiosInstance from './axios-instance';

/** Triggers a browser file download from a Blob */
function triggerDownload(blob: Blob, filename: string, mimeType: string) {
  const url = window.URL.createObjectURL(new Blob([blob], { type: mimeType }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

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
    avgStressLevel: string;    // avg numeric stress score (0-100)
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

  // Broadcast notification to all users (in-app + optional email)
  broadcastNotification: async (data: { title: string; message: string; priority?: string; sendEmail?: boolean }) => {
    const response = await axiosInstance.post('/admin/broadcast', data);
    return response;
  },

  // Get all notifications history (admin)
  getNotificationsHistory: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    priority?: string;
    isRead?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await axiosInstance.get('/admin/notifications', { params });
    return response;
  },

  // Delete a single notification (admin)
  deleteNotificationAdmin: async (id: string) => {
    const response = await axiosInstance.delete(`/admin/notifications/${id}`);
    return response;
  },

  // Bulk delete notifications by IDs (admin)
  bulkDeleteNotifications: async (ids: string[]) => {
    const response = await axiosInstance.delete('/admin/notifications/bulk', { data: { ids } });
    return response;
  },

  // Get AI model insights and performance metrics
  getModelInsights: async () => {
    const response = await axiosInstance.get('/admin/models');
    return response.data.data;
  },

  // ── Export helpers (trigger browser download) ──────────────────────────────
  exportUsersCSV: async () => {
    const response = await axiosInstance.get('/admin/export/users/csv', { responseType: 'blob' });
    triggerDownload(response.data, `wellsync-users-${Date.now()}.csv`, 'text/csv');
  },

  exportUsersPDF: async () => {
    const response = await axiosInstance.get('/admin/export/users/pdf', { responseType: 'blob' });
    triggerDownload(response.data, `wellsync-users-${Date.now()}.pdf`, 'application/pdf');
  },

  exportUserDetailPDF: async (userId: string) => {
    const response = await axiosInstance.get(`/admin/export/users/${userId}/pdf`, { responseType: 'blob' });
    triggerDownload(response.data, `wellsync-user-${userId}-${Date.now()}.pdf`, 'application/pdf');
  },

  exportPredictionsCSV: async (type?: string) => {
    const params = type ? { type } : {};
    const response = await axiosInstance.get('/admin/export/predictions/csv', { params, responseType: 'blob' });
    triggerDownload(response.data, `wellsync-predictions-${Date.now()}.csv`, 'text/csv');
  },

  exportPredictionsPDF: async (type?: string) => {
    const params = type ? { type } : {};
    const response = await axiosInstance.get('/admin/export/predictions/pdf', { params, responseType: 'blob' });
    triggerDownload(response.data, `wellsync-predictions-${Date.now()}.pdf`, 'application/pdf');
  },

  exportNotificationsCSV: async () => {
    const response = await axiosInstance.get('/admin/export/notifications/csv', { responseType: 'blob' });
    triggerDownload(response.data, `wellsync-notifications-${Date.now()}.csv`, 'text/csv');
  },

  exportNotificationsPDF: async () => {
    const response = await axiosInstance.get('/admin/export/notifications/pdf', { responseType: 'blob' });
    triggerDownload(response.data, `wellsync-notifications-${Date.now()}.pdf`, 'application/pdf');
  },
};

export interface ModelMetrics {
  r2: number;
  mae: number;
  rmse: number;
  mape?: number;
  accuracy?: number;
  algorithm: string;
}

export interface ModelInsights {
  totalPredictions: number;
  mentalWellness: {
    total: number;
    avgScore: string;
    minScore: string;
    maxScore: string;
    stdDev: string;
    trend: Array<{ _id: string; avg: number; count: number }>;
    distribution: Array<{ _id: number; count: number }>;
    recent: Array<{ result: any; createdAt: string }>;
    modelMetrics: ModelMetrics;
  };
  stressLevel: {
    total: number;
    avgScore: string;
    minScore: string;
    maxScore: string;
    distribution: Array<{ _id: string; count: number }>;
    trend: Array<{ _id: string; count: number }>;
    recent: Array<{ result: any; createdAt: string }>;
    modelMetrics: ModelMetrics;
  };
  academicImpact: {
    total: number;
    avgScore: string;
    minScore: string;
    maxScore: string;
    stdDev: string;
    trend: Array<{ _id: string; avg: number; count: number }>;
    riskDistribution: Array<{ _id: string; count: number }>;
    recent: Array<{ result: any; createdAt: string }>;
    modelMetrics: ModelMetrics;
  };
  usageOverTime: Array<{ _id: { date: string; type: string }; count: number }>;
}
