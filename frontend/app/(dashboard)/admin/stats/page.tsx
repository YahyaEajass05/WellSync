'use client';

import { useSystemStats, useAdminAnalytics } from '@/lib/hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart3, ArrowLeft, Users, Brain, Bell, TrendingUp, Calendar,
  TrendingDown, Activity, CheckCircle2, XCircle, ShieldCheck,
  Zap, RefreshCw, ArrowUpRight, ArrowDownRight, Minus,
} from 'lucide-react';
import Link from 'next/link';
import { ErrorState } from '@/components/ui/error-state';
import { DashboardSkeleton } from '@/components/ui/loading-skeleton';
import {
  UserGrowthChart,
  PredictionTypeChart,
  WellnessTrendChart,
  StressDistributionChart,
  ActivityHeatmap,
} from '@/components/charts';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, RadialBarChart, RadialBar,
  ComposedChart, Line, PieChart, Pie, Cell,
} from 'recharts';

/* helpers */

function StatCard({
  title, value, subtitle, icon: Icon, color = 'text-primary', trend, trendLabel,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
}) {
  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus;
  const trendColor = trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground';
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        {trendLabel && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trendColor}`}>
            <TrendIcon className="h-3 w-3" />
            {trendLabel}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

/* main page */

export default function SystemStatsPage() {
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useSystemStats();
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError, refetch: refetchAnalytics } = useAdminAnalytics();

  const isLoading = statsLoading || analyticsLoading;
  const error = statsError || analyticsError;

  const refetch = () => { refetchStats(); refetchAnalytics(); };

  if (isLoading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back to Admin</Button>
          </Link>
        </div>
        <ErrorState title="Failed to load statistics" message="Could not load data. Please try again." onRetry={refetch} />
      </div>
    );
  }

  /* derived values */
  const totalUsers     = analytics?.users?.total ?? 0;
  const verifiedUsers  = analytics?.users?.verified ?? 0;
  const activeUsers    = analytics?.users?.active ?? 0;
  const adminUsers     = analytics?.users?.admins ?? 0;
  const newLastWeek    = analytics?.users?.newLastWeek ?? 0;
  const verifyRate     = analytics?.users?.verificationRate ?? '0%';

  const totalPreds     = analytics?.predictions?.total ?? 0;
  const mwPreds        = analytics?.predictions?.mentalWellness ?? 0;
  const slPreds        = analytics?.predictions?.stressLevel ?? 0;
  const aiPreds        = analytics?.predictions?.academicImpact ?? 0;
  const recentPreds    = analytics?.predictions?.recentLastWeek ?? 0;
  const avgMW          = analytics?.predictions?.avgMentalWellnessScore ?? 'N/A';
  const avgSL          = analytics?.predictions?.avgStressLevel ?? 'N/A';
  const avgAI          = analytics?.predictions?.avgAcademicImpactScore ?? 'N/A';

  const predsPerUser   = totalUsers > 0 ? (totalPreds / totalUsers).toFixed(2) : '0';
  const inactiveUsers  = totalUsers - activeUsers;
  const unverifiedUsers = totalUsers - verifiedUsers;

  /* engagement gauge data */
  const engagementData = [
    { name: 'Verified', value: verifiedUsers, fill: '#10b981' },
    { name: 'Active',   value: activeUsers,   fill: '#3b82f6' },
  ];

  /* prediction share bar data */
  const predShareData = [
    { name: 'Mental Wellness', count: mwPreds, fill: '#3b82f6' },
    { name: 'Stress Level',    count: slPreds, fill: '#f59e0b' },
    { name: 'Academic Impact', count: aiPreds, fill: '#10b981' },
  ];

  /* user status pie */
  const userStatusData = [
    { name: 'Active & Verified',   value: Math.min(activeUsers, verifiedUsers),         fill: '#10b981' },
    { name: 'Active & Unverified', value: Math.max(0, activeUsers - verifiedUsers),      fill: '#f59e0b' },
    { name: 'Inactive',            value: inactiveUsers,                                 fill: '#ef4444' },
  ].filter(d => d.value > 0);

  /* weekly comparison bar data */
  const weeklyData = [
    { label: 'Today',      users: stats?.today?.users ?? 0,      predictions: stats?.today?.predictions ?? 0 },
    { label: 'This Week',  users: stats?.thisWeek?.users ?? 0,   predictions: stats?.thisWeek?.predictions ?? 0 },
    { label: 'This Month', users: stats?.thisMonth?.users ?? 0,  predictions: stats?.thisMonth?.predictions ?? 0 },
  ];

  /* prediction type donut */
  const predTypeData = { mentalWellness: mwPreds, stressLevel: slPreds, academicImpact: aiPreds };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back to Admin</Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              System Statistics
            </h1>
            <p className="text-muted-foreground mt-1">Comprehensive platform analytics &amp; performance metrics</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={refetch} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* KPI Overview */}
      <div>
        <SectionHeader icon={Zap} title="Platform Overview" subtitle="All-time key performance indicators" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Users"       value={totalUsers}   subtitle="Registered accounts"      icon={Users}    color="text-blue-500"    trend="up"      trendLabel={`+${newLastWeek} this week`} />
          <StatCard title="Total Predictions" value={totalPreds}   subtitle="AI predictions generated" icon={Brain}    color="text-purple-500"  trend="up"      trendLabel={`+${recentPreds} this week`} />
          <StatCard title="Active Users"      value={activeUsers}  subtitle="Enabled accounts"          icon={Activity} color="text-emerald-500" trend="neutral" trendLabel={`${inactiveUsers} inactive`} />
          <StatCard title="Verified Users"    value={verifiedUsers} subtitle={`${verifyRate} of all users`} icon={ShieldCheck} color="text-teal-500" trend="neutral" trendLabel={`${unverifiedUsers} unverified`} />
        </div>
      </div>

      {/* Time-Period Stats */}
      <div>
        <SectionHeader icon={Calendar} title="Activity by Period" subtitle="New users & predictions across time windows" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Today */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-500" /> Today
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">New Users</span>
                <span className="text-2xl font-bold text-blue-600">{stats?.today?.users ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Predictions</span>
                <span className="text-2xl font-bold text-purple-600">{stats?.today?.predictions ?? 0}</span>
              </div>
            </CardContent>
          </Card>
          {/* This Week */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" /> This Week
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">New Users</span>
                <span className="text-2xl font-bold text-blue-600">{stats?.thisWeek?.users ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Predictions</span>
                <span className="text-2xl font-bold text-purple-600">{stats?.thisWeek?.predictions ?? 0}</span>
              </div>
            </CardContent>
          </Card>
          {/* This Month */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-500" /> This Month
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">New Users</span>
                <span className="text-2xl font-bold text-blue-600">{stats?.thisMonth?.users ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Predictions</span>
                <span className="text-2xl font-bold text-purple-600">{stats?.thisMonth?.predictions ?? 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Period Comparison Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> Period Comparison</CardTitle>
          <CardDescription>Users and predictions across today / week / month</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={weeklyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="label" tick={{ fill: 'currentColor', fontSize: 12 }} />
              <YAxis tick={{ fill: 'currentColor', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '6px', color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Bar dataKey="users" name="New Users" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="predictions" name="Predictions" fill="#a855f7" radius={[6, 6, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* User Growth Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-blue-500" /> User Growth — Last 30 Days</CardTitle>
          <CardDescription>Daily new registrations over the past month</CardDescription>
        </CardHeader>
        <CardContent>
          <UserGrowthChart data={analytics?.trends?.userGrowth ?? []} />
        </CardContent>
      </Card>

      {/* AI Predictions */}
      <div>
        <SectionHeader icon={Brain} title="AI Prediction Analytics" subtitle="Breakdown by prediction type and scores" />
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pie donut */}
          <Card>
            <CardHeader>
              <CardTitle>Prediction Type Distribution</CardTitle>
              <CardDescription>Share of each AI prediction model</CardDescription>
            </CardHeader>
            <CardContent>
              <PredictionTypeChart data={predTypeData} />
            </CardContent>
          </Card>

          {/* Horizontal bar */}
          <Card>
            <CardHeader>
              <CardTitle>Predictions per Model</CardTitle>
              <CardDescription>Absolute count by prediction type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={predShareData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fill: 'currentColor', fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fill: 'currentColor', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '6px', color: 'hsl(var(--foreground))' }}
                    formatter={(v: number) => [v, 'Predictions']}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {predShareData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Average scores — one card per prediction type */}
        <div className="grid gap-4 sm:grid-cols-3 mt-4">
          {/* Mental Wellness */}
          <Card className="text-center border-blue-200 dark:border-blue-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600 flex items-center justify-center gap-2">
                <Brain className="h-4 w-4" /> Mental Wellness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600">{avgMW}</div>
              <p className="text-xs text-muted-foreground mt-1">avg score / 100</p>
              <div className="mt-3 pt-3 border-t text-sm">
                <span className="font-semibold">{mwPreds}</span>
                <span className="text-muted-foreground ml-1">total predictions</span>
              </div>
            </CardContent>
          </Card>

          {/* Stress Level */}
          <Card className="text-center border-amber-200 dark:border-amber-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-600 flex items-center justify-center gap-2">
                <Activity className="h-4 w-4" /> Stress Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-amber-500">
                {avgSL !== 'N/A' ? avgSL : '—'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">avg stress score / 100</p>
              <div className="mt-3 pt-3 border-t text-sm">
                <span className="font-semibold">{slPreds}</span>
                <span className="text-muted-foreground ml-1">total predictions</span>
              </div>
            </CardContent>
          </Card>

          {/* Academic Impact */}
          <Card className="text-center border-emerald-200 dark:border-emerald-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-emerald-600 flex items-center justify-center gap-2">
                <TrendingUp className="h-4 w-4" /> Academic Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-emerald-600">{avgAI}</div>
              <p className="text-xs text-muted-foreground mt-1">avg score / 10</p>
              <div className="mt-3 pt-3 border-t text-sm">
                <span className="font-semibold">{aiPreds}</span>
                <span className="text-muted-foreground ml-1">total predictions</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Wellness Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-emerald-500" /> Mental Wellness Trend — Last 30 Days</CardTitle>
          <CardDescription>Average wellness score and prediction volume over time</CardDescription>
        </CardHeader>
        <CardContent>
          <WellnessTrendChart data={analytics?.charts?.wellnessTrend ?? []} />
        </CardContent>
      </Card>

      {/* Stress Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-amber-500" /> Stress Level Distribution</CardTitle>
          <CardDescription>Number of predictions per stress category (all time)</CardDescription>
        </CardHeader>
        <CardContent>
          <StressDistributionChart data={analytics?.charts?.stressDistribution ?? []} />
        </CardContent>
      </Card>

      {/* User Status Pie + Engagement Gauges */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User status pie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-blue-500" /> User Status Breakdown</CardTitle>
            <CardDescription>Active vs inactive vs unverified accounts</CardDescription>
          </CardHeader>
          <CardContent>
            {userStatusData.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground">No user data</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={userStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                      dataKey="value"
                      labelLine={false}
                    >
                      {userStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '6px', color: 'hsl(var(--foreground))' }}
                      formatter={(v: number, name: string) => [v, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Custom legend — keeps labels inside the card */}
                <div className="space-y-2 mt-2">
                  {userStatusData.map((entry) => {
                    const total = userStatusData.reduce((s, d) => s + d.value, 0);
                    const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
                    return (
                      <div key={entry.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="shrink-0 h-3 w-3 rounded-full" style={{ backgroundColor: entry.fill }} />
                          <span className="truncate text-muted-foreground">{entry.name}</span>
                        </div>
                        <span className="ml-2 font-semibold shrink-0">{entry.value} ({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Key ratios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-purple-500" /> Engagement Metrics</CardTitle>
            <CardDescription>Platform engagement ratios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5 pt-2">
              {[
                { label: 'Email Verification Rate', value: verifiedUsers, total: totalUsers, color: 'bg-emerald-500' },
                { label: 'Active User Rate',         value: activeUsers,  total: totalUsers, color: 'bg-blue-500' },
                { label: 'Admin Ratio',              value: adminUsers,   total: totalUsers, color: 'bg-purple-500' },
              ].map(({ label, value, total, color }) => {
                const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                return (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{label}</span>
                      <span className="text-muted-foreground">{value}/{total} ({pct}%)</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}

              <div className="border-t pt-4 grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-purple-600">{predsPerUser}</div>
                  <p className="text-xs text-muted-foreground mt-1">Predictions / User</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats?.thisWeek?.users ? (stats.thisWeek.users / 7).toFixed(1) : '0'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">New Users / Day (week avg)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-orange-500" /> Hourly Activity Pattern</CardTitle>
          <CardDescription>Prediction volume by hour of day (24h UTC)</CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityHeatmap data={analytics?.charts?.hourlyActivity ?? []} />
        </CardContent>
      </Card>

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> Full Statistics Summary</CardTitle>
          <CardDescription>All-time platform data at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Metric</th>
                  <th className="text-right py-2 pr-4 font-medium text-muted-foreground">Today</th>
                  <th className="text-right py-2 pr-4 font-medium text-muted-foreground">This Week</th>
                  <th className="text-right py-2 pr-4 font-medium text-muted-foreground">This Month</th>
                  <th className="text-right py-2 font-medium text-muted-foreground">All Time</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-2 pr-4 font-medium flex items-center gap-2"><Users className="h-4 w-4 text-blue-500" />New Users</td>
                  <td className="text-right py-2 pr-4">{stats?.today?.users ?? 0}</td>
                  <td className="text-right py-2 pr-4">{stats?.thisWeek?.users ?? 0}</td>
                  <td className="text-right py-2 pr-4">{stats?.thisMonth?.users ?? 0}</td>
                  <td className="text-right py-2 font-bold">{totalUsers}</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium flex items-center gap-2"><Brain className="h-4 w-4 text-purple-500" />Predictions</td>
                  <td className="text-right py-2 pr-4">{stats?.today?.predictions ?? 0}</td>
                  <td className="text-right py-2 pr-4">{stats?.thisWeek?.predictions ?? 0}</td>
                  <td className="text-right py-2 pr-4">{stats?.thisMonth?.predictions ?? 0}</td>
                  <td className="text-right py-2 font-bold">{totalPreds}</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium flex items-center gap-2"><Bell className="h-4 w-4 text-amber-500" />Notifications</td>
                  <td className="text-right py-2 pr-4">—</td>
                  <td className="text-right py-2 pr-4">—</td>
                  <td className="text-right py-2 pr-4">—</td>
                  <td className="text-right py-2 font-bold">{stats?.allTime?.notifications ?? 0}</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" />Verified Users</td>
                  <td className="text-right py-2 pr-4">—</td>
                  <td className="text-right py-2 pr-4">—</td>
                  <td className="text-right py-2 pr-4">—</td>
                  <td className="text-right py-2 font-bold">{verifiedUsers}</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium flex items-center gap-2"><XCircle className="h-4 w-4 text-red-500" />Inactive Users</td>
                  <td className="text-right py-2 pr-4">—</td>
                  <td className="text-right py-2 pr-4">—</td>
                  <td className="text-right py-2 pr-4">—</td>
                  <td className="text-right py-2 font-bold">{inactiveUsers}</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-teal-500" />Admin Accounts</td>
                  <td className="text-right py-2 pr-4">—</td>
                  <td className="text-right py-2 pr-4">—</td>
                  <td className="text-right py-2 pr-4">—</td>
                  <td className="text-right py-2 font-bold">{adminUsers}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
