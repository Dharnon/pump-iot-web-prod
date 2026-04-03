"use client";

import type { ColumnDef } from "@tanstack/react-table";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  CircleCheck,
  CircleDashed,
  FileText,
  FileX,
  Trash2,
  Wrench,
} from "lucide-react";

import type { Locks } from "@/hooks/useSignalR";

const actionButtonIconClass =
  "flex h-8 w-8 items-center justify-center rounded-md border shadow-xs transition-[background-color,border-color,color,box-shadow] focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";

const moveToBankButtonClass = `${actionButtonIconClass} border-sky-200/80 bg-sky-50/90 text-sky-700 hover:border-sky-300 hover:bg-sky-100 focus-visible:ring-sky-400 dark:border-sky-900/80 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:border-sky-800 dark:hover:bg-sky-950/70 dark:focus-visible:ring-sky-700`;

const returnToGeneratedButtonClass = `${actionButtonIconClass} border-emerald-200/80 bg-emerald-50/90 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100 focus-visible:ring-emerald-400 dark:border-emerald-900/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/70 dark:focus-visible:ring-emerald-700`;

export interface ProtocolItem {
  id: string;
  status: string;
  numeroSerie?: string;
  fecha: string;
  bancoId?: number;
  hasPdf?: boolean;
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
    "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40";

  const config: Record<
    string,
    {
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      className: string;
      iconClassName: string;
    }
  > = {
    GENERADO: {
      label: t("status.GENERATED"),
      icon: CircleCheck,
      className: baseClass,
      iconClassName:
        "size-3.5 shrink-0 fill-emerald-500 stroke-emerald-500 text-emerald-500 dark:fill-emerald-400 dark:stroke-emerald-400",
    },
    GENERATED: {
      label: t("status.GENERATED"),
      icon: CircleCheck,
      className: baseClass,
      iconClassName:
        "size-3.5 shrink-0 fill-emerald-500 stroke-emerald-500 text-emerald-500 dark:fill-emerald-400 dark:stroke-emerald-400",
    },
    IN_PROGRESS: {
      label: t("status.IN_PROGRESS"),
      icon: CircleDashed,
      className: baseClass,
      iconClassName: "size-3.5 shrink-0 text-muted-foreground",
    },
    COMPLETED: {
      label: t("status.COMPLETED"),
      icon: CircleCheck,
      className: baseClass,
      iconClassName:
        "size-3.5 shrink-0 fill-emerald-500 stroke-emerald-500 text-emerald-500 dark:fill-emerald-400 dark:stroke-emerald-400",
    },
    EN_BANCO: {
      label: "En Banco",
      icon: Wrench,
      className: baseClass,
      iconClassName: "size-3.5 shrink-0 text-amber-600 dark:text-amber-500",
    },
  };

  return config[status] || config.GENERADO;
};

