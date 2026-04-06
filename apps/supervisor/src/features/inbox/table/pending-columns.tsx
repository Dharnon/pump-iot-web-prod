"use client";

import type { Column, ColumnDef } from "@tanstack/react-table";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CircleCheck,
  CircleDashed,
  Clock,
  Trash2,
  Wrench,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Locks } from "@/hooks/useSignalR";

export interface PendingTestItem {
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

const getStatusConfig = (status: string, t: (key: string) => string) => {
  const baseStatusClass =
    "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40";

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
      icon: Clock,
      className: baseStatusClass,
      iconClassName: "size-3.5 shrink-0 text-orange-500 dark:text-orange-400",
    },
    EN_BANCO: {
      label: "En Banco",
      icon: Wrench,
      className: baseStatusClass,
      iconClassName: "size-3.5 shrink-0 text-amber-600 dark:text-amber-500",
    },
    IN_PROGRESS: {
      label: t("status.IN_PROGRESS"),
      icon: CircleDashed,
      className: baseStatusClass,
      iconClassName: "size-3.5 shrink-0 text-muted-foreground",
    },
    GENERATED: {
      label: t("status.PROCESSED"),
      icon: CircleCheck,
      className: baseStatusClass,
      iconClassName:
        "size-3.5 shrink-0 fill-emerald-500 stroke-emerald-500 text-emerald-500 dark:fill-emerald-400 dark:stroke-emerald-400",
    },
    COMPLETED: {
      label: t("status.COMPLETED"),
      icon: CircleCheck,
      className: baseStatusClass,
      iconClassName:
        "size-3.5 shrink-0 fill-emerald-500 stroke-emerald-500 text-emerald-500 dark:fill-emerald-400 dark:stroke-emerald-400",
    },
  };

  return (
    config[status] || {
      label: status,
      icon: AlertCircle,
      className: baseStatusClass,
      iconClassName: "size-3.5 shrink-0 text-slate-400",
    }
  );
};

function SortableHeader({
  column,
  title,
}: {
  column: Column<PendingTestItem, unknown>;
  title: string;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 whitespace-nowrap"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      {column.getIsSorted() === "asc" ? (
        <ArrowUp className="ml-2 h-4 w-4 shrink-0" />
      ) : column.getIsSorted() === "desc" ? (
        <ArrowDown className="ml-2 h-4 w-4 shrink-0" />
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      )}
    </Button>
  );
}

export const getPendingColumns = (
  t: (key: string) => string,
  onDelete?: (id: string) => void,
  locks?: Locks,
): ColumnDef<PendingTestItem>[] => [
  {
    accessorKey: "status",
    header: ({ column }) => (
      <SortableHeader column={column} title={t("col.status")} />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const lockedBy = locks?.[row.original.id];

      if (lockedBy) {
        return (
          <div className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1.5 rounded-md border-border/60 bg-muted/20 px-1.5 py-0.5 font-normal text-muted-foreground"
            >
              <CircleDashed className="size-3.5 shrink-0 text-muted-foreground" />
              En Proceso
            </Badge>
            <span className="font-mono text-[10px] text-muted-foreground">
              {lockedBy}
            </span>
          </div>
        );
      }

      const config = getStatusConfig(status, t);
      const Icon = config.icon;
      return (
        <Badge
          variant="outline"
          className={`inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 font-normal ${config.className}`}
        >
          <Icon className={config.iconClassName} />
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
    cell: ({ row }) => (
      <span className="font-mono font-medium text-primary">
        {row.original.generalInfo.pedido}
      </span>
    ),
  },
  {
    accessorKey: "generalInfo.cliente",
    id: "cliente",
    header: ({ column }) => (
      <SortableHeader column={column} title={t("col.client")} />
    ),
    cell: ({ row }) => (
      <span className="block max-w-[200px] truncate font-medium">
        {row.original.generalInfo.cliente}
      </span>
    ),
  },
  {
    accessorKey: "generalInfo.modeloBomba",
    id: "modelo",
    header: t("col.model"),
    cell: ({ row }) => (
      <span className="font-mono text-sm text-muted-foreground">
        {row.original.generalInfo.modeloBomba || "-"}
      </span>
    ),
  },
  {
    accessorKey: "generalInfo.ordenTrabajo",
    id: "orden",
    header: t("col.workOrder"),
    cell: ({ row }) => (
      <span className="block whitespace-nowrap font-mono text-sm text-muted-foreground">
        {row.original.generalInfo.ordenTrabajo || "-"}
      </span>
    ),
  },
  {
    accessorKey: "generalInfo.numeroBombas",
    id: "numero",
    header: ({ column }) => (
      <SortableHeader column={column} title={t("col.qty")} />
    ),
    cell: ({ row }) => (
      <span className="block text-center font-mono text-sm">
        {row.original.generalInfo.numeroBombas}
      </span>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <div
        className="flex items-center justify-end gap-2"
        onClick={(event) => event.stopPropagation()}
      >
        {onDelete ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                title="Eliminar registro"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará
                  permanentemente este registro y toda la información asociada
                  del servidor.
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
        ) : null}
      </div>
    ),
  },
];
