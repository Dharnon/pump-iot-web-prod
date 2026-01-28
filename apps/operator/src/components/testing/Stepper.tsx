import React from 'react';
import { motion } from 'framer-motion';
import { Check, Circle, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TestPoint } from '@/contexts/TestingContext';
import { cn } from '@/lib/utils';

interface StepperProps {
  points: TestPoint[];
  currentIndex: number;
  isStable: boolean;
  onCapture: () => void;
}

export const Stepper: React.FC<StepperProps> = ({
  points,
  currentIndex,
  isStable,
  onCapture
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.3 }} 
      className="bg-card/95 backdrop-blur-xl rounded-[clamp(0.75rem,1.2vw,1.5rem)] shadow-soft-lg border border-white/50"
      style={{
        paddingLeft: 'var(--fluid-panel-padding)',
        paddingRight: 'var(--fluid-panel-padding)',
        paddingTop: 'var(--fluid-card-padding)',
        paddingBottom: 'var(--fluid-card-padding)',
      }}
    >
      <div 
        className="flex items-center"
        style={{ gap: 'var(--fluid-gap-lg)' }}
      >
        {/* Progress Steps */}
        <div 
          className="flex items-start flex-1 px-[2px]"
          style={{ gap: 'var(--fluid-gap-xs)' }}
        >
          {points.map((point, index) => {
            const isCompleted = point.captured;
            const isCurrent = index === currentIndex;
            const isPending = index > currentIndex;
            
            return (
              <React.Fragment key={point.id}>
                {/* Step indicator */}
                <div className="flex flex-col items-center">
                  <div 
                    className={cn(
                      "rounded-full flex items-center justify-center font-bold transition-all",
                      isCompleted && "bg-success text-success-foreground",
                      isCurrent && "gradient-primary text-primary-foreground",
                      isPending && "bg-secondary text-muted-foreground"
                    )}
                    style={{
                      width: 'var(--fluid-circle-sm)',
                      height: 'var(--fluid-circle-sm)',
                      fontSize: 'var(--fluid-text-sm)',
                      boxShadow: isCurrent ? '0 0 0 clamp(2px, 0.3vw, 4px) hsl(var(--primary) / 0.3)' : 'none',
                    }}
                  >
                    {isCompleted ? (
                      <Check style={{ width: 'var(--fluid-icon-sm)', height: 'var(--fluid-icon-sm)' }} />
                    ) : isCurrent ? (
                      <Target style={{ width: 'var(--fluid-icon-sm)', height: 'var(--fluid-icon-sm)' }} />
                    ) : (
                      <Circle style={{ width: 'var(--fluid-icon-xs)', height: 'var(--fluid-icon-xs)' }} />
                    )}
                  </div>
                  <span 
                    className={cn(
                      "font-mono",
                      isCurrent ? "text-foreground font-medium" : "text-muted-foreground"
                    )}
                    style={{ 
                      fontSize: 'var(--fluid-text-2xs)', 
                      marginTop: 'var(--fluid-gap-xs)' 
                    }}
                  >
                    {point.targetFlow.toFixed(1)}
                  </span>
                </div>

                {/* Connector line */}
                {index < points.length - 1 && (
                  <div 
                    className={cn(
                      "flex-1 rounded-full transition-colors self-start",
                      isCompleted ? "bg-success" : "bg-secondary"
                    )}
                    style={{
                      height: 'clamp(2px, 0.35vw, 4px)',
                      marginTop: 'calc(var(--fluid-circle-sm) / 2 - clamp(1px, 0.175vw, 2px))',
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Capture Button */}
        <div className="flex-shrink-0">
          {currentIndex < points.length ? (
            <Button 
              onClick={onCapture} 
              disabled={!isStable} 
              className={cn(
                "rounded-full font-semibold transition-all",
                isStable 
                  ? "gradient-primary text-primary-foreground shadow-lg hover:shadow-xl" 
                  : "bg-secondary text-muted-foreground cursor-not-allowed"
              )}
              style={{
                height: 'var(--fluid-button-height)',
                paddingLeft: 'var(--fluid-gap-lg)',
                paddingRight: 'var(--fluid-gap-lg)',
                fontSize: 'var(--fluid-text-sm)',
              }}
            >
              {isStable ? (
                <>
                  <Target style={{ 
                    width: 'var(--fluid-icon-sm)', 
                    height: 'var(--fluid-icon-sm)',
                    marginRight: 'var(--fluid-gap-xs)',
                  }} />
                  <span>Capturar Punto {currentIndex + 1}</span>
                </>
              ) : (
                <>
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }} 
                    className="border-2 border-muted-foreground border-t-transparent rounded-full"
                    style={{ 
                      width: 'var(--fluid-icon-sm)', 
                      height: 'var(--fluid-icon-sm)',
                      marginRight: 'var(--fluid-gap-xs)',
                    }}
                  />
                  <span>Esperando Estabilidad...</span>
                </>
              )}
            </Button>
          ) : (
            <Button 
              className="rounded-full font-semibold bg-success text-success-foreground"
              style={{
                height: 'var(--fluid-button-height)',
                paddingLeft: 'var(--fluid-gap-lg)',
                paddingRight: 'var(--fluid-gap-lg)',
                fontSize: 'var(--fluid-text-sm)',
              }}
            >
              <Check style={{ 
                width: 'var(--fluid-icon-sm)', 
                height: 'var(--fluid-icon-sm)',
                marginRight: 'var(--fluid-gap-xs)',
              }} />
              <span>Prueba Completada</span>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};