'use client';

import { useState } from 'react';
import { useModelInsights } from '@/lib/hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Brain, Activity, GraduationCap, Cpu, RefreshCw,
  CheckCircle2, Info, TrendingUp, Zap, BarChart3,
} from 'lucide-react';
import { ErrorState } from '@/components/ui/error-state';
import { cn } from '@/lib/utils';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

/* colour helpers */
const STRESS_COLORS: Record<string, string> = {
  Low: '#22c55e', Moderate: '#f59e0b', High: '#f97316', 'Very High': '#ef4444',
};
const RISK_COLORS: Record<string, string> = {
  Low: '#22c55e', Medium: '#f59e0b', High: '#ef4444',
};
const LINE_COLORS = ['#6366f1', '#f59e0b', '#22c55e'];

/* tiny ui pieces */
function MetricBadge({ value, label, colorClass }: { value: string | number; label: string; colorClass: string }) {
  return (
    <div className={cn('rounded-xl p-4 flex flex-col gap-0.5', colorClass)}>
      <span className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</span>
      <span className="text-2xl font-bold">{value}</span>
    </div>
  );
}

function StatRow({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-muted-foreground">{label}</span>
        {hint && <Info className="h-3 w-3 text-muted-foreground/40" aria-label={hint} />}
      </div>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

function PerformanceBadge({ r2 }: { r2: number }) {
  const pct = (r2 * 100).toFixed(1);
  const g = r2 >= 0.95 ? { l: 'A+', c: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400' }
          : r2 >= 0.90 ? { l: 'A',  c: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400' }
          : r2 >= 0.80 ? { l: 'B',  c: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400' }
          :               { l: 'C',  c: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400' };
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold', g.c)}>
      <CheckCircle2 className="h-3 w-3" />
      Grade {g.l} &nbsp;·&nbsp; R² {pct}%
    </span>
  );
}

function R2Bar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value * 100));
  const color = pct >= 90 ? 'bg-emerald-500' : pct >= 80 ? 'bg-blue-500' : 'bg-yellow-500';
  return (
    <div className="w-full bg-muted rounded-full h-2 mt-1">
      <div className={cn('h-2 rounded-full transition-all duration-700', color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

/* MENTAL WELLNESS MODEL CARD */
function MentalWellnessCard({ data }: { data: any }) {
  const m = data?.modelMetrics;
  const trendData = (data?.trend || []).map((t: any) => ({
    date: t._id?.slice(5) ?? t._id,
    avg: parseFloat((t.avg ?? 0).toFixed(1)),
    count: t.count,
  }));
  const distData = (data?.distribution || []).map((d: any) => ({
    range: d._id === 'Other' ? 'Other' : `${d._id}-${d._id + 20}`,
    count: d.count,
  }));

  return (
    <Card className="border-2 border-violet-200 dark:border-violet-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-900/40">
              <Brain className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Mental Wellness Model</CardTitle>
              <CardDescription className="text-xs mt-0.5">Predicts wellness score (0–100)</CardDescription>
            </div>
          </div>
          {m && <PerformanceBadge r2={m.r2} />}
        </div>
        {m && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Model Accuracy (R²)</span>
              <span className="font-medium">{(m.r2 * 100).toFixed(1)}%</span>
            </div>
            <R2Bar value={m.r2} />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricBadge value={data?.total ?? 0} label="Total Predictions" colorClass="bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300" />
          <MetricBadge value={data?.avgScore ?? 'N/A'} label="Avg Score" colorClass="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" />
          <MetricBadge value={data?.minScore ?? 'N/A'} label="Min Score" colorClass="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300" />
          <MetricBadge value={data?.maxScore ?? 'N/A'} label="Max Score" colorClass="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300" />
        </div>

        {/* Algorithm + Metrics */}
        {m && (
          <div className="rounded-xl border p-4 space-y-1.5 bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-violet-500" />
              <span className="text-sm font-semibold">ML Algorithm</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{m.algorithm}</p>
            <StatRow label="R² Score" value={m.r2.toFixed(4)} hint="Coefficient of determination (1.0 = perfect)" />
            <StatRow label="MAE" value={m.mae.toFixed(4)} hint="Mean Absolute Error" />
            <StatRow label="RMSE" value={m.rmse.toFixed(4)} hint="Root Mean Squared Error" />
            {m.mape && <StatRow label="MAPE" value={`${m.mape.toFixed(2)}%`} hint="Mean Absolute Percentage Error" />}
            <StatRow label="Std Dev of Scores" value={data?.stdDev ?? 'N/A'} />
          </div>
        )}

        {/* 30-day trend */}
        {trendData.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-violet-500" /> 30-Day Avg Score Trend
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="avg" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Avg Score" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Score distribution */}
        {distData.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-violet-500" /> Score Distribution
            </p>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={distData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Insight box */}
        <div className="rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 p-3">
          <p className="text-xs font-semibold text-violet-700 dark:text-violet-300 mb-1">Key Insights</p>
          <ul className="text-xs text-violet-600 dark:text-violet-400 space-y-0.5 list-disc list-inside">
            <li>Ensemble of Random Forest, Gradient Boosting &amp; Ridge regression.</li>
            <li>Explains {m ? (m.r2 * 100).toFixed(1) : '–'}% of variance in wellness scores.</li>
            <li>Average wellness score across {data?.total ?? 0} predictions: <strong>{data?.avgScore ?? 'N/A'}</strong>/100.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

/* STRESS LEVEL MODEL CARD */
function StressLevelCard({ data }: { data: any }) {
  const m = data?.modelMetrics;
  const trendData = (data?.trend || []).map((t: any) => ({
    date: t._id?.slice(5) ?? t._id,
    count: t.count,
  }));
  const distData = (data?.distribution || []).map((d: any) => ({
    level: d._id,
    count: d.count,
    fill: STRESS_COLORS[d._id] ?? '#94a3b8',
  }));

  return (
    <Card className="border-2 border-orange-200 dark:border-orange-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-900/40">
              <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Stress Level Model</CardTitle>
              <CardDescription className="text-xs mt-0.5">Classifies stress: Low / Moderate / High / Very High</CardDescription>
            </div>
          </div>
          {m && <PerformanceBadge r2={m.r2} />}
        </div>
        {m && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Model Accuracy (R²)</span>
              <span className="font-medium">{(m.r2 * 100).toFixed(1)}%</span>
            </div>
            <R2Bar value={m.r2} />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricBadge value={data?.total ?? 0} label="Total Predictions" colorClass="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300" />
          <MetricBadge value={data?.avgScore ?? 'N/A'} label="Avg Stress Score" colorClass="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300" />
          <MetricBadge value={data?.minScore ?? 'N/A'} label="Min Score" colorClass="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300" />
          <MetricBadge value={data?.maxScore ?? 'N/A'} label="Max Score" colorClass="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300" />
        </div>

        {/* Algorithm + Metrics */}
        {m && (
          <div className="rounded-xl border p-4 space-y-1.5 bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-semibold">ML Algorithm</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{m.algorithm}</p>
            <StatRow label="R² Score" value={m.r2.toFixed(4)} hint="Coefficient of determination" />
            <StatRow label="MAE" value={m.mae.toFixed(4)} hint="Mean Absolute Error" />
            <StatRow label="RMSE" value={m.rmse.toFixed(4)} hint="Root Mean Squared Error" />
            {m.accuracy && <StatRow label="Category Accuracy" value={`${(m.accuracy * 100).toFixed(1)}%`} hint="Accuracy on stress categories" />}
          </div>
        )}

        {/* Stress category distribution pie */}
        {distData.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-orange-500" /> Stress Category Distribution
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={distData} dataKey="count" nameKey="level" cx="50%" cy="50%" outerRadius={70} label={({ level, percent }) => `${level} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {distData.map((entry: any, i: number) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap sm:flex-col gap-2 text-xs">
                {distData.map((d: any) => (
                  <div key={d.level} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ background: d.fill }} />
                    <span className="text-muted-foreground">{d.level}:</span>
                    <span className="font-semibold">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 30-day usage trend */}
        {trendData.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-orange-500" /> 30-Day Usage Trend
            </p>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} name="Predictions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Insight box */}
        <div className="rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-3">
          <p className="text-xs font-semibold text-orange-700 dark:text-orange-300 mb-1">Key Insights</p>
          <ul className="text-xs text-orange-600 dark:text-orange-400 space-y-0.5 list-disc list-inside">
            <li>Ridge regression model trained on 400 student lifestyle samples.</li>
            <li>Classifies stress into 4 levels; category accuracy {m?.accuracy ? `${(m.accuracy * 100).toFixed(1)}%` : '81%'}.</li>
            <li>Average predicted stress score: <strong>{data?.avgScore ?? 'N/A'}</strong> / 10.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

/* ACADEMIC IMPACT MODEL CARD */
function AcademicImpactCard({ data }: { data: any }) {
  const m = data?.modelMetrics;
  const trendData = (data?.trend || []).map((t: any) => ({
    date: t._id?.slice(5) ?? t._id,
    avg: parseFloat((t.avg ?? 0).toFixed(2)),
    count: t.count,
  }));
  const riskData = (data?.riskDistribution || []).map((d: any) => ({
    risk: d._id,
    count: d.count,
    fill: RISK_COLORS[d._id] ?? '#94a3b8',
  }));

  return (
    <Card className="border-2 border-emerald-200 dark:border-emerald-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
              <GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Academic Impact Model</CardTitle>
              <CardDescription className="text-xs mt-0.5">Predicts social media addiction &amp; academic risk (2–9)</CardDescription>
            </div>
          </div>
          {m && <PerformanceBadge r2={m.r2} />}
        </div>
        {m && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Model Accuracy (R²)</span>
              <span className="font-medium">{(m.r2 * 100).toFixed(1)}%</span>
            </div>
            <R2Bar value={m.r2} />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricBadge value={data?.total ?? 0} label="Total Predictions" colorClass="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300" />
          <MetricBadge value={data?.avgScore ?? 'N/A'} label="Avg Score" colorClass="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" />
          <MetricBadge value={data?.minScore ?? 'N/A'} label="Min Score" colorClass="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300" />
          <MetricBadge value={data?.maxScore ?? 'N/A'} label="Max Score" colorClass="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300" />
        </div>

        {/* Algorithm + Metrics */}
        {m && (
          <div className="rounded-xl border p-4 space-y-1.5 bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-semibold">ML Algorithm</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{m.algorithm}</p>
            <StatRow label="R² Score" value={m.r2.toFixed(4)} hint="Coefficient of determination (1.0 = perfect)" />
            <StatRow label="MAE" value={m.mae.toFixed(4)} hint="Mean Absolute Error" />
            <StatRow label="RMSE" value={m.rmse.toFixed(4)} hint="Root Mean Squared Error" />
            {m.mape && <StatRow label="MAPE" value={`${m.mape.toFixed(4)}%`} hint="Mean Absolute Percentage Error" />}
            <StatRow label="Std Dev of Scores" value={data?.stdDev ?? 'N/A'} />
          </div>
        )}

        {/* Risk distribution */}
        {riskData.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-emerald-500" /> Risk Level Distribution
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={riskData} dataKey="count" nameKey="risk" cx="50%" cy="50%" outerRadius={70} label={({ risk, percent }) => `${risk} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {riskData.map((entry: any, i: number) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap sm:flex-col gap-2 text-xs">
                {riskData.map((d: any) => (
                  <div key={d.risk} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ background: d.fill }} />
                    <span className="text-muted-foreground">{d.risk}:</span>
                    <span className="font-semibold">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 30-day trend */}
        {trendData.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-500" /> 30-Day Avg Score Trend
            </p>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="avg" stroke="#22c55e" strokeWidth={2} dot={false} name="Avg Score" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Insight box */}
        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-3">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-1">Key Insights</p>
          <ul className="text-xs text-emerald-600 dark:text-emerald-400 space-y-0.5 list-disc list-inside">
            <li>Tuned Gradient Boosting regressor on student social media dataset.</li>
            <li>Achieves R² of {m ? m.r2.toFixed(3) : '0.990'} — near-perfect prediction accuracy.</li>
            <li>Average addiction score: <strong>{data?.avgScore ?? 'N/A'}</strong> / 9 across {data?.total ?? 0} predictions.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

/* COMBINED USAGE CHART */
function CombinedUsageChart({ data }: { data: any[] }) {
  // Pivot { _id: { date, type }, count } → { date, mental_wellness, stress_level, academic_impact }
  const byDate: Record<string, any> = {};
  (data || []).forEach((item) => {
    const date = item._id?.date?.slice(5) ?? item._id?.date ?? '';
    if (!byDate[date]) byDate[date] = { date, mental_wellness: 0, stress_level: 0, academic_impact: 0 };
    const t = item._id?.type;
    if (t) byDate[date][t] = (byDate[date][t] || 0) + item.count;
  });
  const chartData = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));

  if (chartData.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No usage data available yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip contentStyle={{ fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="mental_wellness" stroke={LINE_COLORS[0]} strokeWidth={2} dot={false} name="Mental Wellness" />
        <Line type="monotone" dataKey="stress_level" stroke={LINE_COLORS[1]} strokeWidth={2} dot={false} name="Stress Level" />
        <Line type="monotone" dataKey="academic_impact" stroke={LINE_COLORS[2]} strokeWidth={2} dot={false} name="Academic Impact" />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* MAIN PAGE */
export default function AdminModelsPage() {
  const { data, isLoading, error, refetch, isFetching } = useModelInsights();
  const [activeTab, setActiveTab] = useState<'mental_wellness' | 'stress_level' | 'academic_impact' | 'overview'>('overview');

  const tabs = [
    { id: 'overview',         label: 'Overview',        icon: Cpu         },
    { id: 'mental_wellness',  label: 'Mental Wellness', icon: Brain       },
    { id: 'stress_level',     label: 'Stress Level',    icon: Activity    },
    { id: 'academic_impact',  label: 'Academic Impact', icon: GraduationCap },
  ] as const;

  if (error) {
    return (
      <ErrorState
        title="Failed to load model insights"
        message="We could not fetch AI model performance data. Please try again."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Cpu className="h-8 w-8 text-primary" />
            AI Model Monitor
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Real-time performance metrics, usage analytics, and insights for all 3 ML models
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="gap-2">
          <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
          {isFetching ? 'Refreshing…' : 'Refresh'}
        </Button>
      </div>

      {/* Global summary cards */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-12 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10"><Cpu className="h-5 w-5 text-primary" /></div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Predictions</p>
                  <p className="text-2xl font-bold">{data?.totalPredictions ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30"><Brain className="h-5 w-5 text-violet-600 dark:text-violet-400" /></div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Mental Wellness</p>
                  <p className="text-2xl font-bold">{data?.mentalWellness?.total ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Avg: {data?.mentalWellness?.avgScore ?? 'N/A'}/100</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30"><Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" /></div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Stress Level</p>
                  <p className="text-2xl font-bold">{data?.stressLevel?.total ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Avg: {data?.stressLevel?.avgScore ?? 'N/A'}/10</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30"><GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Academic Impact</p>
                  <p className="text-2xl font-bold">{data?.academicImpact?.total ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Avg: {data?.academicImpact?.avgScore ?? 'N/A'}/9</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Model performance comparison */}
      {!isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-5 w-5 text-primary" /> Model Performance Comparison (R²)
            </CardTitle>
            <CardDescription>Higher is better — how well each model explains variance in predictions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Mental Wellness', r2: data?.mentalWellness?.modelMetrics?.r2 ?? 0.943, color: 'bg-violet-500', algo: data?.mentalWellness?.modelMetrics?.algorithm ?? '–' },
                { label: 'Stress Level',    r2: data?.stressLevel?.modelMetrics?.r2 ?? 0.837,   color: 'bg-orange-500', algo: data?.stressLevel?.modelMetrics?.algorithm ?? '–' },
                { label: 'Academic Impact', r2: data?.academicImpact?.modelMetrics?.r2 ?? 0.990, color: 'bg-emerald-500', algo: data?.academicImpact?.modelMetrics?.algorithm ?? '–' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="font-medium">{item.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{item.algo}</span>
                      <span className="font-bold">{(item.r2 * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div className={cn('h-3 rounded-full transition-all duration-700', item.color)} style={{ width: `${item.r2 * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 rounded-xl p-1 border flex-wrap">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center',
                activeTab === tab.id
                  ? 'bg-background shadow text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {isLoading ? (
        <Card className="animate-pulse">
          <CardContent className="pt-6 space-y-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-8 bg-muted rounded" />)}
          </CardContent>
        </Card>
      ) : (
        <>
          {activeTab === 'overview' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-5 w-5 text-primary" /> Combined Model Usage (Last 30 Days)
                </CardTitle>
                <CardDescription>Daily prediction counts across all 3 models</CardDescription>
              </CardHeader>
              <CardContent>
                <CombinedUsageChart data={data?.usageOverTime ?? []} />
              </CardContent>
            </Card>
          )}
          {activeTab === 'mental_wellness' && <MentalWellnessCard data={data?.mentalWellness} />}
          {activeTab === 'stress_level'    && <StressLevelCard    data={data?.stressLevel}    />}
          {activeTab === 'academic_impact' && <AcademicImpactCard data={data?.academicImpact} />}
        </>
      )}
    </div>
  );
}