function SortableHeader({ column, title }: { column: any; title: string }) {
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

export const getProtocolColumns = (
  t: (key: string) => string,
  onDelete?: (id: string) => void,
  onMoveToBank?: (id: string, bancoId?: number) => void,
  onReturnToGenerated?: (id: string, bancoId?: number) => void,
  locks?: Locks,
  bancos?: Array<{ id: number; nombre: string }>,
): ColumnDef<ProtocolItem>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <SortableHeader column={column} title="N Protocolo" />
    ),
    cell: ({ row }) => (
      <span className="font-mono font-bold text-primary">
        {row.getValue("id")}
      </span>
    ),
  },
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
    accessorKey: "generalInfo.cliente",
    id: "cliente",
    header: ({ column }) => (
      <SortableHeader column={column} title={t("col.client")} />
    ),
    cell: ({ row }) => (
      <span className="block max-w-[200px] truncate font-medium">
        {row.original.generalInfo?.cliente || "-"}
      </span>
    ),
  },
  {
    accessorKey: "generalInfo.pedido",
    id: "pedido",
    header: ({ column }) => (
      <SortableHeader column={column} title="PEDIDO-POSICION" />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {row.original.generalInfo?.pedido || "-"}
      </span>
    ),
  },
  {
    accessorKey: "generalInfo.modeloBomba",
    id: "modelo",
    header: "Modelo",
    cell: ({ row }) => (
      <span className="block max-w-[200px] truncate font-mono text-sm text-muted-foreground">
        {row.original.generalInfo?.modeloBomba || "-"}
      </span>
    ),
  },
  {
    accessorKey: "generalInfo.ordenTrabajo",
    id: "ordenTrabajo",
    header: "Orden Trabajo",
    cell: ({ row }) => (
      <span className="block whitespace-nowrap font-mono text-sm text-muted-foreground">
        {row.original.generalInfo?.ordenTrabajo || "-"}
      </span>
    ),
  },
  {
    accessorKey: "bancoId",
    id: "banco",
    header: "Banco",
    cell: ({ row }) => {
      const bancoId = row.original.bancoId;
      if (!bancoId) {
        return (
          <span className="pl-3 font-mono text-sm text-muted-foreground">-</span>
        );
      }

      const bank = bancos?.find((bankItem) => bankItem.id === bancoId);
      let identification = "-";

      if (bank) {
        identification = bank.nombre.split(" ").pop() || bank.nombre;
      } else {
        identification =
          ["A", "B", "C", "D", "E"][bancoId - 1] ?? bancoId.toString();
      }

      return (
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10 text-xs font-bold text-amber-600 dark:text-amber-400"
          title={bank?.nombre || `ID: ${bancoId}`}
        >
          {identification}
        </span>
      );
    },
  },
  {
    accessorKey: "hasPdf",
    id: "pdf",
    header: "PDF",
    cell: ({ row }) =>
      row.original.hasPdf ? (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          <FileText className="h-3.5 w-3.5 stroke-[1.5]" />
          Si
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
          <FileX className="h-3.5 w-3.5 stroke-[1.5]" />
          No
        </span>
      ),
  },
  {
    accessorKey: "fecha",
    header: ({ column }) => <SortableHeader column={column} title="Fecha" />,
    cell: ({ row }) => {
      const fecha = row.original.fecha;
      if (!fecha) {
        return <span className="text-muted-foreground">-</span>;
      }

      return (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {new Date(fecha).toLocaleDateString()}
        </span>
      );
    },
  },
  {
    id: "bankAction",
    enableHiding: false,
    header: "",
    cell: ({ row }) => {
      const { id, status, bancoId } = row.original;
      const isGenerated = status === "GENERATED" || status === "GENERADO";
      const isEnBanco = status === "EN_BANCO";
      const isLocked = Boolean(locks?.[id]);

      if (isGenerated && onMoveToBank) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={moveToBankButtonClass}
                onClick={(event: React.MouseEvent) => {
                  event.stopPropagation();
                  onMoveToBank(id, bancoId);
                }}
                disabled={isLocked}
              >
                <Wrench className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Enviar a banco</TooltipContent>
          </Tooltip>
        );
      }

      if (isEnBanco && onReturnToGenerated) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={returnToGeneratedButtonClass}
                onClick={(event: React.MouseEvent) => {
                  event.stopPropagation();
                  onReturnToGenerated(id, bancoId);
                }}
                disabled={isLocked}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Regresar a generado</TooltipContent>
          </Tooltip>
        );
      }

      return null;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const { id } = row.original;

      return (
        <div
          className="flex items-center justify-end gap-1.5"
          onClick={(event) => event.stopPropagation()}
        >
          {onDelete ? (
            <AlertDialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Eliminar protocolo</TooltipContent>
              </Tooltip>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará
                    permanentemente este protocolo y toda la información
                    asociada del servidor.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Confirmar eliminación
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
        </div>
      );
    },
  },
];
