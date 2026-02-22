'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ActivityHeatmapProps {
  data: Array<{ hour: number; users: number; predictions: number }>;
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  // Ensure data is an array
  const safeData = Array.isArray(data) ? data : [];
  
  const chartData = safeData.map(item => ({
    hour: `${item.hour}:00`,
    Users: item.users,
    Predictions: item.predictions,
  }));

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No activity data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="hour" 
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
        />
        <Legend />
        <Bar dataKey="Users" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Predictions" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
