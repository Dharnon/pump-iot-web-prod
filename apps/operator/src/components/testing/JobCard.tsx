import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Clock, ChevronRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Job } from '@/contexts/TestingContext';
import { cn } from '@/lib/utils';

interface JobCardProps {
  job: Job;
  onStart?: () => void;
  onView?: () => void;
  onAnalyze?: () => void;
}

const statusConfig = {
  GENERADA: {
    icon: Clock,
    label: 'Generada',
    className: 'bg-pending text-pending-foreground',
    borderClass: 'border-pending/30',
  },
  OK: {
    icon: CheckCircle2,
    label: 'OK',
    className: 'bg-success text-success-foreground',
    borderClass: 'border-success/30',
  },
  KO: {
    icon: AlertTriangle,
    label: 'KO',
    className: 'bg-destructive text-destructive-foreground',
    borderClass: 'border-destructive/30',
  },
  EN_PROCESO: {
    icon: Clock,
    label: 'En Proceso',
    className: 'bg-warning text-warning-foreground',
    borderClass: 'border-warning/30',
  },
};

export const JobCard: React.FC<JobCardProps> = ({ job, onStart, onView, onAnalyze }) => {
  const status = statusConfig[job.status];
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "bg-card rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-soft hover:shadow-soft-lg transition-shadow duration-300",
        "border-2",
        status.borderClass
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div>
          <span className="text-xs md:text-sm font-medium text-muted-foreground">Pedido</span>
          <h3 className="text-xl md:text-2xl font-bold font-mono text-foreground">{job.orderId}</h3>
        </div>
        <Badge className={cn("px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold", status.className)}>
          <StatusIcon className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5 md:mr-1" />
          {status.label}
        </Badge>
      </div>

      {/* Model */}
      <div className="mb-3 md:mb-4">
        <span className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wide">Modelo</span>
        <p className="text-xs md:text-sm font-medium text-foreground mt-0.5 md:mt-1 font-mono">{job.model}</p>
      </div>

      {/* Client */}
      <div className="mb-3 md:mb-4">
        <span className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wide">Cliente</span>
        <p className="text-xs md:text-sm font-medium text-foreground mt-0.5 md:mt-1">{job.client}</p>
      </div>

      {/* Specs */}
      <div className="flex gap-2 md:gap-4 mb-4 md:mb-6 text-[10px] md:text-xs">
        <div className="bg-secondary rounded-lg md:rounded-xl px-2 md:px-3 py-1.5 md:py-2">
          <span className="text-muted-foreground">Target</span>
          <span className="font-bold font-mono ml-1">{job.targetFlow} m³/h</span>
        </div>
        <div className="bg-secondary rounded-lg md:rounded-xl px-2 md:px-3 py-1.5 md:py-2">
          <span className="text-muted-foreground">Impulsor</span>
          <span className="font-bold font-mono ml-1">{job.impeller}</span>
        </div>
      </div>

      {/* Error message for KO status */}
      {job.status === 'KO' && job.errorMessage && (
        <div className="bg-destructive-muted rounded-lg md:rounded-xl px-3 md:px-4 py-2 md:py-3 mb-3 md:mb-4 flex items-center gap-2">
          <AlertTriangle className="w-3 h-3 md:w-4 md:h-4 text-destructive flex-shrink-0" />
          <span className="text-xs md:text-sm font-medium text-destructive">{job.errorMessage}</span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 md:gap-3">
        {job.status === 'GENERADA' && (
          <Button
            onClick={onStart}
            className="flex-1 gradient-primary text-primary-foreground rounded-full h-10 md:h-12 text-xs md:text-sm font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <span className="hidden sm:inline">Iniciar Configuración</span>
            <span className="sm:hidden">Iniciar</span>
            <ChevronRight className="w-3 h-3 md:w-4 md:h-4 ml-1" />
          </Button>
        )}
        {job.status === 'OK' && (
          <Button
            onClick={onView}
            variant="outline"
            className="flex-1 rounded-full h-10 md:h-12 text-xs md:text-sm font-semibold border-2 border-success text-success hover:bg-success hover:text-success-foreground"
          >
            <FileText className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Ver Reporte</span>
            <span className="sm:hidden">Ver</span>
          </Button>
        )}
        {job.status === 'KO' && (
          <Button
            onClick={onAnalyze}
            variant="outline"
            className="flex-1 rounded-full h-10 md:h-12 text-xs md:text-sm font-semibold border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <AlertTriangle className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            Analizar
          </Button>
        )}
      </div>
    </motion.div>
  );
};
