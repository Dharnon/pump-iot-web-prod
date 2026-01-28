import React from 'react';
import { motion } from 'framer-motion';
import { SparklineChart } from './SparklineChart';
import { cn } from '@/lib/utils';

interface TelemetryCardProps {
  label: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  history: number[];
  target?: number;
  tolerance?: number;
  compact?: boolean;
}

export const TelemetryCard: React.FC<TelemetryCardProps> = ({
  label,
  value,
  unit,
  icon,
  history,
  target,
  tolerance = 5,
  compact = false,
}) => {
  const isWithinTarget = target !== undefined 
    ? Math.abs(value - target) <= (target * tolerance / 100)
    : false;

  const getStatusColor = () => {
    if (target === undefined) return 'hsl(var(--muted-foreground))';
    return isWithinTarget ? 'hsl(var(--success))' : 'hsl(var(--warning))';
  };

  // Compact version for tablet portrait
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "bg-card/90 backdrop-blur-xl rounded-xl px-3 py-2 shadow-glass border-2 transition-colors duration-300 min-w-[110px] flex-shrink-0",
          isWithinTarget ? "border-success" : "border-transparent"
        )}
      >
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
            isWithinTarget ? "bg-success/20 text-success" : "bg-secondary text-muted-foreground"
          )}>
            {icon}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide block truncate">
              {label}
            </span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg font-bold font-mono text-foreground">
                {value.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">{unit}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "bg-card/90 backdrop-blur-xl rounded-[clamp(0.5rem,0.9vw,1rem)] shadow-glass border-2 transition-colors duration-300",
        isWithinTarget ? "border-success" : "border-transparent"
      )}
      style={{ padding: 'var(--fluid-card-padding)' }}
    >
      <div className="flex items-center justify-between">
        {/* Left side - Icon and label */}
        <div 
          className="flex items-center"
          style={{ gap: 'var(--fluid-gap-sm)' }}
        >
          <div 
            className={cn(
              "rounded-[clamp(0.375rem,0.6vw,0.75rem)] flex items-center justify-center",
              isWithinTarget ? "bg-success/20 text-success" : "bg-secondary text-muted-foreground"
            )}
            style={{
              width: 'var(--fluid-circle-sm)',
              height: 'var(--fluid-circle-sm)',
            }}
          >
            <div style={{ width: 'var(--fluid-icon-sm)', height: 'var(--fluid-icon-sm)' }}>
              {icon}
            </div>
          </div>
          <div>
            <span 
              className="font-medium text-muted-foreground uppercase tracking-wide block"
              style={{ fontSize: 'var(--fluid-text-xs)' }}
            >
              {label}
            </span>
            <div 
              className="flex items-baseline"
              style={{ gap: 'var(--fluid-gap-xs)' }}
            >
              <span 
                className="font-bold font-mono text-foreground"
                style={{ fontSize: 'var(--fluid-text-xl)' }}
              >
                {value.toFixed(1)}
              </span>
              <span 
                className="text-muted-foreground"
                style={{ fontSize: 'var(--fluid-text-xs)' }}
              >
                {unit}
              </span>
            </div>
          </div>
        </div>

        {/* Right side - Sparkline */}
        <div 
          className="flex items-center"
          style={{ gap: 'var(--fluid-gap-xs)' }}
        >
          <SparklineChart 
            data={history} 
            color={getStatusColor()}
            fluid
          />
        </div>
      </div>

      {/* Target indicator */}
      {target !== undefined && (
        <div 
          className="border-t border-border/50 flex items-center justify-between"
          style={{ 
            marginTop: 'var(--fluid-gap-sm)', 
            paddingTop: 'var(--fluid-gap-sm)',
            fontSize: 'var(--fluid-text-xs)',
          }}
        >
          <span className="text-muted-foreground">Target: {target.toFixed(1)} {unit}</span>
          <span className={cn(
            "font-medium",
            isWithinTarget ? "text-success" : "text-warning"
          )}>
            {isWithinTarget ? '✓ Estable' : '○ Ajustando'}
          </span>
        </div>
      )}
    </motion.div>
  );
};