"use client";

import { useMemo } from "react";
import { RefreshCw } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { useSupervisorPageHeader } from "@/components/supervisor/supervisor-page-header-context";
import type { InboxViewMode } from "@/features/inbox/lib/inbox-selectors";
import { cn } from "@/lib/utils";

const INBOX_SECTION_LABEL: Record<InboxViewMode, string> = {
  pending: "Pendientes",
  protocols: "Protocolos",
  en_banco: "En banco",
  completed: "Completados",
};

export function InboxHeaderRegistration({
  viewMode,
  isConnected,
  isLoading,
  isValidating,
  onRefresh,
  t,
}: {
  viewMode: InboxViewMode;
  isConnected: boolean;
  isLoading: boolean;
  isValidating: boolean;
  onRefresh: () => void;
  t: (key: string) => string;
}) {
  const header = useMemo(
    () => ({
      density: "compact" as const,
      center: (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Supervisor</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{INBOX_SECTION_LABEL[viewMode]}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      ),
      end: (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading || isValidating}
          aria-label={t("table.refresh")}
          className={cn(
            "h-8 gap-1.5 rounded-lg border-border/70 bg-card/50 px-2.5 text-xs font-medium",
            "shadow-none hover:bg-accent/60",
            "disabled:opacity-60",
          )}
        >
          <span
            className={cn(
              "size-1.5 shrink-0 rounded-full ring-2 ring-background",
              isConnected ? "bg-emerald-500" : "bg-rose-500",
            )}
            aria-hidden
          />
          <RefreshCw
            className={cn("size-3.5 shrink-0", isValidating && "animate-spin")}
            aria-hidden
          />
          <span>{t("table.refresh")}</span>
        </Button>
      ),
    }),
    [isConnected, isLoading, isValidating, onRefresh, t, viewMode],
  );

  useSupervisorPageHeader(header);

  return null;
}
