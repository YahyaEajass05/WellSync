'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WellnessTrendChartProps {
  data: Array<{ date: string; avgScore: number; count: number }>;
}

export function WellnessTrendChart({ data }: WellnessTrendChartProps) {
  // Ensure data is an array
  const safeData = Array.isArray(data) ? data : [];
  
  const chartData = safeData.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: parseFloat(item.avgScore.toFixed(1)),
    count: item.count,
  }));

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No wellness data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="date" 
          className="text-xs"
          tick={{ fill: 'currentColor' }}
        />
        <YAxis 
          domain={[0, 100]}
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
          formatter={(value: any, name: string) => {
            if (name === 'score') return [value, 'Avg Score'];
            if (name === 'count') return [value, 'Predictions'];
            return [value, name];
          }}
        />
        <Area 
          type="monotone" 
          dataKey="score" 
          stroke="#10b981" 
          fill="#10b981" 
          fillOpacity={0.3}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
