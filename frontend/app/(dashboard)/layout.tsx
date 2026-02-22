'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // If the page is in the middle of a hard navigation (e.g. account deletion
    // calling window.location.replace) do nothing — the browser is already
    // leaving. Without this guard the auth-guard fires router.replace('/login')
    // which races with window.location.replace('/login?deleted=true') and
    // strips the query param, removing the success banner.
    if (typeof window !== 'undefined' && window.__wellsync_deleting) return;

    // Check both Zustand store and localStorage for token
    const token =
      localStorage.getItem('token') ||
      (() => {
        try {
          const s = localStorage.getItem('auth-storage');
          if (s) return JSON.parse(s)?.state?.token ?? null;
        } catch {
          return null;
        }
        return null;
      })();

    if (!token && !isAuthenticated) {
      router.replace('/login');
    } else {
      setChecked(true);
    }
  }, [isAuthenticated, router]);

  // Prevent children from flashing before auth check completes
  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" suppressHydrationWarning>
      <Navbar />
      <div className="flex" suppressHydrationWarning>
        <Sidebar />
        <main className="flex-1 lg:pl-64" suppressHydrationWarning>
          <div className="container py-6" suppressHydrationWarning>{children}</div>
        </main>
      </div>
    </div>
  );
}
