"use client";

import * as React from "react";
import type { ReactNode } from "react";
import {
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
} from "@tanstack/react-table";
import { ChevronDown, LayoutGrid } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataGrid } from "@/components/ui/data-grid";
import { DataGridPagination } from "@/components/ui/data-grid-pagination";
import { DataGridTable } from "@/components/ui/data-grid-table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface WorkspaceTableProps<TData extends object, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  onRowClick?: (row: TData) => void;
  globalFilter?: string;
  /** Pestañas u otro contenido a la izquierda de la barra (p. ej. Pendientes / Protocolos). */
  tableChrome?: ReactNode;
  /** Filtro, búsqueda, importar, etc. (misma fila que pestañas y Columnas, encima del panel). */
  toolbar?: ReactNode;
  /** Controles antes del bloque `toolbar` (p. ej. select de estado al inicio de la fila con scroll). */
  toolbarLeading?: ReactNode;
  /** @default true */
  enableRowSelection?: boolean;
  /** @default true */
  showColumnToggle?: boolean;
}

const COLUMN_LABELS: Record<string, string> = {
  select: "Selección",
  id: "N Protocolo",
  status: "Estado",
  cliente: "Cliente",
  pedido: "PEDIDO-POSICION",
  modelo: "Modelo",
  ordenTrabajo: "Orden Trabajo",
  orden: "Orden Trabajo",
  banco: "Banco",
  pdf: "PDF",
  fecha: "Fecha",
  bankAction: "Banco",
  actions: "Acciones",
  numero: "Cantidad",
};

function columnPickerLabel<TData>(column: Column<TData, unknown>): string {
  const meta = column.columnDef.meta as { headerTitle?: string } | undefined;
  if (meta?.headerTitle) return meta.headerTitle;
  return COLUMN_LABELS[column.id] ?? column.id;
}

/**
 * Tabla tipo panel: borde único, cabecera sticky, filas con hover,
 * selección, paginación estilo shadcn data-table y columnas visibles.
 */
export function WorkspaceTable<TData extends object, TValue>({
  columns,
  data,
  loading = false,
  onRowClick,
  globalFilter,
  tableChrome,
  toolbar,
  toolbarLeading,
  enableRowSelection = true,
  showColumnToggle = true,
}: WorkspaceTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const columnsWithSelection = React.useMemo(() => {
    if (!enableRowSelection) return columns;

    const selectionCheckboxClass =
      "translate-y-px border-input bg-background text-foreground data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground";

    const selectColumn: ColumnDef<TData, TValue> = {
      id: "select",
      size: 40,
      maxSize: 48,
      enableSorting: false,
      enableHiding: false,
      meta: {
        headerClassName:
          "text-center [&:has([role=checkbox])]:px-3 [&:has([role=checkbox])]:pe-3",
        cellClassName: "text-center",
      },
      header: ({ table }) => (
        <div className="flex w-full items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Seleccionar todas las filas"
            size="sm"
            className={selectionCheckboxClass}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div
          className="flex w-full items-center justify-center"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Seleccionar fila"
            size="sm"
            className={selectionCheckboxClass}
          />
        </div>
      ),
    };

    return [selectColumn, ...columns];
  }, [columns, enableRowSelection]);

  const table = useReactTable({
    data,
    columns: columnsWithSelection,
    getRowId: (originalRow, index) => {
      const rowWithId = originalRow as { id?: unknown };
      return rowWithId.id != null ? String(rowWithId.id) : String(index);
    },
    state: {
      sorting,
      columnVisibility,
      globalFilter,
      pagination,
      rowSelection,
    },
    enableRowSelection,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const hideableColumns = table.getAllColumns().filter((column) => column.getCanHide());
  const showColumnMenu = showColumnToggle && hideableColumns.length > 0;
  const showTopBar =
    Boolean(tableChrome) ||
    showColumnMenu ||
    Boolean(toolbarLeading) ||
    Boolean(toolbar);

  const columnMenuButton = showColumnMenu ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 rounded-xl border-border/70 bg-background px-3 text-xs font-medium shadow-none"
        >
          <LayoutGrid className="size-3.5 opacity-70" />
          <span className="hidden sm:inline">Personalizar columnas</span>
          <ChevronDown className="size-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {hideableColumns
          .filter((column) => column.getCanHide())
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {columnPickerLabel(column)}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  ) : null;

  return (
    <DataGrid
      table={table}
      recordCount={data.length}
      isLoading={loading}
      onRowClick={onRowClick}
      tableLayout={{
        headerSticky: true,
        headerBackground: true,
        headerBorder: true,
        rowBorder: true,
        cellBorder: false,
        stripped: false,
        width: "auto",
        dense: true,
      }}
      tableClassNames={{
        headerSticky:
          "sticky top-0 z-10 bg-[#f5f5f5] supports-[backdrop-filter]:bg-[#f5f5f5]/95 dark:bg-[#262626] dark:supports-[backdrop-filter]:bg-[#262626]/95",
        headerRow: "border-b border-border/40 bg-transparent",
        headerCell:
          "h-10 min-h-10 px-3 py-2 text-xs font-medium normal-case tracking-normal text-muted-foreground",
        body: "bg-transparent",
        bodyRow:
          "bg-transparent hover:bg-muted/30 data-[state=selected]:bg-primary/5 data-[state=selected]:shadow-[inset_3px_0_0_0_hsl(var(--primary))] dark:bg-[#0a0a0a] dark:hover:bg-[#181818] dark:data-[state=selected]:bg-[#181818]",
      }}
      className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-6"
    >
      {/* Misma idea que shadcn DataTable: fila superior justify-between + px horizontal */}
      {showTopBar ? (
        <div className="flex w-full min-w-0 flex-col gap-3 py-1 sm:flex-row sm:items-center sm:justify-start sm:gap-4">
          {tableChrome ? (
            <div className="flex w-full min-w-0 shrink-0 items-center sm:w-auto">{tableChrome}</div>
          ) : null}
          <div className="flex min-h-9 min-w-0 flex-1 flex-nowrap items-center justify-end gap-2 overflow-x-auto [scrollbar-width:thin]">
            {columnMenuButton}
            {toolbarLeading}
            {toolbar}
          </div>
        </div>
      ) : null}

      {/* TabsContent-like: gap-4 entre tabla con borde y paginación */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
        <div
          className={cn(
            "my-1 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg",
            "border border-border/50 bg-card/40 dark:bg-[#0a0a0a]",
          )}
        >
          <div className="scrollbar-surface min-h-0 flex-1 overflow-auto [scrollbar-gutter:stable]">
            <DataGridTable />
          </div>
        </div>

        <div className="shrink-0">
          <DataGridPagination
            variant="data-table"
            showSelectionSummary={enableRowSelection}
            selectionSummary="{selected} de {total} fila(s) seleccionada(s)."
            pageLabel="Página {page} de {pages}"
            rowsPerPageLabel="Filas por página"
            sizes={[10, 25, 50, 100]}
            className="border-0 bg-transparent px-0 py-1 sm:py-2"
          />
        </div>
      </div>
    </DataGrid>
  );
}
