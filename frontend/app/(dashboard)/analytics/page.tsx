'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from '@/lib/api/axios-instance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Brain, Heart, BarChart3, TrendingUp, TrendingDown, 
  Minus, RefreshCw, Lightbulb, AlertTriangle, 
  CheckCircle, Info, Trophy, Calendar, Activity,
  ArrowUp, ArrowDown
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────
interface StatBlock {
  count: number;
  average: number;
  min: number | null;
  max: number | null;
  latest: number | null;
  trend: 'improving' | 'declining' | 'stable';
}

interface Analytics {
  totalPredictions: number;
  mentalWellness: StatBlock;
  stressLevel: StatBlock;
  academicImpact: StatBlock;
  engagement: { activeDays: number; favoritePredictions: number; emailsSent: number };
  recentPredictions: { type: string; score: number; interpretation: string; date: string }[];
}

interface Insight {
  type: string;
  category: string;
  title: string;
  message: string;
  severity: string;
  recommendation: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === 'improving') return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (trend === 'declining') return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-gray-400" />;
};

const InsightIcon = ({ severity }: { severity: string }) => {
  if (severity === 'critical') return <AlertTriangle className="h-5 w-5 text-red-500" />;
  if (severity === 'warning') return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  if (severity === 'info') return <Info className="h-5 w-5 text-blue-500" />;
  return <CheckCircle className="h-5 w-5 text-green-500" />;
};

const InsightBorder = ({ severity }: { severity: string }) => {
  if (severity === 'critical') return 'border-l-4 border-red-500 bg-red-50 dark:bg-red-950/20';
  if (severity === 'warning') return 'border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
  return 'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20';
};

const getWellnessColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-red-600';
};

const getStressColor = (score: number) => {
  if (score <= 3) return 'text-green-600';
  if (score <= 5) return 'text-blue-600';
  if (score <= 7) return 'text-yellow-600';
  return 'text-red-600';
};

const getAcademicColor = (score: number) => {
  if (score <= 4) return 'text-green-600';
  if (score <= 6) return 'text-yellow-600';
  return 'text-red-600';
};

const predictionTypeLabel = (type: string) => {
  if (type === 'mental_wellness') return 'Mental Wellness';
  if (type === 'stress_level') return 'Stress Level';
  if (type === 'academic_impact') return 'Academic Impact';
  return type;
};

const predictionTypeIcon = (type: string) => {
  if (type === 'mental_wellness') return <Brain className="h-4 w-4 text-blue-500" />;
  if (type === 'stress_level') return <Heart className="h-4 w-4 text-red-500" />;
  return <BarChart3 className="h-4 w-4 text-purple-500" />;
};

