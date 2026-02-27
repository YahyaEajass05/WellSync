import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/lib/api/profile';

// Overview:
export function useProfileOverview() {
  return useQuery({
    queryKey: ['profile', 'overview'],
    queryFn: () => profileApi.getOverview(),
    refetchOnWindowFocus: false,
  });
}

// Mental Wellness Profile:
export function useMentalWellnessProfile() {
  return useQuery({
    queryKey: ['profile', 'mental-wellness'],
    queryFn: () => profileApi.getMentalWellnessProfile(),
    refetchOnWindowFocus: false,
  });
}

export function useSaveMentalWellnessProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.saveMentalWellnessProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

// Student Profile:
export function useStudentProfile() {
  return useQuery({
    queryKey: ['profile', 'student'],
    queryFn: () => profileApi.getStudentProfile(),
    refetchOnWindowFocus: false,
  });
}

export function useSaveStudentProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.saveStudentProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

// Screen Time:
export function useScreenTime(days = 7) {
  return useQuery({
    queryKey: ['profile', 'screen-time', days],
    queryFn: () => profileApi.getScreenTime(days),
    refetchOnWindowFocus: false,
  });
}

export function useLogScreenTime() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.logScreenTime,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'screen-time'] });
      queryClient.invalidateQueries({ queryKey: ['profile', 'overview'] });
    },
  });
}

// Sleep:
export function useSleep(days = 7) {
  return useQuery({
    queryKey: ['profile', 'sleep', days],
    queryFn: () => profileApi.getSleep(days),
    refetchOnWindowFocus: false,
  });
}

export function useLogSleep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.logSleep,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'sleep'] });
      queryClient.invalidateQueries({ queryKey: ['profile', 'overview'] });
    },
  });
}
