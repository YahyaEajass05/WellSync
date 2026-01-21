import axiosInstance from './axios-instance';
import type { Notification, ApiResponse } from '@/types';

export const notificationsApi = {
  // Get all notifications
  getNotifications: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<{ notifications: Notification[]; unreadCount: number }> => {
    const response = await axiosInstance.get<
      ApiResponse<{ notifications: Notification[]; unreadCount: number }>
    >('/notifications', { params });
    return response.data.data!;
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    const response = await axiosInstance.get<ApiResponse<{ count: number }>>(
      '/notifications/unread-count'
    );
    return response.data.data!.count;
  },

  // Mark as read
  markAsRead: async (ids: string[]): Promise<void> => {
    await axiosInstance.put('/notifications/mark-read', { ids });
  },

  // Mark all as read
  markAllAsRead: async (): Promise<void> => {
    await axiosInstance.put('/notifications/mark-all-read');
  },

  // Delete notification
  deleteNotification: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/notifications/${id}`);
  },

  // Clear read notifications
  clearRead: async (): Promise<void> => {
    await axiosInstance.delete('/notifications/clear-read');
  },
};
