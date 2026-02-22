'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Brain, Menu, Bell, User, LogOut, Settings, LayoutDashboard, ChevronDown, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store/authStore';
import { useAuth } from '@/lib/hooks/useAuth';
import { useUIStore } from '@/lib/store/uiStore';
import { notificationsApi } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDateTime } from '@/lib/utils';
import type { Notification } from '@/types';

export function Navbar() {
  const { user, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();
  const { toggleSidebar } = useUIStore();
  const queryClient = useQueryClient();

  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications
  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getNotifications({ limit: 10 }),
    enabled: isAuthenticated,
    refetchInterval: 60000, // refresh every minute
  });

  const notifications: Notification[] = notifData?.notifications ?? [];
  const unreadCount = notifData?.unreadCount ?? 0;

  // Mark all as read
  const markAllRead = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  // Mark single as read
  const markRead = useMutation({
    mutationFn: (ids: string[]) => notificationsApi.markAsRead(ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  // Delete notification
  const deleteNotif = useMutation({
    mutationFn: (id: string) => notificationsApi.deleteNotification(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const priorityColor = (priority: string) => {
    if (priority === 'urgent') return 'bg-red-500';
    if (priority === 'high') return 'bg-orange-500';
    if (priority === 'medium') return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Link href={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">WellSync</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          {isAuthenticated ? (
            <>
              {/* ── Notifications Bell ── */}
              <div className="relative" ref={notifRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setNotifOpen(o => !o); setUserOpen(false); }}
                  className="relative"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>

                {notifOpen && (
                  <div className="absolute right-0 top-12 w-80 bg-background border rounded-xl shadow-2xl z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40">
                      <span className="font-semibold text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllRead.mutate()}
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          <Check className="h-3 w-3" /> Mark all read
                        </button>
                      )}
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                          <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            className={`flex items-start gap-3 px-4 py-3 border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer ${!n.isRead ? 'bg-primary/5' : ''}`}
                            onClick={() => { if (!n.isRead) markRead.mutate([n._id]); }}
                          >
                            <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${priorityColor(n.priority)}`} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${!n.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                              <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(n.createdAt)}</p>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteNotif.mutate(n._id); }}
                              className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                              aria-label="Delete notification"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="px-4 py-2 border-t bg-muted/40 text-center">
                        <Link
                          href="/settings"
                          className="text-xs text-primary hover:underline"
                          onClick={() => setNotifOpen(false)}
                        >
                          Notification settings
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── User Menu ── */}
              <div className="relative" ref={userRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setUserOpen(o => !o); setNotifOpen(false); }}
                  className="flex items-center gap-2 pl-2 pr-3"
                  aria-label="User menu"
                >
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="hidden sm:inline text-sm font-medium max-w-[100px] truncate">
                    {user?.firstName ?? 'Account'}
                  </span>
                  <ChevronDown className={`h-3 w-3 transition-transform ${userOpen ? 'rotate-180' : ''}`} />
                </Button>

                {userOpen && (
                  <div className="absolute right-0 top-12 w-52 bg-background border rounded-xl shadow-2xl z-50 overflow-hidden">
                    {/* User info */}
                    <div className="px-4 py-3 border-b bg-muted/40">
                      <p className="text-sm font-semibold truncate">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    {/* Menu items */}
                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setUserOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setUserOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted transition-colors"
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setUserOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted transition-colors"
                      >
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        Settings
                      </Link>
                    </div>
                    <div className="border-t py-1">
                      <button
                        onClick={() => { setUserOpen(false); logout(); }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
