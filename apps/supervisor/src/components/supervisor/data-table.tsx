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

import { DataGrid } from "@/components/ui/data-grid";
import { DataGridPagination } from "@/components/ui/data-grid-pagination";
import { DataGridTable } from "@/components/ui/data-grid-table";
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
        headerSticky:
          "sticky top-0 z-10 bg-[#f4f4f5] supports-[backdrop-filter]:bg-[#f4f4f5]/95 dark:bg-[#232323] dark:supports-[backdrop-filter]:bg-[#232323]/95",
        headerRow: "bg-transparent",
        headerCell:
          "h-10 px-3 text-xs font-semibold normal-case tracking-normal text-foreground/88",
        body: "bg-background",
      }}
      className="flex w-full min-h-0 flex-1 flex-col"
    >
      <div
        className={cn(
          "flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-lg",
          "border-[0.5px] border-[#161718] bg-background shadow-none",
        )}
      >
        <div className="min-h-0 flex-1 overflow-auto">
          <DataGridTable />
        </div>

        <DataGridPagination
          variant="data-table"
          showSelectionSummary={false}
          info="{from} - {to} de {count}"
          rowsPerPageLabel="Filas por página"
          pageLabel="Página {page} de {pages}"
          className="rounded-none border-x-0 border-b-0 border-t-[0.5px] border-[#161718] bg-transparent"
        />
      </div>
    </DataGrid>
  );
}
