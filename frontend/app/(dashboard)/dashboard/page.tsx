'use client';

import { useDashboard } from '@/lib/hooks/useDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, BarChart3, Activity, Heart, TrendingUp, TrendingDown, Minus, Plus } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

// Helpers:
const getWellnessColor = (score: number) => {
  if (score >= 80) return '#16a34a';
  if (score >= 60) return '#2563eb';
  if (score >= 40) return '#d97706';
  return '#dc2626';
};

const getStressColor = (score: number) => {
  if (score <= 3) return '#16a34a';
  if (score <= 5) return '#2563eb';
  if (score <= 7) return '#d97706';
  return '#dc2626';
};

const getAcademicColor = (score: number) => {
  if (score <= 4) return '#16a34a';
  if (score <= 6) return '#d97706';
  return '#dc2626';
};

const TrendIcon = ({ value }: { value: number }) => {
  if (value > 0) return <TrendingUp className="h-3 w-3 text-green-500" />;
  if (value < 0) return <TrendingDown className="h-3 w-3 text-red-500" />;
  return <Minus className="h-3 w-3 text-gray-400" />;
};

const predictionTypeLabel = (type: string) => {
  if (type === 'mental_wellness') return 'Mental Wellness';
  if (type === 'stress_level') return 'Stress Level';
  if (type === 'academic_impact') return 'Academic Impact';
  return type.replace(/_/g, ' ');
};

const predictionTypeIcon = (type: string) => {
  if (type === 'mental_wellness') return <Brain className="h-4 w-4 text-blue-500" />;
  if (type === 'stress_level') return <Heart className="h-4 w-4 text-red-500" />;
  return <BarChart3 className="h-4 w-4 text-purple-500" />;
};

// Main Page:
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
    <div className="space-y-6 p-6">

      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {data.user?.firstName}! 👋
          </h1>
          <p className="text-muted-foreground">Here&apos;s your wellness overview</p>
        </div>
        <Link href="/predictions/mental-wellness">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Prediction
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Predictions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats?.totalPredictions ?? 0}</div>
            <p className="text-xs text-muted-foreground">All time predictions</p>
          </CardContent>
        </Card>

        {/* Mental Wellness */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mental Wellness</CardTitle>
            <Brain className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: data.stats?.mentalWellness?.averagePrediction ? getWellnessColor(data.stats.mentalWellness.averagePrediction) : undefined }}>
              {data.stats?.mentalWellness?.averagePrediction?.toFixed(1) ?? 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg score ({data.stats?.mentalWellness?.count ?? 0} predictions)
            </p>
          </CardContent>
        </Card>

        {/* Stress Level */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Stress Level</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: data.stats?.stressLevel?.averagePrediction ? getStressColor(data.stats.stressLevel.averagePrediction) : undefined }}>
              {data.stats?.stressLevel?.averagePrediction?.toFixed(1) ?? 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg score ({data.stats?.stressLevel?.count ?? 0} predictions)
            </p>
          </CardContent>
        </Card>

        {/* Academic Impact */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Academic Impact</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: data.stats?.academicImpact?.averagePrediction ? getAcademicColor(data.stats.academicImpact.averagePrediction) : undefined }}>
              {data.stats?.academicImpact?.averagePrediction?.toFixed(1) ?? 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg score ({data.stats?.academicImpact?.count ?? 0} predictions)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Latest Predictions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {/* Latest Mental Wellness */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="h-5 w-5 text-blue-500" />
              Latest Mental Wellness
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.latestPredictions?.mentalWellness ? (
              <div className="space-y-2">
                <div className="text-4xl font-bold" style={{ color: getWellnessColor(data.latestPredictions.mentalWellness.score) }}>
                  {data.latestPredictions.mentalWellness.score.toFixed(1)}
                  <span className="text-sm font-normal text-muted-foreground ml-1">/ 100</span>
                </div>
                <p className="text-sm text-muted-foreground">{data.latestPredictions.mentalWellness.interpretation}</p>
                <p className="text-xs text-muted-foreground">{formatDate(data.latestPredictions.mentalWellness.date)}</p>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No predictions yet</p>
                <Link href="/predictions/mental-wellness">
                  <Button size="sm" variant="outline" className="mt-2">Start Now</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Latest Stress Level */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Heart className="h-5 w-5 text-red-500" />
              Latest Stress Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.latestPredictions?.stressLevel ? (
              <div className="space-y-2">
                <div className="text-4xl font-bold" style={{ color: getStressColor(data.latestPredictions.stressLevel.score) }}>
                  {data.latestPredictions.stressLevel.score.toFixed(1)}
                  <span className="text-sm font-normal text-muted-foreground ml-1">/ 10</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {data.latestPredictions.stressLevel.stressCategory || data.latestPredictions.stressLevel.interpretation}
                </p>
                <p className="text-xs text-muted-foreground">{formatDate(data.latestPredictions.stressLevel.date)}</p>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No predictions yet</p>
                <Link href="/predictions/stress">
                  <Button size="sm" variant="outline" className="mt-2">Start Now</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Latest Academic Impact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              Latest Academic Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.latestPredictions?.academicImpact ? (
              <div className="space-y-2">
                <div className="text-4xl font-bold" style={{ color: getAcademicColor(data.latestPredictions.academicImpact.score) }}>
                  {data.latestPredictions.academicImpact.score.toFixed(1)}
                  <span className="text-sm font-normal text-muted-foreground ml-1">/ 9</span>
                </div>
                <p className="text-sm text-muted-foreground">{data.latestPredictions.academicImpact.interpretation}</p>
                <p className="text-xs text-muted-foreground">{formatDate(data.latestPredictions.academicImpact.date)}</p>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No predictions yet</p>
                <Link href="/predictions/academic">
                  <Button size="sm" variant="outline" className="mt-2">Start Now</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          <Link href="/predictions">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {data.recentActivity?.length > 0 ? (
            <div className="space-y-3">
              {data.recentActivity.map((activity: any) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="p-1.5 bg-muted rounded-md">
                    {predictionTypeIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{predictionTypeLabel(activity.type)}</p>
                    <p className="text-xs text-muted-foreground truncate">{activity.interpretation || ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">
                      {typeof activity.score === 'number' ? activity.score.toFixed(1) : activity.score}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(activity.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No recent activity.</p>
              <Link href="/predictions/mental-wellness">
                <Button size="sm" className="mt-4">Create Your First Prediction</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/predictions/mental-wellness">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Brain className="h-4 w-4 text-blue-500" />
                Mental Wellness
              </Button>
            </Link>
            <Link href="/predictions/stress">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                Stress Level
              </Button>
            </Link>
            <Link href="/predictions/academic">
              <Button variant="outline" className="w-full justify-start gap-2">
                <BarChart3 className="h-4 w-4 text-purple-500" />
                Academic Impact
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
