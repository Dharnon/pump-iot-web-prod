import React, { useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { cn } from '@/lib/utils';

interface SparklineChartProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  className?: string;
  fluid?: boolean;
}

export const SparklineChart: React.FC<SparklineChartProps> = ({
  data,
  color = 'hsl(var(--success))',
  height = 40,
  width = 80,
  className,
  fluid = false,
}) => {
  const chartData = useMemo(() => {
    return data.map((value, index) => ({ value, index }));
  }, [data]);

  // Fluid sizing using CSS custom properties
  const fluidStyle = fluid ? {
    width: 'clamp(2.5rem, 4.5vw, 4.5rem)',
    height: 'clamp(1.5rem, 2.5vw, 2.25rem)',
  } : { width, height };

  if (data.length < 2) {
    return (
      <div 
        style={fluidStyle} 
        className={cn("flex items-center justify-center text-muted-foreground", className)}
      >
        <span style={{ fontSize: 'var(--fluid-text-xs, 0.75rem)' }}>--</span>
      </div>
    );
  }

  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const padding = (maxValue - minValue) * 0.1 || 1;

  return (
    <div style={fluidStyle} className={cn(className)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <YAxis 
            domain={[minValue - padding, maxValue + padding]} 
            hide 
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};