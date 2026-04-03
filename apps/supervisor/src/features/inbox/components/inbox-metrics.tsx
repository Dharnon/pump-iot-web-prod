"use client";

import {
  ActivityIcon,
  CheckCircle2Icon,
  FileCheckIcon,
  FolderClockIcon,
  WarehouseIcon,
} from "lucide-react";

import { WorkspaceMetricCard } from "@/components/workspace/workspace-metric-card";

export function InboxMetrics({
  pendingCount,
  generatedCount,
  enBancoCount,
  activeCount,
  completedCount,
}: {
  pendingCount: number;
  generatedCount: number;
  enBancoCount: number;
  activeCount: number;
  completedCount: number;
}) {
  return (
    <div className="grid auto-rows-min gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
      <WorkspaceMetricCard
        title="Pendientes"
        value={pendingCount}
        icon={FolderClockIcon}
      />
      <WorkspaceMetricCard
        title="Protocolos generados"
        value={generatedCount}
        icon={FileCheckIcon}
      />
      <WorkspaceMetricCard
        title="En banco"
        value={enBancoCount}
        icon={WarehouseIcon}
      />
      <WorkspaceMetricCard
        title="Trabajo activo"
        value={activeCount}
        icon={ActivityIcon}
      />
      <WorkspaceMetricCard
        title="Completados"
        value={completedCount}
        icon={CheckCircle2Icon}
      />
    </div>
  );
}
