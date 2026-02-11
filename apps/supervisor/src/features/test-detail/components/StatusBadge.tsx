/**
 * StatusBadge Component
 * 
 * Displays test status with appropriate styling.
 * Pure presentational component.
 */

import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  SIN_PROCESAR: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
  EN_PROCESO: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  GENERADO: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
  GENERATED: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
  COMPLETED: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES["PENDING"];

  return (
    <Badge 
      variant="outline" 
      className={`${statusStyle} border px-3 py-1 font-medium capitalize`}
    >
      {status.replace(/_/g, " ").toLowerCase()}
    </Badge>
  );
}
