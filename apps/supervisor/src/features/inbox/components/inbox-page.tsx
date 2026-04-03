"use client";

import { Loader2 } from "lucide-react";

import { WorkspacePage } from "@/components/workspace/workspace-page";
import { WorkspaceSurface } from "@/components/workspace/workspace-surface";
import { useLanguage } from "@/lib/language-context";

import { useInboxActions } from "../hooks/use-inbox-actions";
import { useInboxColumns } from "../hooks/use-inbox-columns";
import { useInboxData } from "../hooks/use-inbox-data";
import { useInboxWorkspaceState } from "../hooks/use-inbox-workspace-state";
import type { InboxStatusFilter, InboxViewMode } from "../lib/inbox-selectors";
import { InboxEmptyState } from "./inbox-empty-state";
import { InboxHeaderRegistration } from "./inbox-header-registration";
import { InboxMetrics } from "./inbox-metrics";
import { InboxTable } from "./inbox-table";
import {
  InboxStatusFilterSelect,
  InboxToolbar,
} from "./inbox-toolbar";
import { InboxViewTabs } from "./inbox-view-tabs";

function InboxTopBar({
  viewMode,
  onViewModeChange,
  pendingCount,
  generatedCount,
  enBancoCount,
  completedCount,
  statusFilter,
  onStatusFilterChange,
  globalFilter,
  onGlobalFilterChange,
  creating,
  onCreateBlank,
  onImportSuccess,
  t,
}: {
  viewMode: InboxViewMode;
  onViewModeChange: (value: InboxViewMode) => void;
  pendingCount: number;
  generatedCount: number;
  enBancoCount: number;
  completedCount: number;
  statusFilter: InboxStatusFilter;
  onStatusFilterChange: (value: InboxStatusFilter) => void;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  creating: boolean;
  onCreateBlank: () => void;
  onImportSuccess: () => void;
  t: (key: string) => string;
}) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-3 py-1 sm:flex-row sm:items-center sm:justify-start sm:gap-4">
      <div className="flex w-full shrink-0 items-center sm:w-auto">
        <InboxViewTabs
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          pendingCount={pendingCount}
          generatedCount={generatedCount}
          enBancoCount={enBancoCount}
          completedCount={completedCount}
        />
      </div>
      <div className="flex min-h-9 min-w-0 flex-1 flex-nowrap items-center justify-end gap-2 overflow-x-auto [scrollbar-width:thin]">
        <InboxStatusFilterSelect
          viewMode={viewMode}
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
          t={t}
        />
        <InboxToolbar
          viewMode={viewMode}
          globalFilter={globalFilter}
          onGlobalFilterChange={onGlobalFilterChange}
          creating={creating}
          onCreateBlank={onCreateBlank}
          onImportSuccess={onImportSuccess}
          t={t}
        />
      </div>
    </div>
  );
}

export function InboxPage() {
  const { t } = useLanguage();
  const workspace = useInboxWorkspaceState();
  const inboxData = useInboxData(workspace.viewMode, workspace.statusFilter);
  const actions = useInboxActions({
    mutate: inboxData.mutate,
    locks: inboxData.locks,
  });
  const columns = useInboxColumns({
    t,
    onDelete: actions.handleDelete,
    locks: inboxData.locks,
  });

  return (
    <WorkspacePage>
      <InboxHeaderRegistration
        viewMode={workspace.viewMode}
        isConnected={inboxData.isConnected}
        isLoading={inboxData.isLoading}
        isValidating={inboxData.isValidating}
        onRefresh={actions.handleRefresh}
        t={t}
      />

      <InboxMetrics
        pendingCount={inboxData.pendingTests.length}
        generatedCount={inboxData.generatedTestsOnly.length}
        enBancoCount={inboxData.enBancoCount}
        activeCount={inboxData.inProgressTests.length}
        completedCount={inboxData.completedCount}
      />

      <WorkspaceSurface className="min-h-0 flex-1 flex-col gap-3">
        {inboxData.isLoading && !inboxData.tests.length ? (
          <div className="flex min-h-[min(40vh,320px)] flex-1 flex-col gap-3">
            <InboxTopBar
              viewMode={workspace.viewMode}
              onViewModeChange={workspace.setViewMode}
              pendingCount={inboxData.pendingTests.length}
              generatedCount={inboxData.generatedTests.length}
              enBancoCount={inboxData.enBancoCount}
              completedCount={inboxData.completedCount}
              statusFilter={workspace.statusFilter}
              onStatusFilterChange={workspace.setStatusFilter}
              globalFilter={workspace.globalFilter}
              onGlobalFilterChange={workspace.setGlobalFilter}
              creating={actions.creating}
              onCreateBlank={actions.handleCreateBlank}
              onImportSuccess={actions.handleRefresh}
              t={t}
            />
            <div className="flex flex-1 items-center justify-center rounded-lg border border-border bg-background/50">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          </div>
        ) : inboxData.filteredData.length === 0 ? (
          <div className="flex min-h-[min(40vh,320px)] flex-1 flex-col gap-3">
            <InboxTopBar
              viewMode={workspace.viewMode}
              onViewModeChange={workspace.setViewMode}
              pendingCount={inboxData.pendingTests.length}
              generatedCount={inboxData.generatedTests.length}
              enBancoCount={inboxData.enBancoCount}
              completedCount={inboxData.completedCount}
              statusFilter={workspace.statusFilter}
              onStatusFilterChange={workspace.setStatusFilter}
              globalFilter={workspace.globalFilter}
              onGlobalFilterChange={workspace.setGlobalFilter}
              creating={actions.creating}
              onCreateBlank={actions.handleCreateBlank}
              onImportSuccess={actions.handleRefresh}
              t={t}
            />
            <InboxEmptyState
              viewMode={workspace.viewMode}
              creating={actions.creating}
              onCreateBlank={actions.handleCreateBlank}
              onImportSuccess={actions.handleRefresh}
            />
          </div>
        ) : (
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <InboxTable
              key={workspace.viewMode}
              viewMode={workspace.viewMode}
              onViewModeChange={workspace.setViewMode}
              pendingCount={inboxData.pendingTests.length}
              generatedCount={inboxData.generatedTests.length}
              enBancoCount={inboxData.enBancoCount}
              completedCount={inboxData.completedCount}
              statusFilter={workspace.statusFilter}
              onStatusFilterChange={workspace.setStatusFilter}
              globalFilter={workspace.globalFilter}
              onGlobalFilterChange={workspace.setGlobalFilter}
              creating={actions.creating}
              onCreateBlank={actions.handleCreateBlank}
              onImportSuccess={actions.handleRefresh}
              t={t}
              columns={
                workspace.viewMode === "pending"
                  ? columns.pendingColumns
                  : columns.protocolColumns
              }
              data={inboxData.filteredData}
              loading={inboxData.isLoading}
              onRowClick={actions.handleRowClick}
            />
          </div>
        )}
      </WorkspaceSurface>
    </WorkspacePage>
  );
}
