"use client";

import {
  ActivityIcon,
  FileCheckIcon,
  FolderClockIcon,
} from "lucide-react";

import { WorkspaceMetricCard } from "@/components/workspace/workspace-metric-card";

export function InboxMetrics({
  pendingCount,
  generatedCount,
  activeCount,
}: {
  pendingCount: number;
  generatedCount: number;
  activeCount: number;
}) {
  return (
    <div className="grid auto-rows-min gap-3 md:grid-cols-3">
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
        title="Trabajo activo"
        value={activeCount}
        icon={ActivityIcon}
      />
    </div>
  );
}
