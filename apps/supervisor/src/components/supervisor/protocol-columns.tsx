"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Loader2,
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

export interface ProtocolItem {
  id: string;
  status: string;
  numeroSerie?: string;
  fecha: string;
  generalInfo: {
    pedido: string;
    cliente: string;
    modeloBomba?: string;
    ordenTrabajo?: string;
    numeroBombas: number;
  };
  bomba?: {
    tipo?: string;
    diametroRodete?: string;
  };
}

const getStatusConfig = (status: string, t: (key: string) => string) => {
  const baseClass =
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
    GENERADO: {
      label: t("status.GENERATED"),
      icon: CheckCircle2,
      className: baseClass,
      iconClassName: "text-green-500 dark:text-green-400",
    },
    GENERATED: {
      label: t("status.GENERATED"),
      icon: CheckCircle2,
      className: baseClass,
      iconClassName: "text-green-500 dark:text-green-400",
    },
    IN_PROGRESS: {
      label: t("status.IN_PROGRESS"),
      icon: Loader2,
      className: baseClass,
      iconClassName: "text-blue-500 dark:text-blue-400 animate-spin",
    },
    COMPLETED: {
      label: t("status.COMPLETED"),
      icon: CheckCircle2,
      className: baseClass,
      iconClassName: "text-green-500 dark:text-green-400",
    },
  };

  return config[status] || config["GENERADO"];
};

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

export const getProtocolColumns = (
  t: (key: string) => string,
  onDelete?: (id: string) => void,
  locks?: Record<string, string>, // protocolId → device name (from SignalR)
): ColumnDef<ProtocolItem>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <SortableHeader column={column} title="Nº Protocolo" />
    ),
    cell: ({ row }) => {
      return (
        <span className="font-mono font-bold text-primary">
          {row.getValue("id")}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <SortableHeader column={column} title={t("col.status")} />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const lockedBy = locks?.[row.original.id];

      // *** When a tablet is executing this protocol, show IN_PROGRESS style ***
      if (lockedBy) {
        return (
          <div className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              className="rounded-full pl-1.5 pr-2.5 py-0.5 font-medium border border-slate-200 dark:border-slate-700 bg-transparent text-slate-600 dark:text-slate-300"
            >
              <Loader2 className="w-3.5 h-3.5 mr-1.5 text-blue-500 dark:text-blue-400 animate-spin" />
              En Proceso
            </Badge>
            <span className="text-[10px] text-muted-foreground font-mono">
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
          className={`rounded-full pl-1.5 pr-2.5 py-0.5 font-medium border ${config.className}`}
        >
          <Icon className={`w-3.5 h-3.5 mr-1.5 ${config.iconClassName}`} />
          {config.label}
        </Badge>
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
      const cliente = row.original.generalInfo?.cliente;
      return (
        <span className="font-medium truncate max-w-[200px] block">
          {cliente || "-"}
        </span>
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
      const pedido = row.original.generalInfo?.pedido;
      return <span className="font-mono text-sm">{pedido || "-"}</span>;
    },
  },
  {
    accessorKey: "generalInfo.modeloBomba",
    id: "modelo",
    header: "Modelo",
    cell: ({ row }) => {
      const modelo = row.original.generalInfo?.modeloBomba;
      return (
        <span className="font-mono text-sm text-muted-foreground truncate max-w-[200px] block">
          {modelo || "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "generalInfo.ordenTrabajo",
    id: "ordenTrabajo",
    header: "Orden Trabajo",
    cell: ({ row }) => {
      const orden = row.original.generalInfo?.ordenTrabajo;
      return (
        <span className="font-mono text-sm text-muted-foreground">
          {orden || "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "fecha",
    header: ({ column }) => <SortableHeader column={column} title="Fecha" />,
    cell: ({ row }) => {
      const fecha = row.original.fecha;
      if (!fecha) return <span className="text-muted-foreground">-</span>;
      const date = new Date(fecha);
      return (
        <span className="text-sm text-muted-foreground">
          {date.toLocaleDateString()}
        </span>
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
                title="Eliminar protocolo"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente
                  este protocolo y toda la información asociada del servidor.
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
