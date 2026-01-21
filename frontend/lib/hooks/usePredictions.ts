import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { predictionsApi } from '@/lib/api';
import { toast } from 'sonner';
import type {
  MentalWellnessInput,
  AcademicImpactInput,
  StressLevelInput,
} from '@/types';

export function usePredictions() {
  const queryClient = useQueryClient();

  // Get all predictions
  const {
    data: predictions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['predictions'],
    queryFn: () => predictionsApi.getPredictions(),
  });

  // Create mental wellness prediction
  const createMentalWellness = useMutation({
    mutationFn: (data: MentalWellnessInput) =>
      predictionsApi.predictMentalWellness(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Mental wellness prediction created!');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to create prediction'
      );
    },
  });

  // Create academic impact prediction
  const createAcademicImpact = useMutation({
    mutationFn: (data: AcademicImpactInput) =>
      predictionsApi.predictAcademicImpact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Academic impact prediction created!');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to create prediction'
      );
    },
  });

  // Create stress level prediction
  const createStressLevel = useMutation({
    mutationFn: (data: StressLevelInput) =>
      predictionsApi.predictStressLevel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Stress level prediction created!');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to create prediction'
      );
    },
  });

  // Delete prediction
  const deletePrediction = useMutation({
    mutationFn: (id: string) => predictionsApi.deletePrediction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
      toast.success('Prediction deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete');
    },
  });

  return {
    predictions: predictions?.predictions || [],
    total: predictions?.total || 0,
    isLoading,
    error,
    createMentalWellness: createMentalWellness.mutate,
    createAcademicImpact: createAcademicImpact.mutate,
    createStressLevel: createStressLevel.mutate,
    deletePrediction: deletePrediction.mutate,
    isCreating:
      createMentalWellness.isPending ||
      createAcademicImpact.isPending ||
      createStressLevel.isPending,
  };
}

export function usePrediction(id: string) {
  return useQuery({
    queryKey: ['prediction', id],
    queryFn: () => predictionsApi.getPrediction(id),
    enabled: !!id,
  });
}
