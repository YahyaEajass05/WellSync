'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface StressDistributionChartProps {
  data: Array<{ level: string; count: number }>;
}

const STRESS_COLORS: Record<string, string> = {
  'Low': '#10b981',
  'Moderate': '#f59e0b',
  'High': '#f97316',
  'Very High': '#ef4444',
};

export function StressDistributionChart({ data }: StressDistributionChartProps) {
  // Ensure data is an array
  const safeData = Array.isArray(data) ? data : [];
  
  if (safeData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No stress data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={safeData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="level" 
          className="text-xs"
          tick={{ fill: 'currentColor' }}
        />
        <YAxis 
          className="text-xs"
          tick={{ fill: 'currentColor' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--background))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
            color: 'hsl(var(--foreground))'
          }}
          formatter={(value: number) => [value, 'Users']}
        />
        <Bar dataKey="count" radius={[8, 8, 0, 0]}>
          {safeData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={STRESS_COLORS[entry.level] || '#6366f1'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
