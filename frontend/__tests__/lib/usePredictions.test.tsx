import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { usePredictions } from '@/lib/hooks/usePredictions';

jest.mock('@/lib/api', () => ({
  predictionsApi: {
    getPredictions: jest.fn().mockResolvedValue({ predictions: [
      { _id: '1', predictionType: 'mental_wellness', result: { prediction: 75 }, createdAt: '2024-01-01', isFavorite: false },
    ], total: 1 }),
    deletePrediction: jest.fn().mockResolvedValue(undefined),
    predictMentalWellness: jest.fn().mockResolvedValue({ _id: '2', predictionType: 'mental_wellness', result: { prediction: 80 }, createdAt: '2024-01-02', isFavorite: false }),
    predictAcademicImpact: jest.fn().mockResolvedValue({ _id: '3', predictionType: 'academic_impact', result: { prediction: 60 }, createdAt: '2024-01-03', isFavorite: false }),
    predictStressLevel: jest.fn().mockResolvedValue({ _id: '4', predictionType: 'stress_level', result: { prediction: 5 }, createdAt: '2024-01-04', isFavorite: false }),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('usePredictions', () => {
  it('returns predictions array', async () => {
    const { result } = renderHook(() => usePredictions(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(Array.isArray(result.current.predictions)).toBe(true);
  });
  it('returns correct total', async () => {
    const { result } = renderHook(() => usePredictions(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.total).toBe(1);
  });
  it('has createMentalWellness function', async () => {
    const { result } = renderHook(() => usePredictions(), { wrapper: createWrapper() });
    expect(typeof result.current.createMentalWellness).toBe('function');
  });
  it('has createAcademicImpact function', async () => {
    const { result } = renderHook(() => usePredictions(), { wrapper: createWrapper() });
    expect(typeof result.current.createAcademicImpact).toBe('function');
  });
  it('has createStressLevel function', async () => {
    const { result } = renderHook(() => usePredictions(), { wrapper: createWrapper() });
    expect(typeof result.current.createStressLevel).toBe('function');
  });
  it('has deletePrediction function', async () => {
    const { result } = renderHook(() => usePredictions(), { wrapper: createWrapper() });
    expect(typeof result.current.deletePrediction).toBe('function');
  });
  it('isCreating is initially false', async () => {
    const { result } = renderHook(() => usePredictions(), { wrapper: createWrapper() });
    expect(result.current.isCreating).toBe(false);
  });
  it('populates predictions data after load', async () => {
    const { result } = renderHook(() => usePredictions(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.predictions.length).toBe(1);
    expect(result.current.predictions[0]._id).toBe('1');
  });
});
