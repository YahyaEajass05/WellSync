import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store/authStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { LoginCredentials, RegisterData } from '@/types';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setUser, setToken, logout: clearAuth } = useAuthStore();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      // Set cookies so middleware can read auth state on the server edge
      const maxAge = 7 * 24 * 60 * 60;
      document.cookie = `token=${data.token}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `user_role=${data.user.role}; path=/; max-age=${maxAge}; SameSite=Lax`;
      toast.success(`Welcome back${data.user.role === 'admin' ? ', Admin' : ''}!`);
      router.push(data.user.role === 'admin' ? '/admin' : '/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed', { duration: 5000 });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: (data) => {
      // ── IMPORTANT: Do NOT set the auth token or cookie here. ──────────────
      // Setting the token cookie after registration causes the Next.js
      // middleware to treat the user as authenticated. When verify-email
      // redirects to /login?verified=true, the middleware intercepts /login
      // (a guestOnlyRoute) and redirects straight to /dashboard — skipping
      // the login step entirely and ignoring the ?verified=true banner.
      //
      // Correct flow: Register → Verify Email → Login → Dashboard
      //
      // We only store the user email in localStorage so the verify-email page
      // can read it and pre-fill / send the API request with the right email.
      localStorage.setItem('pending-verification-email', data.user?.email ?? '');
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Account created! Please check your email for the verification code.');
      router.push('/verify-email');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearAuth();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('auth-storage');
      // Clear auth cookies so middleware stops treating user as authenticated
      document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';
      document.cookie = 'user_role=; path=/; max-age=0; SameSite=Lax';
      queryClient.clear();
      toast.success('Logged out successfully');
      router.push('/login');
    },
    onError: () => {
      // Even if server logout fails, clear local state
      clearAuth();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('auth-storage');
      document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';
      document.cookie = 'user_role=; path=/; max-age=0; SameSite=Lax';
      queryClient.clear();
      router.push('/login');
    },
  });

  // Get current user query
  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => authApi.getMe(),
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('token'),
    retry: false,
  });

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
    onSuccess: () => {
      toast.success('Password reset email sent! Check your inbox.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: ({ code, password, email }: { code: string; password: string; email: string }) =>
      authApi.resetPassword(code, password, email),
    onSuccess: () => {
      toast.success('Password reset successfully!');
      router.push('/login?reset=true');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    },
  });

  // Verify email mutation
  const verifyEmailMutation = useMutation({
    mutationFn: ({ code, email }: { code: string; email?: string }) =>
      authApi.verifyEmail(code, email),
    onSuccess: () => {
      toast.success('Email verified successfully!');
      router.push('/login?verified=true');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Verification failed. Please try again.');
    },
  });

  // Resend verification mutation
  const resendVerificationMutation = useMutation({
    mutationFn: () => authApi.resendVerification(),
    onSuccess: () => {
      toast.success('Verification email resent! Check your inbox.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to resend verification email');
    },
  });

  return {
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    forgotPassword: forgotPasswordMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    verifyEmail: verifyEmailMutation.mutate,
    resendVerification: resendVerificationMutation.mutate,
    user,
    isLoading,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
    isForgotPasswordLoading: forgotPasswordMutation.isPending,
    isResetPasswordLoading: resetPasswordMutation.isPending,
    isVerifyEmailLoading: verifyEmailMutation.isPending,
    isResendLoading: resendVerificationMutation.isPending,
    loginError: loginMutation.error as any,
    isLoginError: loginMutation.isError,
  };
}
