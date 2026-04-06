"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { WorkspaceTable } from "@/components/workspace/workspace-table";
import type {
  InboxStatusFilter,
  InboxViewMode,
} from "@/features/inbox/lib/inbox-selectors";

import {
  InboxStatusFilterSelect,
  InboxToolbar,
} from "./inbox-toolbar";
import { InboxViewTabs } from "./inbox-view-tabs";

export function InboxTable<TData extends object, TValue>({
  columns,
  data,
  loading,
  globalFilter,
  onRowClick,
  viewMode,
  onViewModeChange,
  statusFilter,
  onStatusFilterChange,
  onGlobalFilterChange,
  creating,
  onCreateBlank,
  onImportSuccess,
  t,
}: {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading: boolean;
  globalFilter: string;
  onRowClick: (row: TData) => void;
  viewMode: InboxViewMode;
  onViewModeChange: (value: InboxViewMode) => void;
  statusFilter: InboxStatusFilter;
  onStatusFilterChange: (value: InboxStatusFilter) => void;
  onGlobalFilterChange: (value: string) => void;
  creating: boolean;
  onCreateBlank: () => void;
  onImportSuccess: () => void;
  t: (key: string) => string;
}) {
  const tableChrome = (
    <InboxViewTabs
      viewMode={viewMode}
      onViewModeChange={onViewModeChange}
    />
  );

  const toolbarLeading = (
    <InboxStatusFilterSelect
      viewMode={viewMode}
      statusFilter={statusFilter}
      onStatusFilterChange={onStatusFilterChange}
      t={t}
    />
  );

  const toolbar = (
    <InboxToolbar
      viewMode={viewMode}
      globalFilter={globalFilter}
      onGlobalFilterChange={onGlobalFilterChange}
      creating={creating}
      onCreateBlank={onCreateBlank}
      onImportSuccess={onImportSuccess}
      t={t}
    />
  );

  return (
    <WorkspaceTable
      columns={columns}
      data={data}
      loading={loading}
      globalFilter={globalFilter}
      onRowClick={onRowClick}
      tableChrome={tableChrome}
      toolbarLeading={toolbarLeading}
      toolbar={toolbar}
      showColumnToggle={false}
    />
  );
}
