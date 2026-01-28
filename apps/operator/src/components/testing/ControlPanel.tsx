import React from 'react';
import { motion } from 'framer-motion';
import { Power, Gauge, Droplets } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface ControlPanelProps {
  motorOn: boolean;
  motorSpeed: number;
  valveOpening: number;
  onMotorToggle: (on: boolean) => void;
  onMotorSpeedChange: (speed: number) => void;
  onValveOpeningChange: (opening: number) => void;
  compact?: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  motorOn,
  motorSpeed,
  valveOpening,
  onMotorToggle,
  onMotorSpeedChange,
  onValveOpeningChange,
  compact = false,
}) => {
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card/90 backdrop-blur-xl rounded-2xl p-3 shadow-soft-lg border border-white/50"
      >
        <div className="flex items-center gap-4">
          {/* Motor Switch */}
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
              motorOn ? "bg-success text-success-foreground" : "bg-secondary text-muted-foreground"
            )}>
              <Power className="w-5 h-5" />
            </div>
            <Switch
              checked={motorOn}
              onCheckedChange={onMotorToggle}
              className="scale-110"
            />
          </div>

          {/* Divider */}
          <div className="w-px h-10 bg-border" />

          {/* Motor Speed */}
          <div className="flex-1 min-w-[100px]">
            <div className="flex items-center justify-between mb-1">
              <Gauge className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-bold font-mono text-primary">{motorSpeed}%</span>
            </div>
            <Slider
              value={[motorSpeed]}
              onValueChange={(v) => onMotorSpeedChange(v[0])}
              max={100}
              min={0}
              step={1}
              disabled={!motorOn}
              className={cn("h-2", !motorOn && "opacity-50")}
            />
          </div>

          {/* Divider */}
          <div className="w-px h-10 bg-border" />

          {/* Valve Opening */}
          <div className="flex-1 min-w-[100px]">
            <div className="flex items-center justify-between mb-1">
              <Droplets className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-bold font-mono text-primary">{valveOpening}%</span>
            </div>
            <Slider
              value={[valveOpening]}
              onValueChange={(v) => onValveOpeningChange(v[0])}
              max={100}
              min={0}
              step={1}
              disabled={!motorOn}
              className={cn("h-2", !motorOn && "opacity-50")}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card/90 backdrop-blur-xl rounded-[clamp(0.75rem,1.2vw,1.5rem)] shadow-soft-lg border border-white/50"
      style={{
        width: 'var(--fluid-panel-width)',
        padding: 'var(--fluid-panel-padding)',
      }}
    >
      <h3 
        className="font-semibold text-foreground"
        style={{ 
          fontSize: 'var(--fluid-text-base)',
          marginBottom: 'var(--fluid-gap-lg)',
        }}
      >
        Controles
      </h3>

      {/* Master Motor Switch */}
      <div style={{ marginBottom: 'var(--fluid-gap-lg)' }}>
        <div 
          className="flex items-center justify-between"
          style={{ marginBottom: 'var(--fluid-gap-sm)' }}
        >
          <div 
            className="flex items-center"
            style={{ gap: 'var(--fluid-gap-sm)' }}
          >
            <div 
              className={cn(
                "rounded-[clamp(0.5rem,0.8vw,1rem)] flex items-center justify-center transition-colors",
                motorOn ? "bg-success text-success-foreground" : "bg-secondary text-muted-foreground"
              )}
              style={{
                width: 'var(--fluid-circle-md)',
                height: 'var(--fluid-circle-md)',
              }}
            >
              <Power style={{ width: 'var(--fluid-icon-md)', height: 'var(--fluid-icon-md)' }} />
            </div>
            <div>
              <span 
                className="font-medium text-foreground block"
                style={{ fontSize: 'var(--fluid-text-sm)' }}
              >
                Motor Principal
              </span>
              <p 
                className="text-muted-foreground"
                style={{ fontSize: 'var(--fluid-text-xs)' }}
              >
                {motorOn ? 'Encendido' : 'Apagado'}
              </p>
            </div>
          </div>
          <Switch
            checked={motorOn}
            onCheckedChange={onMotorToggle}
            style={{ transform: 'scale(clamp(1, 1.1vw/10, 1.25))' }}
          />
        </div>
      </div>

      {/* Motor Speed Slider */}
      <div style={{ marginBottom: 'var(--fluid-gap-lg)' }}>
        <div 
          className="flex items-center"
          style={{ gap: 'var(--fluid-gap-sm)', marginBottom: 'var(--fluid-gap-sm)' }}
        >
          <div 
            className="rounded-[clamp(0.375rem,0.6vw,0.75rem)] bg-secondary flex items-center justify-center"
            style={{
              width: 'var(--fluid-circle-sm)',
              height: 'var(--fluid-circle-sm)',
            }}
          >
            <Gauge 
              className="text-muted-foreground"
              style={{ width: 'var(--fluid-icon-sm)', height: 'var(--fluid-icon-sm)' }} 
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span 
                className="font-medium text-foreground"
                style={{ fontSize: 'var(--fluid-text-sm)' }}
              >
                Velocidad
              </span>
              <span 
                className="font-bold font-mono text-primary"
                style={{ fontSize: 'var(--fluid-text-lg)' }}
              >
                {motorSpeed}%
              </span>
            </div>
          </div>
        </div>
        <Slider
          value={[motorSpeed]}
          onValueChange={(v) => onMotorSpeedChange(v[0])}
          max={100}
          min={0}
          step={1}
          disabled={!motorOn}
          className={cn(!motorOn && "opacity-50")}
          style={{ height: 'clamp(0.5rem, 0.8vw, 0.75rem)' }}
        />
        <div 
          className="flex justify-between text-muted-foreground"
          style={{ fontSize: 'var(--fluid-text-xs)', marginTop: 'var(--fluid-gap-xs)' }}
        >
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Valve Opening Slider */}
      <div>
        <div 
          className="flex items-center"
          style={{ gap: 'var(--fluid-gap-sm)', marginBottom: 'var(--fluid-gap-sm)' }}
        >
          <div 
            className="rounded-[clamp(0.375rem,0.6vw,0.75rem)] bg-secondary flex items-center justify-center"
            style={{
              width: 'var(--fluid-circle-sm)',
              height: 'var(--fluid-circle-sm)',
            }}
          >
            <Droplets 
              className="text-muted-foreground"
              style={{ width: 'var(--fluid-icon-sm)', height: 'var(--fluid-icon-sm)' }} 
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span 
                className="font-medium text-foreground"
                style={{ fontSize: 'var(--fluid-text-sm)' }}
              >
                Válvula
              </span>
              <span 
                className="font-bold font-mono text-primary"
                style={{ fontSize: 'var(--fluid-text-lg)' }}
              >
                {valveOpening}%
              </span>
            </div>
          </div>
        </div>
        <Slider
          value={[valveOpening]}
          onValueChange={(v) => onValveOpeningChange(v[0])}
          max={100}
          min={0}
          step={1}
          disabled={!motorOn}
          className={cn(!motorOn && "opacity-50")}
          style={{ height: 'clamp(0.5rem, 0.8vw, 0.75rem)' }}
        />
        <div 
          className="flex justify-between text-muted-foreground"
          style={{ fontSize: 'var(--fluid-text-xs)', marginTop: 'var(--fluid-gap-xs)' }}
        >
          <span>Cerrada</span>
          <span>50%</span>
          <span>Abierta</span>
        </div>
      </div>
    </motion.div>
  );
};