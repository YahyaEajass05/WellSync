'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Bell,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Megaphone,
  Brain,
  Mail,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '@/lib/api/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ── Types ────────────────────────────────────────────────────────────────────

interface NotificationUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Notification {
  _id: string;
  user: NotificationUser;
  title: string;
  message: string;
  type: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  metadata?: Record<string, any>;
}

interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
    stats: {
      total: number;
      read: number;
      unread: number;
      broadcast: number;
    };
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const priorityConfig: Record<string, { label: string; className: string }> = {
  low:    { label: 'Low',    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  medium: { label: 'Medium', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  high:   { label: 'High',   className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  urgent: { label: 'Urgent', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

const typeConfig: Record<string, { label: string; icon: any; className: string }> = {
  broadcast:           { label: 'Broadcast',       icon: Megaphone,    className: 'text-purple-500' },
  prediction_complete: { label: 'Prediction',      icon: Brain,        className: 'text-blue-500'   },
  system_alert:        { label: 'System Alert',    icon: AlertCircle,  className: 'text-red-500'    },
  wellness_reminder:   { label: 'Wellness',        icon: CheckCircle,  className: 'text-green-500'  },
  email:               { label: 'Email',           icon: Mail,         className: 'text-teal-500'   },
  info:                { label: 'Info',            icon: Info,         className: 'text-gray-500'   },
  warning:             { label: 'Warning',         icon: AlertTriangle,className: 'text-yellow-500' },
};

// ── Main Component ───────────────────────────────────────────────────────────

export default function AdminNotificationsPage() {
  const queryClient = useQueryClient();

  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [readFilter, setReadFilter] = useState('');
  const [selected, setSelected]     = useState<string[]>([]);
  const [expanded, setExpanded]     = useState<string | null>(null);

  const LIMIT = 15;

  // ── Fetch notifications ──────────────────────────────────────────────────
  const { data, isLoading, isFetching, refetch } = useQuery<NotificationsResponse>({
    queryKey: ['admin-notifications', page, search, typeFilter, priorityFilter, readFilter],
    queryFn: async () => {
      const res = await adminApi.getNotificationsHistory({
        page,
        limit: LIMIT,
        search,
        type: typeFilter,
        priority: priorityFilter,
        isRead: readFilter,
      });
      return res.data;
    },
    staleTime: 30_000,
  });

  const notifications = data?.data?.notifications ?? [];
  const pagination    = data?.data?.pagination;
  const stats         = data?.data?.stats;

  // ── Delete single ────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteNotificationAdmin(id),
    onSuccess: () => {
      toast.success('Notification deleted');
      setExpanded(null);
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
    onError: () => toast.error('Failed to delete notification'),
  });

  // ── Bulk delete ──────────────────────────────────────────────────────────
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => adminApi.bulkDeleteNotifications(ids),
    onSuccess: (res: any) => {
      const count = res?.data?.data?.deletedCount ?? selected.length;
      toast.success(`${count} notification(s) deleted`);
      setSelected([]);
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
    onError: () => toast.error('Failed to bulk delete'),
  });

  // ── Helpers ──────────────────────────────────────────────────────────────
  const toggleSelect = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const selectAll = () =>
    selected.length === notifications.length
      ? setSelected([])
      : setSelected(notifications.map(n => n._id));

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const resetFilters = () => {
    setSearch(''); setSearchInput('');
    setTypeFilter(''); setPriorityFilter(''); setReadFilter('');
    setPage(1); setSelected([]);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-8 w-8 text-primary" />
            Notification History
          </h1>
          <p className="text-muted-foreground mt-1">
            View, search and manage all system notifications
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total',        value: stats?.total,        color: 'text-primary'    },
          { label: 'Unread',      value: stats?.unread,      color: 'text-yellow-500' },
          { label: 'System Alerts',value: stats?.systemAlerts,color: 'text-red-500'    },
          { label: 'Broadcasts',  value: stats?.broadcasts,  color: 'text-purple-500' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-6 text-center">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value ?? '—'}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Filters ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="flex gap-2 flex-1 min-w-[200px]">
              <Input
                placeholder="Search title, message or user..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button size="sm" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Type filter */}
            <select
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-md border bg-background text-sm"
            >
              <option value="">All Types</option>
              {Object.entries(typeConfig).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>

            {/* Priority filter */}
            <select
              value={priorityFilter}
              onChange={e => { setPriorityFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-md border bg-background text-sm"
            >
              <option value="">All Priorities</option>
              {Object.entries(priorityConfig).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>

            {/* Read filter */}
            <select
              value={readFilter}
              onChange={e => { setReadFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-md border bg-background text-sm"
            >
              <option value="">All Status</option>
              <option value="true">Read</option>
              <option value="false">Unread</option>
            </select>

            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Bulk Actions ── */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <span className="text-sm font-medium">{selected.length} selected</span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => bulkDeleteMutation.mutate(selected)}
            disabled={bulkDeleteMutation.isPending}
          >
            {bulkDeleteMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Delete Selected
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
            Clear Selection
          </Button>
        </div>
      )}

      {/* ── Notifications Table ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Notifications {pagination && `(${pagination.total} total)`}
            </CardTitle>
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={selectAll}>
                {selected.length === notifications.length ? 'Deselect All' : 'Select All'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Bell className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-lg font-medium">No notifications found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => {
                const typeCfg   = typeConfig[n.type] ?? typeConfig['info'];
                const priorityCfg = priorityConfig[n.priority] ?? priorityConfig['medium'];
                const TypeIcon  = typeCfg.icon;
                const isOpen    = expanded === n._id;
                const isChecked = selected.includes(n._id);

                return (
                  <div
                    key={n._id}
                    className={`p-4 transition-colors ${isOpen ? 'bg-accent/30' : 'hover:bg-accent/10'} ${!n.isRead ? 'border-l-2 border-l-primary' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelect(n._id)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 cursor-pointer"
                      />

                      {/* Type Icon */}
                      <div className={`mt-0.5 flex-shrink-0 ${typeCfg.className}`}>
                        <TypeIcon className="h-5 w-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-semibold text-sm ${!n.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {n.title}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityCfg.className}`}>
                                {priorityCfg.label}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                                {typeCfg.label}
                              </span>
                              {!n.isRead && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                                  Unread
                                </span>
                              )}
                            </div>
                            <p className={`text-sm mt-1 ${isOpen ? '' : 'line-clamp-1'} text-muted-foreground`}>
                              {n.message}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => setExpanded(isOpen ? null : n._id)}
                            >
                              {isOpen ? 'Less' : 'More'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => deleteMutation.mutate(n._id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isOpen && (
                          <div className="mt-3 space-y-3 rounded-lg bg-background border p-3">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                              <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase">Recipient</p>
                                <p className="font-medium">{n.user?.firstName} {n.user?.lastName}</p>
                                <p className="text-muted-foreground text-xs">{n.user?.email}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase">Sent At</p>
                                <p className="font-medium">{format(new Date(n.createdAt), 'MMM d, yyyy')}</p>
                                <p className="text-muted-foreground text-xs">{format(new Date(n.createdAt), 'h:mm a')}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase">Read Status</p>
                                <p className={`font-medium ${n.isRead ? 'text-green-500' : 'text-yellow-500'}`}>
                                  {n.isRead ? '✅ Read' : '🔔 Unread'}
                                </p>
                                {n.readAt && (
                                  <p className="text-muted-foreground text-xs">
                                    {format(new Date(n.readAt), 'MMM d, h:mm a')}
                                  </p>
                                )}
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase">Type</p>
                                <p className={`font-medium ${typeCfg.className}`}>{typeCfg.label}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase">Priority</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityCfg.className}`}>
                                  {priorityCfg.label}
                                </span>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase">ID</p>
                                <p className="font-mono text-xs text-muted-foreground truncate">{n._id}</p>
                              </div>
                            </div>

                            {/* Full Message */}
                            <div>
                              <p className="text-xs text-muted-foreground font-medium uppercase mb-1">Full Message</p>
                              <p className="text-sm bg-accent/30 rounded p-2">{n.message}</p>
                            </div>

                            {/* Metadata */}
                            {n.metadata && Object.keys(n.metadata).length > 0 && (
                              <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase mb-1">Metadata</p>
                                <pre className="text-xs bg-accent/30 rounded p-2 overflow-auto max-h-32">
                                  {JSON.stringify(n.metadata, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Footer row */}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span>👤 {n.user?.firstName} {n.user?.lastName}</span>
                          <span>•</span>
                          <span>{format(new Date(n.createdAt), 'MMM d, yyyy · h:mm a')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Pagination ── */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const p = page <= 3 ? i + 1 : page - 2 + i;
              if (p < 1 || p > pagination.pages) return null;
              return (
                <Button
                  key={p}
                  variant={page === p ? 'default' : 'outline'}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
