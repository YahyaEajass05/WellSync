import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type AdminUser, type AdminAnalytics, type ModelInsights } from '../api/admin';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

export function useAdminAuth() {
  const user = useAuthStore((state) => state.user);
  return { isAdmin: user?.role === 'admin' };
}

export function useAdminUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminApi.getUsers(params),
    staleTime: 30000, // 30 seconds
  });
}

export function useAdminAnalytics() {
  return useQuery<AdminAnalytics>({
    queryKey: ['admin', 'analytics'],
    queryFn: () => adminApi.getAnalytics(),
    staleTime: 60000, // 1 minute
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'user' | 'admin' }) =>
      adminApi.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'analytics'] });
      toast.success('User role updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update user role');
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      adminApi.updateUserStatus(userId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'analytics'] });
      toast.success('User status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update user status');
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'analytics'] });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete user');
    },
  });
}

export function useUserDetails(userId: string) {
  return useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn: () => adminApi.getUserDetails(userId),
    enabled: !!userId,
  });
}

export function useAdminPredictions(params?: {
  page?: number;
  limit?: number;
  type?: string;
  userId?: string;
}) {
  return useQuery({
    queryKey: ['admin', 'predictions', params],
    queryFn: () => adminApi.getAllPredictions(params),
    staleTime: 30000,
  });
}

export function useSystemStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.getSystemStats(),
    staleTime: 60000,
  });
}

export function useModelInsights() {
  return useQuery<ModelInsights>({
    queryKey: ['admin', 'models'],
    queryFn: () => adminApi.getModelInsights(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useBroadcastNotification() {
  return useMutation({
    mutationFn: (data: { title: string; message: string; priority?: string; sendEmail?: boolean }) =>
      adminApi.broadcastNotification(data),
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to broadcast notification');
    },
  });
}

// ── Export hooks ────────────────────────────────────────────────────────────

export function useExportUsersCSV() {
  return useMutation({
    mutationFn: () => adminApi.exportUsersCSV(),
    onSuccess: () => toast.success('Users CSV downloaded'),
    onError: () => toast.error('Failed to export users CSV'),
  });
}

export function useExportUsersPDF() {
  return useMutation({
    mutationFn: () => adminApi.exportUsersPDF(),
    onSuccess: () => toast.success('Users PDF downloaded'),
    onError: () => toast.error('Failed to export users PDF'),
  });
}

export function useExportUserDetailPDF() {
  return useMutation({
    mutationFn: (userId: string) => adminApi.exportUserDetailPDF(userId),
    onSuccess: () => toast.success('User detail PDF downloaded'),
    onError: () => toast.error('Failed to export user PDF'),
  });
}

export function useExportPredictionsCSV() {
  return useMutation({
    mutationFn: (type?: string) => adminApi.exportPredictionsCSV(type),
    onSuccess: () => toast.success('Predictions CSV downloaded'),
    onError: () => toast.error('Failed to export predictions CSV'),
  });
}

export function useExportPredictionsPDF() {
  return useMutation({
    mutationFn: (type?: string) => adminApi.exportPredictionsPDF(type),
    onSuccess: () => toast.success('Predictions PDF downloaded'),
    onError: () => toast.error('Failed to export predictions PDF'),
  });
}

export function useExportNotificationsCSV() {
  return useMutation({
    mutationFn: () => adminApi.exportNotificationsCSV(),
    onSuccess: () => toast.success('Notifications CSV downloaded'),
    onError: () => toast.error('Failed to export notifications CSV'),
  });
}

export function useExportNotificationsPDF() {
  return useMutation({
    mutationFn: () => adminApi.exportNotificationsPDF(),
    onSuccess: () => toast.success('Notifications PDF downloaded'),
    onError: () => toast.error('Failed to export notifications PDF'),
  });
}
