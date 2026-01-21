'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/hooks/useAuth';
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
import { Brain, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { AuthBackground } from '@/components/three/AuthBackground';
import { BackToHomeButton } from '@/components/layout/BackToHomeButton';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoginLoading } = useAuth();
  const [showVerifiedMessage, setShowVerifiedMessage] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Check if redirected from email verification or password reset
  useEffect(() => {
    const verified = searchParams.get('verified');
    const reset = searchParams.get('reset');
    
    if (verified === 'true') {
      setShowVerifiedMessage(true);
      toast.success('Email verified successfully! You can now log in.');
      // Remove the query parameter
      router.replace('/login');
    }
    
    if (reset === 'true') {
      toast.success('Password reset successfully! Please log in with your new password.');
      router.replace('/login');
    }
  }, [searchParams, router]);

  const onSubmit = (data: LoginFormData) => {
    login(data);
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
            <Brain className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your WellSync account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showVerifiedMessage && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <p className="text-sm text-green-700 dark:text-green-300">
                Email verified! Please log in to continue.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoginLoading}>
              {isLoginLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  );
}
