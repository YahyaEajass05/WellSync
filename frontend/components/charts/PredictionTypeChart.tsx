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

  if (total === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No predictions yet
      </div>
    );
  }

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
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomLabel}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--background))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
            color: 'hsl(var(--foreground))'
          }}
          formatter={(value: number) => [value, 'Count']}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
