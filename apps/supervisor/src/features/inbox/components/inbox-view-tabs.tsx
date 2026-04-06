"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { InboxViewMode } from "@/features/inbox/lib/inbox-selectors";

export function InboxViewTabs({
  viewMode,
  onViewModeChange,
}: {
  viewMode: InboxViewMode;
  onViewModeChange: (value: InboxViewMode) => void;
}) {
  return (
    <Tabs
      value={viewMode}
      onValueChange={(value) => onViewModeChange(value as InboxViewMode)}
      className="w-full sm:w-auto"
    >
      <TabsList className="flex h-auto min-h-9 w-full flex-wrap justify-start gap-1 sm:h-9 sm:w-auto sm:flex-nowrap">
        <TabsTrigger value="pending">Pendientes</TabsTrigger>
        <TabsTrigger value="protocols">Protocolos</TabsTrigger>
        <TabsTrigger value="en_banco">En banco</TabsTrigger>
        <TabsTrigger value="completed">Completados</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
