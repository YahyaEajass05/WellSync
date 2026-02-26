'use client';

import { useState } from 'react';
import { useAdminUsers, useAdminAnalytics, useUpdateUserRole, useUpdateUserStatus, useDeleteUser } from '@/lib/hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Activity, Brain, TrendingUp, Search, Shield, Ban, Trash2, CheckCircle, XCircle, Loader2, BarChart3, Bell, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { DashboardSkeleton, TableSkeleton } from '@/components/ui/loading-skeleton';
import { UserGrowthChart, PredictionTypeChart, WellnessTrendChart, StressDistributionChart, ActivityHeatmap } from '@/components/charts';
import { useExportUsersCSV, useExportUsersPDF } from '@/lib/hooks/useAdmin';

export default function AdminDashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; userId: string; userName: string }>({
    isOpen: false,
    userId: '',
    userName: '',
  });
  
  // Fetch data
  const { data: usersData, isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useAdminUsers({ 
    page, 
    limit: 10, 
    search: searchQuery || undefined,
    role: roleFilter || undefined 
  });
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError, refetch: refetchAnalytics } = useAdminAnalytics();
  
  // Mutations
  const updateRoleMutation = useUpdateUserRole();
  const updateStatusMutation = useUpdateUserStatus();
  const deleteUserMutation = useDeleteUser();

  // Export
  const exportCSV = useExportUsersCSV();
  const exportPDF = useExportUsersPDF();

  const handleToggleActive = (userId: string, currentStatus: boolean) => {
    updateStatusMutation.mutate({ userId, isActive: !currentStatus });
  };

  const handleToggleRole = (userId: string, currentRole: 'user' | 'admin') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    setDeleteConfirmation({ isOpen: true, userId, userName });
  };

  const confirmDelete = () => {
    deleteUserMutation.mutate(deleteConfirmation.userId, {
      onSuccess: () => {
        setDeleteConfirmation({ isOpen: false, userId: '', userName: '' });
      },
    });
  };

  if (analyticsLoading) {
    return <DashboardSkeleton />;
  }

  if (analyticsError) {
    return (
      <ErrorState
        title="Failed to load admin dashboard"
        message="We couldn't load the dashboard data. Please try again."
        onRetry={refetchAnalytics}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage users, monitor system analytics, and oversee platform operations
        </p>
      </div>

      {/* Quick Navigation */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/admin/predictions">
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Predictions</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">View all predictions</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/broadcast">
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Broadcast</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Send notifications</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/stats">
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Stats</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Detailed statistics</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.users?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.users?.active || 0} active · {analytics?.users?.newLastWeek || 0} new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.predictions?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.predictions?.recentLastWeek || 0} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Mental Wellness</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.predictions?.avgMentalWellnessScore || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              Out of 100
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predictions by Type</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Mental Wellness:</span>
                <span className="font-medium">{analytics?.predictions?.mentalWellness || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Academic Impact:</span>
                <span className="font-medium">{analytics?.predictions?.academicImpact || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Growth (Last 30 Days)</CardTitle>
            <CardDescription>Daily new user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <UserGrowthChart data={analytics?.trends?.userGrowth || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Predictions by Type</CardTitle>
            <CardDescription>Distribution of prediction categories</CardDescription>
          </CardHeader>
          <CardContent>
            <PredictionTypeChart data={{
              mentalWellness: analytics?.predictions?.mentalWellness || 0,
              stressLevel: analytics?.predictions?.stressLevel || 0,
              academicImpact: analytics?.predictions?.academicImpact || 0,
            }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mental Wellness Trend</CardTitle>
            <CardDescription>Average wellness scores over time</CardDescription>
          </CardHeader>
          <CardContent>
            <WellnessTrendChart data={analytics?.charts?.wellnessTrend || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stress Level Distribution</CardTitle>
            <CardDescription>User stress levels breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <StressDistributionChart data={analytics?.charts?.stressDistribution || []} />
          </CardContent>
        </Card>
      </div>

      {/* Activity Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Activity Heatmap</CardTitle>
          <CardDescription>User and prediction activity by hour of day</CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityHeatmap data={analytics?.charts?.hourlyActivity || []} />
        </CardContent>
      </Card>

      {/* User Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage all registered users</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportCSV.mutate()}
                disabled={exportCSV.isPending}
              >
                {exportCSV.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />}
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportPDF.mutate()}
                disabled={exportPDF.isPending}
              >
                {exportPDF.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2 text-red-500" />}
                Export PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Users Table */}
          {usersLoading ? (
            <TableSkeleton rows={10} />
          ) : usersError ? (
            <ErrorState
              title="Failed to load users"
              message="We couldn't load the user list. Please try again."
              onRetry={refetchUsers}
            />
          ) : !usersData?.data?.users || usersData.data.users.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No users found"
              description={searchQuery || roleFilter ? "No users match your search criteria. Try adjusting your filters." : "No users have registered yet."}
            />
          ) : (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium">User</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Joined</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersData?.data?.users?.map((user: any) => (
                    <tr key={user._id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}
                        >
                          {user.role === 'admin' && <Shield className="h-3 w-3" />}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            user.isActive
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {user.isActive ? (
                            <>
                              <CheckCircle className="h-3 w-3" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" /> Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/users/${user._id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleRole(user._id, user.role)}
                            disabled={updateRoleMutation.isPending}
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            {user.role === 'admin' ? 'Demote' : 'Promote'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(user._id, user.isActive)}
                            disabled={updateStatusMutation.isPending}
                          >
                            {user.isActive ? (
                              <>
                                <Ban className="h-3 w-3 mr-1" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Activate
                              </>
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user._id, user.name || user.email)}
                            disabled={deleteUserMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Confirmation Dialog */}
          <ConfirmationDialog
            isOpen={deleteConfirmation.isOpen}
            onClose={() => setDeleteConfirmation({ isOpen: false, userId: '', userName: '' })}
            onConfirm={confirmDelete}
            title="Delete User"
            description={`Are you sure you want to delete ${deleteConfirmation.userName}? This action cannot be undone and will permanently remove all user data including predictions and notifications.`}
            confirmText="Delete User"
            cancelText="Cancel"
            variant="danger"
            isLoading={deleteUserMutation.isPending}
          />

          {/* Pagination */}
          {usersData?.data?.pagination && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((usersData.data.pagination.page - 1) * usersData.data.pagination.limit) + 1} to{' '}
                {Math.min(
                  usersData.data.pagination.page * usersData.data.pagination.limit,
                  usersData.data.pagination.total
                )}{' '}
                of {usersData.data.pagination.total} users
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= usersData.data.pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
