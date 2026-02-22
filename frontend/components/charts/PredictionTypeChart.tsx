'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PredictionTypeChartProps {
  data: {
    mentalWellness: number;
    stressLevel: number;
    academicImpact: number;
  };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

export function PredictionTypeChart({ data }: PredictionTypeChartProps) {
  // Ensure data values are numbers and not undefined
  const mentalWellness = Number(data?.mentalWellness) || 0;
  const stressLevel = Number(data?.stressLevel) || 0;
  const academicImpact = Number(data?.academicImpact) || 0;

  const chartData = [
    { name: 'Mental Wellness', value: mentalWellness },
    { name: 'Stress Level', value: stressLevel },
    { name: 'Academic Impact', value: academicImpact },
  ];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  // Always show all 3 types — even if some are 0.
  // Only show empty state if ALL 3 are 0.
  if (total === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No predictions yet
      </div>
    );
  }

  // Filter out zero-value slices so the pie doesn't render invisible segments
  // but keep the legend so all 3 types are always visible as labels.
  const nonZeroData = chartData.filter(d => d.value > 0);

  // Custom label renderer that handles the positioning properly
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={nonZeroData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomLabel}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {nonZeroData.map((entry, index) => {
            // Match color to the original chartData index so colors are stable
            const originalIndex = chartData.findIndex(d => d.name === entry.name);
            return <Cell key={`cell-${index}`} fill={COLORS[originalIndex % COLORS.length]} />;
          })}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--background))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
            color: 'hsl(var(--foreground))'
          }}
          formatter={(value: number, name: string) => [value, name]}
        />
        {/* Always show all 3 legend items regardless of zero counts */}
        <Legend 
          verticalAlign="bottom" 
          height={36}
          iconType="circle"
          payload={chartData.map((entry, index) => ({
            value: `${entry.name} (${entry.value})`,
            type: 'circle' as const,
            color: COLORS[index % COLORS.length],
          }))}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
