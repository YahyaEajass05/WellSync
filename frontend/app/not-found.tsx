'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';

export default function NotFound() {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleHomeClick = () => {
    router.push(isAuthenticated ? '/dashboard' : '/login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden px-4">

      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-3/4 left-1/2 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/30"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.4}s`,
              animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className={`relative z-10 text-center max-w-2xl mx-auto transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

        {/* Animated 404 Number */}
        <div className="relative mb-8">
          {/* Pulse rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 rounded-full border-2 border-primary/20 animate-ping" style={{ animationDuration: '2s' }} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 rounded-full border border-primary/10 animate-ping" style={{ animationDuration: '3s' }} />
          </div>

          {/* 404 Text */}
          <div className="relative animate-bounce-in">
            <h1 className="text-[10rem] md:text-[14rem] font-black leading-none select-none"
              style={{
                background: 'linear-gradient(135deg, #00BFFF 0%, #1B4965 50%, #17A2B8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 30px rgba(0, 191, 255, 0.3))',
              }}
            >
              404
            </h1>
          </div>

          {/* Floating elements around 404 */}
          <div className="absolute top-4 right-8 animate-float-slow" style={{ animationDelay: '0.5s' }}>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Search className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="absolute bottom-4 left-8 animate-float" style={{ animationDelay: '1s' }}>
            <div className="w-6 h-6 rounded-full bg-teal-500/20" />
          </div>
        </div>

        {/* Wave SVG Decoration */}
        <div className="mb-6 flex justify-center">
          <svg width="200" height="40" viewBox="0 0 200 40" className="text-primary/40">
            <path
              d="M0,20 C25,5 50,35 75,20 C100,5 125,35 150,20 C175,5 190,30 200,20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <animate
                attributeName="d"
                values="M0,20 C25,5 50,35 75,20 C100,5 125,35 150,20 C175,5 190,30 200,20;
                        M0,20 C25,35 50,5 75,20 C100,35 125,5 150,20 C175,35 190,10 200,20;
                        M0,20 C25,5 50,35 75,20 C100,5 125,35 150,20 C175,5 190,30 200,20"
                dur="3s"
                repeatCount="indefinite"
              />
            </path>
          </svg>
        </div>

        {/* Message */}
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Oops! Page Not Found
          </h2>
          <p className="text-muted-foreground text-lg mb-2">
            The page you're looking for seems to have wandered off into the wellness void.
          </p>
          <p className="text-muted-foreground text-sm mb-8">
            Don't worry — your mental wellness journey continues on the right path!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <Button size="lg" className="gap-2 w-full sm:w-auto" onClick={handleHomeClick}>
            <Home className="h-5 w-5" />
            {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="gap-2 w-full sm:w-auto"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </Button>
        </div>

        {/* Quick Links */}
        {isAuthenticated && (
          <div className="mt-10 animate-slide-up" style={{ animationDelay: '0.7s' }}>
            <p className="text-sm text-muted-foreground mb-3">Quick Links</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { href: '/predictions/mental-wellness', label: 'Mental Wellness' },
                { href: '/predictions/stress', label: 'Stress Level' },
                { href: '/predictions/academic', label: 'Academic Impact' },
                { href: '/analytics', label: 'Analytics' },
              ].map((link) => (
                <Link key={link.href} href={link.href}>
                  <span className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary hover:text-primary transition-colors cursor-pointer">
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* WellSync Branding */}
        <div className="mt-12 animate-fade-in" style={{ animationDelay: '1s' }}>
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-primary">WellSync</span> — AI-Powered Mental Wellness Platform
          </p>
        </div>
      </div>
    </div>
  );
}
