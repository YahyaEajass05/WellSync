'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { Brain, Loader2, Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { AuthBackground } from '@/components/three/AuthBackground';
import { BackToHomeButton } from '@/components/layout/BackToHomeButton';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);

    try {
      console.log('Sending forgot password request for:', data.email);
      await authApi.forgotPassword(data.email);
      console.log('Forgot password request successful');
      setEmailSent(true);
      setSubmittedEmail(data.email);
      toast.success('Password reset code sent to your email!');
    } catch (error: any) {
      console.error('Forgot password error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        fullError: error
      });
      
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to send reset code. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!submittedEmail) return;
    
    setIsSubmitting(true);
    try {
      await authApi.forgotPassword(submittedEmail);
      toast.success('Password reset code resent to your email!');
    } catch (error: any) {
      toast.error('Failed to resend code. Please try again.');
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
            {emailSent ? (
              <CheckCircle2 className="h-12 w-12 text-green-500 animate-bounce" />
            ) : (
              <Mail className="h-12 w-12 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {emailSent ? 'Check Your Email' : 'Forgot Password?'}
          </CardTitle>
          <CardDescription>
            {emailSent
              ? `We've sent a password reset code to ${submittedEmail}`
              : "No worries! Enter your email and we'll send you a reset code."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emailSent ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
                <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-green-700 dark:text-green-300 font-medium">
                  Reset Code Sent!
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  Check your email for the 6-digit code
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => router.push(`/reset-password?email=${encodeURIComponent(submittedEmail)}`)}
                  className="w-full"
                >
                  Enter Reset Code
                </Button>

                <Button
                  variant="outline"
                  onClick={handleResend}
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resending...
                    </>
                  ) : (
                    'Resend Code'
                  )}
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p className="mb-2">Didn't receive the email?</p>
                <p>Check your spam folder or try resending</p>
              </div>
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
                  autoFocus
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending code...
                  </>
                ) : (
                  'Send Reset Code'
                )}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </form>
          )}

          {!emailSent && (
            <div className="mt-6 text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </>
  );
}
