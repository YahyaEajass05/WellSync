'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUserDetails, useUpdateUserRole, useUpdateUserStatus, useDeleteUser } from '@/lib/hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Mail, Calendar, Shield, CheckCircle, XCircle, Loader2, Trash2, Ban, Brain } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { DashboardSkeleton } from '@/components/ui/loading-skeleton';

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = (params?.id as string) || '';
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);

  const { data, isLoading, error, refetch } = useUserDetails(userId);
  const updateRoleMutation = useUpdateUserRole();
  const updateStatusMutation = useUpdateUserStatus();
  const deleteUserMutation = useDeleteUser();

  const handleToggleRole = () => {
    const newRole = data.user.role === 'admin' ? 'user' : 'admin';
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  const handleToggleStatus = () => {
    updateStatusMutation.mutate({ userId, isActive: !data.user.isActive });
  };

  const handleDelete = () => {
    setDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    deleteUserMutation.mutate(userId, {
      onSuccess: () => {
        setDeleteConfirmation(false);
        router.push('/admin');
      },
    });
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
        </div>
        <ErrorState
          title="Failed to load user details"
          message="We couldn't load the user information. Please try again."
          onRetry={refetch}
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
        </div>
        <EmptyState
          icon={User}
          title="User not found"
          description="The user you're looking for doesn't exist or has been deleted."
          action={{
            label: 'Back to Admin',
            onClick: () => router.push('/admin'),
          }}
        />
      </div>
    );
  }

  const user = data.user;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleToggleRole}
            disabled={updateRoleMutation.isPending}
          >
            <Shield className="h-4 w-4 mr-2" />
            {user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
          </Button>
          <Button
            variant="outline"
            onClick={handleToggleStatus}
            disabled={updateStatusMutation.isPending}
          >
            {user.isActive ? (
              <>
                <Ban className="h-4 w-4 mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteUserMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete User
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Basic account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-sm text-muted-foreground">{user.name || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Joined</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
            {user.lastLogin && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Last Login</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(user.lastLogin).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
            <CardDescription>Current account state</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Role</span>
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                  user.role === 'admin'
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                }`}
              >
                {user.role === 'admin' && <Shield className="h-3 w-3" />}
                {user.role}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
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
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Email Verified</span>
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                  user.isEmailVerified
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}
              >
                {user.isEmailVerified ? (
                  <>
                    <CheckCircle className="h-3 w-3" /> Verified
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3" /> Not Verified
                  </>
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prediction Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Prediction Statistics</CardTitle>
          <CardDescription>User's prediction history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Predictions</span>
              <span className="text-2xl font-bold">{data.statistics?.totalPredictions || 0}</span>
            </div>

            {data.statistics?.recentPredictions && data.statistics.recentPredictions.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-3">Recent Predictions</h3>
                <div className="space-y-2">
                  {data.statistics.recentPredictions.map((pred: any) => (
                    <div
                      key={pred._id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <p className="text-sm font-medium capitalize">
                          {pred.predictionType.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(pred.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-sm font-medium">
                        Score: {pred.result?.prediction?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!data.statistics?.recentPredictions || data.statistics.recentPredictions.length === 0) && (
              <EmptyState
                icon={Brain}
                title="No predictions yet"
                description="This user hasn't made any predictions."
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmation}
        onClose={() => setDeleteConfirmation(false)}
        onConfirm={confirmDelete}
        title="Delete User"
        description={`Are you sure you want to delete ${data.user.name || data.user.email}? This action cannot be undone and will permanently remove all user data including predictions and notifications.`}
        confirmText="Delete User"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteUserMutation.isPending}
      />
    </div>
  );
}
