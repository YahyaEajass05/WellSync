'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm"
      >
        <Sun className="h-5 w-5 text-white" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-yellow-300 transition-all" />
      ) : (
        <Moon className="h-5 w-5 text-indigo-300 transition-all" />
      )}
    </Button>
  );
}
