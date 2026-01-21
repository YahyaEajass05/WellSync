'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackToHomeButtonProps {
  variant?: 'default' | 'with-back';
  className?: string;
}

export function BackToHomeButton({ variant = 'default', className }: BackToHomeButtonProps) {
  if (variant === 'with-back') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Link href="/">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-700 dark:text-white hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <Link href="/" className={className}>
      <Button
        variant="ghost"
        size="sm"
        className="text-slate-700 dark:text-white hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors"
      >
        <Home className="mr-2 h-4 w-4" />
        Home
      </Button>
    </Link>
  );
}
