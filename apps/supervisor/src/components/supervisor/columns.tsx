"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  CircleDashed,
  Loader2,
  AlertCircle,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export interface TestItem {
  id: string;
  status: string;
  numeroSerie?: string;
  generalInfo: {
    pedido: string;
    posicion?: string;
    cliente: string;
    modeloBomba?: string;
    ordenTrabajo?: string;
    numeroBombas: number;
  };
}

// Helper for status config (moved to function for translation)
const getStatusConfig = (status: string, t: (key: string) => string) => {
  const baseStatusClass =
    "border-slate-200 dark:border-slate-700 bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors";

  const config: Record<
    string,
    {
      label: string;
      icon: React.ElementType;
      className: string;
      iconClassName: string;
    }
  > = {
    PENDING: {
      label: t("status.PENDING"),
      icon: CircleDashed,
      className: baseStatusClass,
      iconClassName: "text-orange-500 dark:text-orange-400",
    },
    IN_PROGRESS: {
      label: t("status.IN_PROGRESS"),
      icon: Loader2,
      className: baseStatusClass,
      iconClassName: "text-blue-500 dark:text-blue-400 animate-spin",
    },
    GENERATED: {
      label: t("status.PROCESSED"),
      icon: CheckCircle2,
      className: baseStatusClass,
      iconClassName: "text-green-500 dark:text-green-400",
    },
    COMPLETED: {
      label: t("status.COMPLETED"),
      icon: CheckCircle2,
      className: baseStatusClass,
      iconClassName: "text-green-500 dark:text-green-400",
    },
  };

  return (
    config[status] || {
      label: status,
      icon: AlertCircle,
      className: baseStatusClass,
      iconClassName: "text-slate-400",
    }
  );
};

// Simple sortable header
function SortableHeader({ column, title }: { column: any; title: string }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      {column.getIsSorted() === "asc" ? (
        <ArrowUp className="ml-2 h-4 w-4" />
      ) : column.getIsSorted() === "desc" ? (
        <ArrowDown className="ml-2 h-4 w-4" />
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
      )}
    </Button>
  );
}

export const getColumns = (
  t: (key: string) => string,
  onDelete?: (id: string) => void,
): ColumnDef<TestItem>[] => [
  {
    accessorKey: "status",
    header: ({ column }) => (
      <SortableHeader column={column} title={t("col.status")} />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const config = getStatusConfig(status, t);
      const Icon = config.icon;
      return (
        <Badge
          variant="outline"
          className={`rounded-full pl-1.5 pr-2.5 py-0.5 font-medium border ${config.className}`}
        >
          <Icon className={`w-3.5 h-3.5 mr-1.5 ${config.iconClassName}`} />
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "generalInfo.pedido",
    id: "pedido",
    header: ({ column }) => (
      <SortableHeader column={column} title="PEDIDO-POSICIÓN" />
    ),
    cell: ({ row }) => {
      const pedido = row.original.generalInfo.pedido;
      return (
        <span className="font-mono font-medium text-primary">{pedido}</span>
      );
    },
  },
  {
    accessorKey: "generalInfo.cliente",
    id: "cliente",
    header: ({ column }) => (
      <SortableHeader column={column} title={t("col.client")} />
    ),
    cell: ({ row }) => {
      const cliente = row.original.generalInfo.cliente;
      return (
        <span className="font-medium truncate max-w-[200px] block">
          {cliente}
        </span>
      );
    },
  },
  {
    accessorKey: "generalInfo.modeloBomba",
    id: "modelo",
    header: t("col.model"),
    cell: ({ row }) => {
      const modelo = row.original.generalInfo.modeloBomba;
      return (
        <span className="font-mono text-sm text-muted-foreground">
          {modelo || "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "generalInfo.ordenTrabajo",
    id: "orden",
    header: t("col.workOrder"),
    cell: ({ row }) => {
      const orden = row.original.generalInfo.ordenTrabajo;
      return (
        <span className="font-mono text-sm text-muted-foreground">
          {orden || "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "generalInfo.numeroBombas",
    id: "numero",
    header: ({ column }) => (
      <SortableHeader column={column} title={t("col.qty")} />
    ),
    cell: ({ row }) => {
      const numero = row.original.generalInfo.numeroBombas;
      return (
        <span className="font-mono text-sm text-center block">{numero}</span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div
        className="flex items-center justify-end gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {onDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Eliminar registro"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente
                  este registro y toda la información asociada del servidor.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(row.original.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Confirmar eliminación
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
    ),
  },
];
