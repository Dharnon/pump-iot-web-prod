import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Job } from "@/contexts/JobProvider";
import { cn } from "@/lib/utils";

// Cast icons to any to avoid TS errors with current setup
const ClockIcon = Clock as any;
const CheckCircle2Icon = CheckCircle2 as any;
const AlertTriangleIcon = AlertTriangle as any;
const ChevronRightIcon = ChevronRight as any;
const FileTextIcon = FileText as any;

interface JobCardProps {
  job: Job;
  onStart?: () => void;
  onView?: () => void;
  onAnalyze?: () => void;
}

const statusConfig = {
  GENERADA: {
    icon: ClockIcon,
    label: "Generada",
    className: "bg-pending text-pending-foreground",
    borderClass: "border-pending/30",
  },
  OK: {
    icon: CheckCircle2Icon,
    label: "OK",
    className: "bg-success text-success-foreground",
    borderClass: "border-success/30",
  },
  KO: {
    icon: AlertTriangleIcon,
    label: "KO",
    className: "bg-destructive text-destructive-foreground",
    borderClass: "border-destructive/30",
  },
  EN_PROCESO: {
    icon: ClockIcon,
    label: "En Proceso",
    className: "bg-warning text-warning-foreground",
    borderClass: "border-warning/30",
  },
};

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onStart,
  onView,
  onAnalyze,
}) => {
  const status = statusConfig[job.status];
  const StatusIcon = status.icon;
  const [showErrorDetails, setShowErrorDetails] = React.useState(false);

  const handleBadgeClick = (e: React.MouseEvent) => {
    if (job.status === "KO") {
      e.stopPropagation();
      setShowErrorDetails(!showErrorDetails);
    }
  };

  const dateFormatted = new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(job.createdAt));

  const isPending = job.status === "GENERADA";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={isPending ? onStart : undefined}
      className={cn(
        "bg-card rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300",
        "border h-full flex flex-col cursor-default",
        status.borderClass,
        isPending && "cursor-pointer hover:border-primary/50 group",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <Badge
          onClick={handleBadgeClick}
          className={cn(
            "px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all select-none",
            status.className,
            job.status === "KO" &&
              "cursor-pointer hover:opacity-80 active:scale-95 ring-offset-2 focus:ring-2 focus:ring-destructive",
          )}
        >
          <StatusIcon className="w-3 h-3 mr-1" />
          {status.label}
          {job.status === "KO" && (
            <ChevronRightIcon
              className={cn(
                "w-3 h-3 ml-1 transition-transform",
                showErrorDetails && "rotate-90",
              )}
            />
          )}
        </Badge>
        <span className="text-[10px] font-medium text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-md">
          {dateFormatted}
        </span>
      </div>

      {/* Main Info */}
      <div className="space-y-3 mb-4 flex-1">
        <h3
          className={cn(
            "text-lg font-bold font-mono text-foreground leading-tight",
            isPending && "group-hover:text-primary transition-colors",
          )}
        >
          {job.orderId}
        </h3>

        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            Cliente
          </span>
          <p className="text-sm font-medium text-foreground">{job.client}</p>
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            Modelo
          </span>
          <p className="text-xs font-mono text-muted-foreground/80">
            {job.model}
          </p>
        </div>

        {(job.protocolSpec?.workOrder || job.orderId) && (
          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Orden Trabajo
            </span>
            <p className="text-sm font-medium text-foreground">
              {job.protocolSpec?.workOrder || job.orderId}
            </p>
          </div>
        )}
      </div>

      {/* Error message for KO status - Collapsible */}
      {job.status === "KO" && job.errorMessage && showErrorDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          className="overflow-hidden"
        >
          <div className="bg-destructive-muted rounded-lg px-3 py-2 flex items-start gap-2">
            <AlertTriangleIcon className="w-3 h-3 text-destructive flex-shrink-0 mt-0.5" />
            <span className="text-xs font-medium text-destructive leading-tight">
              {job.errorMessage}
            </span>
          </div>
        </motion.div>
      )}

      {/* Action buttons (Only for history) */}
      {(job.status === "OK" || job.status === "KO") && (
        <div className="flex gap-2 mt-auto pt-3 border-t border-border/50">
          {job.status === "OK" && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onView?.();
              }}
              variant="outline"
              size="sm"
              className="w-full rounded-full h-9 text-xs font-semibold border-success/30 text-success hover:bg-success hover:text-success-foreground"
            >
              <FileTextIcon className="w-3 h-3 mr-2" />
              Ver Reporte
            </Button>
          )}
          {job.status === "KO" && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onAnalyze?.();
              }}
              variant="outline"
              size="sm"
              className="w-full rounded-full h-9 text-xs font-semibold border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <AlertTriangleIcon className="w-3 h-3 mr-2" />
              Analizar
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
};
