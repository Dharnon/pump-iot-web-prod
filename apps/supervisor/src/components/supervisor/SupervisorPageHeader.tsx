"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

import { useSupervisorPageHeaderContext } from "./supervisor-page-header-context";

export function SupervisorPageHeader() {
  const slots = useSupervisorPageHeaderContext();

  if (!slots) {
    return null;
  }

  const density = slots.density ?? "compact";

  return (
    <header className="shrink-0 border-b border-border/80 bg-[var(--supervisor-page-background)]/95 backdrop-blur-sm">
      <div
        className={cn(
          "px-4 py-2.5 sm:py-3",
          density === "compact"
            ? "flex w-full flex-row items-center justify-between gap-3"
            : "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3",
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <SidebarTrigger className="-ml-1 shrink-0" />
          <Separator orientation="vertical" className="h-4 shrink-0" />
          <div className="min-w-0 flex-1">{slots.center}</div>
        </div>
        {slots.end ? (
          <div
            className={cn(
              "flex flex-wrap items-center gap-2",
              density === "compact"
                ? "shrink-0 justify-end"
                : "justify-end sm:shrink-0",
            )}
          >
            {slots.end}
          </div>
        ) : null}
      </div>
    </header>
  );
}
