import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/api/axios-instance';

export function useAnalytics() {
  const queryClient = useQueryClient();

  const insightsQuery = useQuery({
    queryKey: ['analytics', 'insights'],
    queryFn: async () => {
      const res = await axios.get('/analytics/insights');
      return res.data.data;
    },
    refetchOnWindowFocus: false,
  });

  const generateMutation = useMutation({
    mutationFn: async (period: string) => {
      const res = await axios.post('/analytics/generate', { period });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  return {
    insights: insightsQuery.data,
    isLoadingInsights: insightsQuery.isLoading,
    insightsError: insightsQuery.error,
    generateAnalytics: generateMutation.mutate,
    isGenerating: generateMutation.isPending,
  };
}

export function useWeeklyAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'weekly'],
    queryFn: async () => {
      await axios.post('/analytics/generate', { period: 'weekly' });
      const res = await axios.get('/analytics/weekly');
      return res.data.data;
    },
    refetchOnWindowFocus: false,
  });
}

export function useMonthlyAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'monthly'],
    queryFn: async () => {
      await axios.post('/analytics/generate', { period: 'monthly' });
      const res = await axios.get('/analytics/monthly');
      return res.data.data;
    },
    refetchOnWindowFocus: false,
  });
}
