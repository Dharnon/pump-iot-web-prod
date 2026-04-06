"use client";

import {
  ActivityIcon,
  CheckCircle2Icon,
  FileCheckIcon,
  FolderClockIcon,
  WarehouseIcon,
} from "lucide-react";

import { WorkspaceMetricCard } from "@/components/workspace/workspace-metric-card";
import {
  isInboxMetricSelected,
  type InboxMetricId,
  type InboxStatusFilter,
  type InboxViewMode,
} from "@/features/inbox/lib/inbox-selectors";

export function InboxMetrics({
  pendingCount,
  generatedCount,
  enBancoCount,
  activeCount,
  completedCount,
  viewMode,
  statusFilter,
  onMetricSelect,
}: {
  pendingCount: number;
  generatedCount: number;
  enBancoCount: number;
  activeCount: number;
  completedCount: number;
  viewMode: InboxViewMode;
  statusFilter: InboxStatusFilter;
  onMetricSelect: (id: InboxMetricId) => void;
}) {
  return (
    <div className="grid auto-rows-min gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
      <WorkspaceMetricCard
        title="Pendientes"
        value={pendingCount}
        icon={FolderClockIcon}
        selected={isInboxMetricSelected("pending", viewMode, statusFilter)}
        onClick={() => onMetricSelect("pending")}
      />
      <WorkspaceMetricCard
        title="Protocolos generados"
        value={generatedCount}
        icon={FileCheckIcon}
        selected={isInboxMetricSelected(
          "protocols_generated",
          viewMode,
          statusFilter,
        )}
        onClick={() => onMetricSelect("protocols_generated")}
      />
      <WorkspaceMetricCard
        title="En banco"
        value={enBancoCount}
        icon={WarehouseIcon}
        selected={isInboxMetricSelected("en_banco", viewMode, statusFilter)}
        onClick={() => onMetricSelect("en_banco")}
      />
      <WorkspaceMetricCard
        title="Trabajo activo"
        value={activeCount}
        icon={ActivityIcon}
        selected={isInboxMetricSelected("active", viewMode, statusFilter)}
        onClick={() => onMetricSelect("active")}
      />
      <WorkspaceMetricCard
        title="Completados"
        value={completedCount}
        icon={CheckCircle2Icon}
        selected={isInboxMetricSelected("completed", viewMode, statusFilter)}
        onClick={() => onMetricSelect("completed")}
      />
    </div>
  );
}
