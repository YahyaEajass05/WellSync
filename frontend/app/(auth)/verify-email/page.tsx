'use client';

import { useState, useEffect } from 'react';
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
import { Brain, Loader2, CheckCircle2, XCircle, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { AuthBackground } from '@/components/three/AuthBackground';
import { BackToHomeButton } from '@/components/layout/BackToHomeButton';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

const verifySchema = z.object({
  code: z
    .string()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d+$/, 'Code must contain only numbers'),
});

type VerifyFormData = z.infer<typeof verifySchema>;

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [countdown, setCountdown] = useState(0);
  const [userEmail, setUserEmail] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
  });

  // Get user email from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setUserEmail(user.email);
        } catch (error) {
          console.error('Error parsing stored user:', error);
        }
      }
    }
  }, []);

  // Auto-fill code from URL if present
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setValue('code', code);
      // Auto-submit if code is in URL
      handleSubmit(onSubmit)();
    }
  }, [searchParams, setValue]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const onSubmit = async (data: VerifyFormData) => {
    setIsVerifying(true);
    setVerificationStatus('idle');

    try {
      // Get user email from localStorage
      let userEmail = '';
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          userEmail = user.email;
        }
      }

      await authApi.verifyEmail(data.code, userEmail);
      setVerificationStatus('success');
      toast.success('Email verified successfully!');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login?verified=true');
      }, 2000);
    } catch (error: any) {
      setVerificationStatus('error');
      console.error('Verification error:', error.response?.data); // Debug logging
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Verification failed. Please check your code and try again.';
      toast.error(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    try {
      await authApi.resendVerification();
      toast.success('Verification code sent to your email!');
      setCountdown(60); // 60 second cooldown
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          'Failed to resend code. Please try again.'
      );
    } finally {
      setIsResending(false);
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
            {verificationStatus === 'success' ? (
              <CheckCircle2 className="h-12 w-12 text-green-500 animate-bounce" />
            ) : verificationStatus === 'error' ? (
              <XCircle className="h-12 w-12 text-red-500" />
            ) : (
              <Mail className="h-12 w-12 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            {verificationStatus === 'success'
              ? 'Your email has been verified successfully!'
              : 'Enter the 6-digit code sent to your email address'}
          </CardDescription>
          {userEmail && verificationStatus !== 'success' && (
            <p className="text-sm text-muted-foreground mt-2">
              Code sent to: <span className="font-medium">{userEmail}</span>
            </p>
          )}
        </CardHeader>
        <CardContent>
          {verificationStatus === 'success' ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
                <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-green-700 dark:text-green-300 font-medium">
                  Email Verified!
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
                <Label htmlFor="code">Verification Code</Label>
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
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isVerifying || verificationStatus === 'success'}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </Button>

              {verificationStatus === 'error' && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-center">
                  <XCircle className="h-5 w-5 text-red-500 mx-auto mb-1" />
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Verification failed. Please try again.
                  </p>
                </div>
              )}
            </form>
          )}

          {verificationStatus !== 'success' && (
            <>
              <div className="mt-6 space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Didn't receive the code?
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleResendCode}
                  disabled={isResending || countdown > 0}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : countdown > 0 ? (
                    `Resend Code (${countdown}s)`
                  ) : (
                    'Resend Verification Code'
                  )}
                </Button>
              </div>

              <div className="mt-6 text-center text-sm">
                <p className="text-muted-foreground mb-2">
                  Check your spam folder if you don't see the email.
                </p>
                <Button
                  variant="link"
                  onClick={() => router.push('/login')}
                  className="text-primary"
                >
                  Back to Login
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      </div>
    </>
  );
}