// ─── Score Bar ────────────────────────────────────────────────────────────────
const ScoreBar = ({ value, max, color }: { value: number; max: number; color: string }) => (
  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
    <div
      className={`h-2 rounded-full transition-all duration-500 ${color}`}
      style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
    />
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({
  title, icon, stat, unit, maxScore, barColor, scoreColor
}: {
  title: string;
  icon: React.ReactNode;
  stat: StatBlock;
  unit: string;
  maxScore: number;
  barColor: string;
  scoreColor: (v: number) => string;
}) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium flex items-center gap-2">
        {icon} {title}
        <span className="ml-auto"><TrendIcon trend={stat.trend} /></span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      {stat.count === 0 ? (
        <p className="text-sm text-muted-foreground">No predictions yet</p>
      ) : (
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Average Score</p>
            <p className={`text-2xl font-bold ${scoreColor(stat.average)}`}>
              {stat.average.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">{unit}</span>
            </p>
            <ScoreBar value={stat.average} max={maxScore} color={barColor} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <p className="text-muted-foreground">Min</p>
              <p className="font-semibold">{stat.min?.toFixed(1) ?? '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Max</p>
              <p className="font-semibold">{stat.max?.toFixed(1) ?? '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Count</p>
              <p className="font-semibold">{stat.count}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <TrendIcon trend={stat.trend} />
            <span className={
              stat.trend === 'improving' ? 'text-green-600' :
              stat.trend === 'declining' ? 'text-red-600' : 'text-gray-500'
            }>
              {stat.trend === 'improving' ? 'Improving trend' :
               stat.trend === 'declining' ? 'Declining trend' : 'Stable'}
            </span>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');

  // Fetch analytics
  const { data: analyticsData, isLoading: isLoadingAnalytics, refetch: refetchAnalytics } = useQuery({
    queryKey: ['analytics', period],
    queryFn: async () => {
      const res = await axios.post('/analytics/generate', { period });
      return res.data.data.analytics?.metrics as Analytics;
    },
    refetchOnWindowFocus: false,
  });

  // Fetch insights
  const { data: insightsData, isLoading: isLoadingInsights, refetch: refetchInsights } = useQuery({
    queryKey: ['analytics', 'insights'],
    queryFn: async () => {
      const res = await axios.get('/analytics/insights');
      return res.data.data;
    },
    refetchOnWindowFocus: false,
  });

  // Generate mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      await axios.post('/analytics/generate', { period });
    },
    onSuccess: () => {
      refetchAnalytics();
      refetchInsights();
      toast.success('Analytics refreshed!');
    },
    onError: () => toast.error('Failed to refresh analytics'),
  });

  const analytics: Analytics | undefined = analyticsData;
  const insights: Insight[] = insightsData?.insights || [];

  return (
    <div className="space-y-6 p-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your wellness trends and insights</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Period Toggle */}
          <div className="flex rounded-lg border overflow-hidden">
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                period === 'weekly'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-muted'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                period === 'monthly'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-muted'
              }`}
            >
              Monthly
            </button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Overview Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Predictions</p>
                <p className="text-2xl font-bold">{analytics?.totalPredictions ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Days</p>
                <p className="text-2xl font-bold">{analytics?.engagement?.activeDays ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Lightbulb className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Insights</p>
                <p className="text-2xl font-bold">{insights.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Trophy className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Favourites</p>
                <p className="text-2xl font-bold">{analytics?.engagement?.favoritePredictions ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Prediction Stats ── */}
      {isLoadingAnalytics ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-8 bg-muted rounded w-1/3" />
                  <div className="h-2 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Mental Wellness"
            icon={<Brain className="h-4 w-4 text-blue-500" />}
            stat={analytics?.mentalWellness ?? { count: 0, average: 0, min: null, max: null, latest: null, trend: 'stable' }}
            unit="/ 100"
            maxScore={100}
            barColor="bg-blue-500"
            scoreColor={getWellnessColor}
          />
          <StatCard
            title="Stress Level"
            icon={<Heart className="h-4 w-4 text-red-500" />}
            stat={analytics?.stressLevel ?? { count: 0, average: 0, min: null, max: null, latest: null, trend: 'stable' }}
            unit="/ 10"
            maxScore={10}
            barColor="bg-red-500"
            scoreColor={getStressColor}
          />
          <StatCard
            title="Academic Impact"
            icon={<BarChart3 className="h-4 w-4 text-purple-500" />}
            stat={analytics?.academicImpact ?? { count: 0, average: 0, min: null, max: null, latest: null, trend: 'stable' }}
            unit="/ 9"
            maxScore={9}
            barColor="bg-purple-500"
            scoreColor={getAcademicColor}
          />
        </div>
      )}

      {/* ── Insights & Recent Predictions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              AI Insights
            </CardTitle>
            <CardDescription>Personalised recommendations based on your data</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingInsights ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse h-16 bg-muted rounded-lg" />
                ))}
              </div>
            ) : insights.length === 0 ? (
              <div className="text-center py-8">
                <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm">No insights yet.</p>
                <p className="text-muted-foreground text-xs mt-1">Make at least 3 predictions to unlock AI insights.</p>
                <Link href="/predictions/mental-wellness">
                  <Button size="sm" className="mt-4">Make a Prediction</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {insights.map((insight, i) => (
                  <div key={i} className={`p-3 rounded-lg ${InsightBorder({ severity: insight.severity })}`}>
                    <div className="flex items-start gap-2">
                      <InsightIcon severity={insight.severity} />
                      <div>
                        <p className="font-semibold text-sm">{insight.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{insight.message}</p>
                        {insight.recommendation && (
                          <p className="text-xs mt-1 font-medium text-blue-600 dark:text-blue-400">
                            💡 {insight.recommendation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Predictions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your last 7 predictions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAnalytics ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse h-12 bg-muted rounded-lg" />
                ))}
              </div>
            ) : !analytics?.recentPredictions?.length ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm">No recent predictions.</p>
                <Link href="/predictions/mental-wellness">
                  <Button size="sm" className="mt-4">Start Predicting</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {analytics.recentPredictions.map((pred, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="p-1.5 bg-muted rounded-md">
                      {predictionTypeIcon(pred.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{predictionTypeLabel(pred.type)}</p>
                      <p className="text-xs text-muted-foreground truncate">{pred.interpretation || 'No interpretation'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{pred.score.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">{new Date(pred.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Quick Actions ── */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Start a new prediction to improve your analytics</CardDescription>
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
