"use client";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { InboxViewMode } from "@/features/inbox/lib/inbox-selectors";

export function InboxViewTabs({
  viewMode,
  onViewModeChange,
  pendingCount,
  generatedCount,
  enBancoCount,
  completedCount,
}: {
  viewMode: InboxViewMode;
  onViewModeChange: (value: InboxViewMode) => void;
  pendingCount: number;
  generatedCount: number;
  enBancoCount: number;
  completedCount: number;
}) {
  return (
    <Tabs
      value={viewMode}
      onValueChange={(value) => onViewModeChange(value as InboxViewMode)}
      className="w-full sm:w-auto"
    >
      <TabsList className="flex h-auto min-h-9 w-full flex-wrap justify-start gap-1 sm:h-9 sm:w-auto sm:flex-nowrap">
        <TabsTrigger value="pending" className="gap-1.5">
          Pendientes
          <Badge
            variant="secondary"
            className="h-5 min-w-5 rounded-full px-1.5 text-[10px] font-normal tabular-nums"
          >
            {pendingCount}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="protocols" className="gap-1.5">
          Protocolos
          <Badge
            variant="secondary"
            className="h-5 min-w-5 rounded-full px-1.5 text-[10px] font-normal tabular-nums"
          >
            {generatedCount}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="en_banco" className="gap-1.5">
          En banco
          <Badge
            variant="secondary"
            className="h-5 min-w-5 rounded-full px-1.5 text-[10px] font-normal tabular-nums"
          >
            {enBancoCount}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="completed" className="gap-1.5">
          Completados
          <Badge
            variant="secondary"
            className="h-5 min-w-5 rounded-full px-1.5 text-[10px] font-normal tabular-nums"
          >
            {completedCount}
          </Badge>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
