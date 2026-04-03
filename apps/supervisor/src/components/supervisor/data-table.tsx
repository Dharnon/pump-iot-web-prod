"use client";

import * as React from "react";
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DataGrid, DataGridContainer } from "@/components/ui/data-grid";
import { DataGridTable } from "@/components/ui/data-grid-table";
import { DataGridPagination } from "@/components/ui/data-grid-pagination";
import { cn } from "@/lib/utils";

interface DataTableProps<TData extends object, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  onRowClick?: (row: TData) => void;
  globalFilter?: string;
}

export function DataTable<TData extends object, TValue>({
  columns,
  data,
  loading = false,
  onRowClick,
  globalFilter,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 50,
  });

  const table = useReactTable({
    data,
    columns,
    getRowId: (originalRow, index) => {
      const rowWithId = originalRow as { id?: unknown };
      return rowWithId.id != null ? String(rowWithId.id) : String(index);
    },
    state: {
      sorting,
      columnVisibility,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

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
        dense: false,
      }}
      tableClassNames={{
        header: "",
        headerRow: "",
        headerSticky:
          "sticky top-0 z-10 bg-muted/35 backdrop-blur-sm supports-[backdrop-filter]:bg-muted/25",
        body: "bg-background/20",
      }}
      className="flex w-full min-h-0 flex-1 flex-col"
    >
      <div
        className={cn(
          "flex w-full min-h-0 flex-1 flex-col overflow-hidden rounded-xl",
          "border border-border/60 bg-card/40 shadow-sm",
        )}
      >
        <DataGridContainer border={false} className="min-h-0 overflow-hidden">
          <ScrollArea className="h-[calc(100vh-260px)]">
            <DataGridTable />
            <ScrollBar orientation="horizontal" />
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </DataGridContainer>

        <DataGridPagination
          info="{from} - {to} de {count}"
          rowsPerPageLabel="Filas por página"
          className="rounded-b-xl border-x-0 border-b-0 border-t border-border/60 bg-muted/20"
        />
      </div>
    </DataGrid>
  );
}
