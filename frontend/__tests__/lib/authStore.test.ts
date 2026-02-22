import { act, renderHook } from '@testing-library/react';
import { useAuthStore } from '@/lib/store/authStore';

const mockUser = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  fullName: 'John Doe',
  email: 'john@example.com',
  role: 'user' as const,
  isEmailVerified: true,
  createdAt: '2024-01-01',
};

describe('useAuthStore', () => {
  beforeEach(() => {
    act(() => {
      useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
    });
  });

  it('has correct initial state', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('setUser updates user and isAuthenticated', () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => { result.current.setUser(mockUser); });
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('setUser with null clears user and isAuthenticated', () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => { result.current.setUser(mockUser); });
    act(() => { result.current.setUser(null); });
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('setToken stores the token', () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => { result.current.setToken('my-jwt-token'); });
    expect(result.current.token).toBe('my-jwt-token');
  });

  it('setToken with null clears the token', () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => { result.current.setToken('my-jwt-token'); });
    act(() => { result.current.setToken(null); });
    expect(result.current.token).toBeNull();
  });

  it('logout clears user, token, and isAuthenticated', () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.setUser(mockUser);
      result.current.setToken('my-jwt-token');
    });
    act(() => { result.current.logout(); });
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('isAuthenticated is true after setUser with valid user', () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => { result.current.setUser(mockUser); });
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('stores admin user correctly', () => {
    const adminUser = { ...mockUser, role: 'admin' as const };
    const { result } = renderHook(() => useAuthStore());
    act(() => { result.current.setUser(adminUser); });
    expect(result.current.user?.role).toBe('admin');
  });
});
