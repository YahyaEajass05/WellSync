'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Auto-shake on mount
    setTimeout(() => setShaking(true), 500);
    setTimeout(() => setShaking(false), 1200);
  }, []);

  const handleReset = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 600);
    reset();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden px-4">

      {/* ── Animated Background ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-destructive/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-2/3 left-1/2 w-48 h-48 bg-red-500/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* ── Grid Pattern ── */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(#ff0000 1px, transparent 1px), linear-gradient(90deg, #ff0000 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      {/* ── Main Content ── */}
      <div className={`relative z-10 text-center max-w-xl mx-auto transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

        {/* ── Animated Error Icon ── */}
        <div className="relative mb-8 flex items-center justify-center">

          {/* Pulse rings */}
          <div className="absolute w-40 h-40 rounded-full bg-destructive/10 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute w-56 h-56 rounded-full bg-destructive/5 animate-ping" style={{ animationDuration: '3s' }} />

          {/* Main icon */}
          <div className={`relative w-32 h-32 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 border-2 border-red-500/30 flex items-center justify-center ${shaking ? 'animate-shake' : ''}`}>
            <AlertTriangle className="h-16 w-16 text-red-500 animate-bounce-in" />
          </div>

          {/* Orbiting dots */}
          <div className="absolute w-2 h-2 rounded-full bg-red-400" style={{ animation: 'orbit 3s linear infinite' }} />
          <div className="absolute w-1.5 h-1.5 rounded-full bg-orange-400" style={{ animation: 'orbit 4s linear infinite reverse', animationDelay: '1s' }} />
        </div>

        {/* ── 500 Number ── */}
        <div className="animate-bounce-in mb-4">
          <span className="text-8xl font-black"
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            500
          </span>
        </div>

        {/* ── Message ── */}
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Something Went Wrong
          </h2>
          <p className="text-muted-foreground text-base mb-2">
            Our wellness AI encountered an unexpected error. Don't panic — this happens sometimes!
          </p>

          {/* Error detail */}
          {error?.message && (
            <div className="mt-4 mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-left">
              <p className="text-xs text-muted-foreground font-mono break-all">
                ⚠️ {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-muted-foreground mt-1 font-mono">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Loading bar animation */}
          <div className="w-full h-1 bg-muted rounded-full mb-8 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
              style={{ animation: 'slide-in 2s ease-in-out infinite alternate' }}
            />
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <Button
            size="lg"
            className="gap-2 w-full sm:w-auto"
            onClick={handleReset}
          >
            <RefreshCw className="h-5 w-5" />
            Try Again
          </Button>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
              <Home className="h-5 w-5" />
              Go to Dashboard
            </Button>
          </Link>
        </div>

        {/* ── Help Text ── */}
        <div className="mt-10 animate-slide-up" style={{ animationDelay: '0.7s' }}>
          <p className="text-sm text-muted-foreground">
            If this persists, contact us at{' '}
            <a href="mailto:wellsync.lk@gmail.com" className="text-primary hover:underline">
              wellsync.lk@gmail.com
            </a>
          </p>
        </div>

        {/* ── WellSync Branding ── */}
        <div className="mt-8 animate-fade-in" style={{ animationDelay: '1s' }}>
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-primary">WellSync</span> — AI-Powered Mental Wellness Platform
          </p>
        </div>
      </div>
    </div>
  );
}
