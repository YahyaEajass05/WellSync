import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type AdminUser, type AdminAnalytics } from '../api/admin';
import { toast } from 'sonner';

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

export function useBroadcastNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { title: string; message: string; priority?: string }) =>
      adminApi.broadcastNotification(data),
    onSuccess: (response) => {
      toast.success(response.message || 'Notification broadcasted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to broadcast notification');
    },
  });
}
