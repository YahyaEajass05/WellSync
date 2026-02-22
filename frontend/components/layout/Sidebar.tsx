'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Brain,
  BarChart3,
  Settings,
  User,
  Sun,
  Moon,
  Shield,
  Bell,
} from 'lucide-react';
import { useUIStore } from '@/lib/store/uiStore';
import { useAuthStore } from '@/lib/store/authStore';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen } = useUIStore();
  const { user } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Build menu items dynamically based on user role
  const menuItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Predictions',
      href: '/predictions',
      icon: Brain,
      children: [
        { title: 'Mental Wellness', href: '/predictions/mental-wellness' },
        { title: 'Academic Impact', href: '/predictions/academic' },
        { title: 'Stress Level', href: '/predictions/stress' },
      ],
    },
    {
      title: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
    },
    {
      title: 'Profile',
      href: '/profile',
      icon: User,
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: Settings,
    },
    ...(user?.role === 'admin'
      ? [
          {
            title: 'Admin Panel',
            href: '/admin',
            icon: Shield,
            children: [
              { title: 'Dashboard',       href: '/admin'                  },
              { title: 'Users',           href: '/admin/users'            },
              { title: 'Predictions',     href: '/admin/predictions'      },
              { title: 'Notifications',   href: '/admin/notifications'    },
              { title: 'Broadcast',       href: '/admin/broadcast'        },
              { title: 'Stats',           href: '/admin/stats'            },
            ],
          },
        ]
      : []),
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!sidebarOpen) return null;

  const isDark = theme === 'dark';

  return (
    <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background transition-transform lg:translate-x-0">
      <div className="flex h-full flex-col gap-2 p-4">

        {/* ── Theme Toggle ── */}
        <div className="flex items-center justify-between rounded-lg border px-3 py-2 mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            {!mounted ? 'Theme' : isDark ? 'Dark Mode' : 'Light Mode'}
          </span>
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              mounted && isDark ? 'bg-primary' : 'bg-muted'
            )}
            aria-label="Toggle theme"
          >
            <span
              className={cn(
                'inline-flex h-4 w-4 transform items-center justify-center rounded-full bg-white shadow transition-transform',
                mounted && isDark ? 'translate-x-6' : 'translate-x-1'
              )}
            >
              {mounted && isDark ? (
                <Moon className="h-2.5 w-2.5 text-primary" />
              ) : (
                <Sun className="h-2.5 w-2.5 text-yellow-500" />
              )}
            </span>
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
                {item.children && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'block rounded-lg px-3 py-2 text-sm transition-colors',
                          pathname === child.href
                            ? 'bg-accent text-accent-foreground'
                            : 'hover:bg-accent/50'
                        )}
                      >
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
