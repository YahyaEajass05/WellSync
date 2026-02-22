'use client';

import { useState } from 'react';
import { useAdminPredictions } from '@/lib/hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brain, Search, Loader2, ArrowLeft, Filter, TrendingUp, Calendar } from 'lucide-react';
import Link from 'next/link';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/loading-skeleton';

export default function AdminPredictionsPage() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [userIdFilter, setUserIdFilter] = useState('');

  const { data, isLoading, error, refetch } = useAdminPredictions({
    page,
    limit: 20,
    type: typeFilter || undefined,
    userId: userIdFilter || undefined,
  });

  const getPredictionTypeColor = (type: string) => {
    switch (type) {
      case 'mental_wellness':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'stress_level':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'academic_impact':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

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
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              Predictions Management
            </h1>
            <p className="text-muted-foreground mt-1">
              View and analyze all user predictions across the platform
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.data?.pagination?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mental Wellness</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.data?.predictions?.filter((p: any) => p.predictionType === 'mental_wellness').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stress Level</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.data?.predictions?.filter((p: any) => p.predictionType === 'stress_level').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Academic Impact</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.data?.predictions?.filter((p: any) => p.predictionType === 'academic_impact').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Predictions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Predictions</CardTitle>
          <CardDescription>Complete prediction history across all users</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by User ID..."
                value={userIdFilter}
                onChange={(e) => setUserIdFilter(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background min-w-[200px]"
            >
              <option value="">All Types</option>
              <option value="mental_wellness">Mental Wellness</option>
              <option value="stress_level">Stress Level</option>
              <option value="academic_impact">Academic Impact</option>
            </select>
          </div>

          {/* Table */}
          {isLoading ? (
            <TableSkeleton rows={20} />
          ) : error ? (
            <ErrorState
              title="Failed to load predictions"
              message="We couldn't load the predictions data. Please try again."
              onRetry={refetch}
            />
          ) : !data?.data?.predictions || data.data.predictions.length === 0 ? (
            <EmptyState
              icon={Brain}
              title="No predictions found"
              description={typeFilter || userIdFilter ? "No predictions match your filters. Try adjusting your search criteria." : "No predictions have been made yet."}
            />
          ) : (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium">User</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Prediction</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data?.predictions?.map((prediction: any) => (
                    <tr key={prediction._id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">
                            {prediction.user?.firstName} {prediction.user?.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">{prediction.user?.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPredictionTypeColor(
                            prediction.predictionType
                          )}`}
                        >
                          {prediction.predictionType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium">
                          {prediction.result?.prediction?.toFixed(2) || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(prediction.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/users/${prediction.user?._id}`}>
                            <Button variant="outline" size="sm">
                              View User
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {data?.data?.pagination && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((data.data.pagination.page - 1) * data.data.pagination.limit) + 1} to{' '}
                {Math.min(
                  data.data.pagination.page * data.data.pagination.limit,
                  data.data.pagination.total
                )}{' '}
                of {data.data.pagination.total} predictions
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
                  disabled={page >= data.data.pagination.pages}
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
