'use client';

import { useDashboard } from '@/lib/hooks/useDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, BarChart3, Activity, TrendingUp } from 'lucide-react';
import { getWellnessColor, formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {data.user.firstName}! 👋
        </h1>
        <p className="text-muted-foreground">
          Here's your wellness overview
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Predictions
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalPredictions}</div>
            <p className="text-xs text-muted-foreground">
              All time predictions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mental Wellness
            </CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.stats.mentalWellness.averagePrediction?.toFixed(1) || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Average score ({data.stats.mentalWellness.count} predictions)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Academic Impact
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.stats.academicImpact.averagePrediction?.toFixed(1) || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Average score ({data.stats.academicImpact.count} predictions)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Member Since
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDate(data.user.memberSince)}
            </div>
            <p className="text-xs text-muted-foreground">
              Join date
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Latest Predictions */}
      <div className="grid gap-4 md:grid-cols-2">
        {data.latestPredictions.mentalWellness && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Latest Mental Wellness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div
                  className="text-4xl font-bold"
                  style={{
                    color: getWellnessColor(
                      data.latestPredictions.mentalWellness.score
                    ),
                  }}
                >
                  {data.latestPredictions.mentalWellness.score.toFixed(1)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {data.latestPredictions.mentalWellness.interpretation}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(data.latestPredictions.mentalWellness.date)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {data.latestPredictions.academicImpact && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Latest Academic Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div
                  className="text-4xl font-bold"
                  style={{
                    color: getWellnessColor(
                      data.latestPredictions.academicImpact.score
                    ),
                  }}
                >
                  {data.latestPredictions.academicImpact.score.toFixed(1)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {data.latestPredictions.academicImpact.interpretation}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(data.latestPredictions.academicImpact.date)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {data.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div>
                    <p className="font-medium capitalize">
                      {activity.type.replace('_', ' ')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(activity.date)}
                    </p>
                  </div>
                  <div className="text-lg font-semibold">
                    {typeof activity.score === 'number'
                      ? activity.score.toFixed(1)
                      : activity.score}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No recent activity. Start by creating a prediction!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
