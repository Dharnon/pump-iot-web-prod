"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  ChevronRight,
  FileText,
  FileX,
  Loader2,
  Trash2,
  Wrench,
} from "lucide-react";

const actionButtonClass =
  "h-8 min-w-[7.5rem] justify-center rounded-md border text-xs font-medium shadow-xs transition-[background-color,border-color,color,box-shadow] focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";

const moveToBankButtonClass =
  `${actionButtonClass} border-sky-200/80 bg-sky-50/90 text-sky-700 hover:border-sky-300 hover:bg-sky-100 focus-visible:ring-sky-400 dark:border-sky-900/80 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:border-sky-800 dark:hover:bg-sky-950/70 dark:focus-visible:ring-sky-700`;

const returnToGeneratedButtonClass =
  `${actionButtonClass} border-emerald-200/80 bg-emerald-50/90 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100 focus-visible:ring-emerald-400 dark:border-emerald-900/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/70 dark:focus-visible:ring-emerald-700`;

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
    "border-slate-200 dark:border-slate-700 bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors";

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
    EN_BANCO: {
      label: "En Banco",
      icon: Wrench,
      className: baseClass,
      iconClassName: "text-amber-600 dark:text-amber-500",
    },
  };

  return config[status] || config.GENERADO;
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
  onMoveToBank?: (id: string, bancoId?: number) => void,
  onReturnToGenerated?: (id: string, bancoId?: number) => void,
  locks?: Record<string, string>,
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
    cell: ({ row }) => (
      <span className="font-medium truncate max-w-[200px] block">
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
      <span className="font-mono text-sm text-muted-foreground truncate max-w-[200px] block">
        {row.original.generalInfo?.modeloBomba || "-"}
      </span>
    ),
  },
  {
    accessorKey: "generalInfo.ordenTrabajo",
    id: "ordenTrabajo",
    header: "Orden Trabajo",
    cell: ({ row }) => (
      <span className="font-mono text-sm text-muted-foreground">
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
      if (!bancoId) return null;

      const bank = bancos?.find((b) => b.id === bancoId);
      let identification = "-";

      if (bank) {
        identification = bank.nombre.split(" ").pop() || bank.nombre;
      } else {
        identification =
          ["A", "B", "C", "D", "E"][bancoId - 1] ?? bancoId.toString();
      }

      return (
        <span
          className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs border border-amber-500/20"
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
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-600 dark:text-green-400">
          <FileText className="w-3.5 h-3.5" />
          Si
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
          <FileX className="w-3.5 h-3.5" />
          No
        </span>
      ),
  },
  {
    accessorKey: "fecha",
    header: ({ column }) => <SortableHeader column={column} title="Fecha" />,
    cell: ({ row }) => {
      const fecha = row.original.fecha;
      if (!fecha) return <span className="text-muted-foreground">-</span>;

      return (
        <span className="text-sm text-muted-foreground">
          {new Date(fecha).toLocaleDateString()}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const { id, status, bancoId } = row.original;
      const isGenerated = status === "GENERATED" || status === "GENERADO";
      const isEnBanco = status === "EN_BANCO";
      const isLocked = Boolean(locks?.[id]);

      return (
        <div
          className="flex items-center justify-end gap-2 flex-wrap"
          onClick={(e) => e.stopPropagation()}
        >
          {isGenerated && onMoveToBank && (
            <Button
              variant="outline"
              size="sm"
              className={moveToBankButtonClass}
              onClick={() => onMoveToBank(id, bancoId)}
              title="Enviar a banco"
              aria-label="Enviar a banco"
              disabled={isLocked}
            >
              <Wrench className="w-3.5 h-3.5 mr-1.5" />
              Enviar a banco
            </Button>
          )}

          {isEnBanco && onReturnToGenerated && (
            <Button
              variant="outline"
              size="sm"
              className={returnToGeneratedButtonClass}
              onClick={() => onReturnToGenerated(id, bancoId)}
              title="Regresar a generado"
              aria-label="Regresar a generado"
              disabled={isLocked}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              Regresar a generado
            </Button>
          )}

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
                  <AlertDialogTitle>Esta seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta accion no se puede deshacer. Se eliminara
                    permanentemente este protocolo y toda la informacion
                    asociada del servidor.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Confirmar eliminacion
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      );
    },
  },
];
