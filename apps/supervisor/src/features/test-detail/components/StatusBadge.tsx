/**
 * StatusBadge Component
 * 
 * Displays test status with appropriate styling.
 * Pure presentational component.
 */

import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/language-context";

interface StatusBadgeProps {
  status: string;
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  SIN_PROCESAR: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
  EN_PROCESO: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  EN_BANCO: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  GENERADO: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
  GENERATED: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
  COMPLETED: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
};

const STATUS_LABEL_KEYS: Record<string, string> = {
  PENDING: "status.PENDING",
  SIN_PROCESAR: "status.SIN_PROCESAR",
  EN_PROCESO: "status.IN_PROGRESS",
  IN_PROGRESS: "status.IN_PROGRESS",
  EN_BANCO: "status.EN_BANCO",
  GENERADO: "status.GENERADO",
  GENERATED: "status.GENERATED",
  COMPLETED: "status.COMPLETED",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useLanguage();
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES["PENDING"];
  const statusLabelKey = STATUS_LABEL_KEYS[status];
  const statusLabel = statusLabelKey
    ? t(statusLabelKey)
    : status.replace(/_/g, " ").toLowerCase();

  return (
    <Badge 
      variant="outline" 
      className={`${statusStyle} border px-3 py-1 font-medium capitalize`}
    >
      {statusLabel}
    </Badge>
  );
}
