import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useDashboard } from '@/lib/hooks/useDashboard';

jest.mock('@/lib/api', () => ({
  usersApi: {
    getDashboard: jest.fn().mockResolvedValue({
      user: { firstName: 'John', lastName: 'Doe', email: 'john@example.com', isEmailVerified: true, memberSince: '2024-01-01' },
      stats: { totalPredictions: 10, mentalWellness: { count: 5, averagePrediction: 75 }, stressLevel: { count: 3, averagePrediction: 4 }, academicImpact: { count: 2, averagePrediction: 65 } },
      latestPredictions: {},
      recentActivity: [],
    }),
  },
}));

const createWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

describe('useDashboard', () => {
  it('returns isLoading initially true', () => {
    const { result } = renderHook(() => useDashboard(), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(true);
  });
  it('resolves data after fetch', async () => {
    const { result } = renderHook(() => useDashboard(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBeDefined();
  });
  it('data contains user info', async () => {
    const { result } = renderHook(() => useDashboard(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data?.user?.firstName).toBe('John');
  });
  it('data contains stats', async () => {
    const { result } = renderHook(() => useDashboard(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data?.stats?.totalPredictions).toBe(10);
  });
  it('has no error on success', async () => {
    const { result } = renderHook(() => useDashboard(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeNull();
  });
});
