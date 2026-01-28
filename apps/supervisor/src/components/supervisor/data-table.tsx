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
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const table = useReactTable({
        data,
        columns,
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
                rowBorder: true,
                cellBorder: false,
                stripped: false,
                width: 'auto',
            }}
            className="flex-1 w-full"
        >
            <div className="w-full space-y-2.5">
                <DataGridContainer className="overflow-hidden">
                    <ScrollArea className="max-h-[calc(100vh-360px)] border-none">
                        <DataGridTable />
                        <ScrollBar orientation="horizontal" />
                        <ScrollBar orientation="vertical" />
                    </ScrollArea>
                </DataGridContainer>

                <DataGridPagination
                    info="{from} - {to} de {count}"
                    rowsPerPageLabel="Filas por página"
                />
            </div>
        </DataGrid>
    );
}
