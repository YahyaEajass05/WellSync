'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { AuthBackground } from '@/components/three/AuthBackground';
import { BackToHomeButton } from '@/components/layout/BackToHomeButton';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

const resetPasswordSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    code: z
      .string()
      .length(6, 'Reset code must be 6 digits')
      .regex(/^\d+$/, 'Code must contain only numbers'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and number'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetStatus, setResetStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Pre-fill email from URL parameter
  useEffect(() => {
    const email = searchParams.get('email');
    if (email) {
      setValue('email', email);
    }
  }, [searchParams, setValue]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsSubmitting(true);
    setResetStatus('idle');

    try {
      await authApi.resetPassword(data.code, data.password, data.email);
      setResetStatus('success');
      toast.success('Password reset successfully!');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login?reset=true');
      }, 2000);
    } catch (error: any) {
      setResetStatus('error');
      console.error('Reset password error:', error.response?.data);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to reset password. Please check your code and try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AuthBackground />
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        {/* Back to Home Button */}
        <div className="absolute top-4 left-4 z-10">
          <BackToHomeButton variant="with-back" />
        </div>
        
        {/* Theme Toggle Button */}
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        
        <Card className="w-full max-w-md relative z-10 backdrop-blur-xl bg-white/95 dark:bg-slate-900/90 border-slate-200/50 dark:border-white/10 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {resetStatus === 'success' ? (
              <CheckCircle2 className="h-12 w-12 text-green-500 animate-bounce" />
            ) : resetStatus === 'error' ? (
              <XCircle className="h-12 w-12 text-red-500" />
            ) : (
              <Lock className="h-12 w-12 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <CardDescription>
            {resetStatus === 'success'
              ? 'Your password has been reset successfully!'
              : 'Enter the code from your email and choose a new password'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resetStatus === 'success' ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
                <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-green-700 dark:text-green-300 font-medium">
                  Password Reset Successful!
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  Redirecting to login page...
                </p>
              </div>
              <Button
                onClick={() => router.push('/login')}
                className="w-full"
              >
                Go to Login Now
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Reset Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                  {...register('code')}
                  autoFocus
                />
                {errors.code && (
                  <p className="text-sm text-destructive">
                    {errors.code.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters with uppercase, lowercase, and number
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || resetStatus === 'success'}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>

              {resetStatus === 'error' && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-center">
                  <XCircle className="h-5 w-5 text-red-500 mx-auto mb-1" />
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Password reset failed. Please try again.
                  </p>
                </div>
              )}

              <div className="text-center text-sm">
                <Link
                  href="/forgot-password"
                  className="text-primary hover:underline"
                >
                  Request new code
                </Link>
                {' or '}
                <Link href="/login" className="text-primary hover:underline">
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
      </div>
    </>
  );
}
