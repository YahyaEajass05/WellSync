import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => usersApi.getDashboard(),
    refetchOnWindowFocus: false,
  });
}
