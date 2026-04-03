"use client";

import type { ReactNode } from "react";
import { ArrowLeft, ChevronRight, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import type { UseLanguageReturn } from "@/lib/language-context";

interface TestDetailHeaderSharedProps {
  test: {
    status: string;
    generalInfo: {
      pedido: string;
      cliente: string;
    };
  };
  onBack: () => void;
  onTogglePreview: () => void;
  previewOpen: boolean;
  breadcrumbLabel: string;
  t: UseLanguageReturn["t"];
  actions?: ReactNode;
}

/** Contenido central del toolbar (volver + migas); el trigger va en SupervisorPageHeader */
export function TestDetailHeaderCenter({
  test,
  onBack,
  breadcrumbLabel,
  t,
}: Pick<
  TestDetailHeaderSharedProps,
  "test" | "onBack" | "breadcrumbLabel" | "t"
>) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        className="size-7 shrink-0 rounded-lg text-muted-foreground hover:bg-accent/70 hover:text-foreground"
        onClick={onBack}
      >
        <ArrowLeft className="size-3.5" />
      </Button>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
          <span className="leading-none">{t(breadcrumbLabel)}</span>
          <ChevronRight className="size-3 opacity-40" />
          <span className="truncate leading-none text-foreground/80">
            {test.generalInfo.pedido}
          </span>
        </div>
      </div>
    </div>
  );
}

export function TestDetailHeaderEnd({
  test,
  onTogglePreview,
  previewOpen,
  actions,
}: Pick<
  TestDetailHeaderSharedProps,
  "test" | "onTogglePreview" | "previewOpen" | "actions"
>) {
  return (
    <>
      <StatusBadge status={test.status} />
      <Button
        variant="outline"
        size="sm"
        onClick={onTogglePreview}
        className="h-8 rounded-xl border-border/70 bg-card/35 px-4 text-sm text-foreground shadow-sm hover:bg-accent/60"
      >
        {previewOpen ? (
          <EyeOff className="size-4" />
        ) : (
          <Eye className="size-4" />
        )}
        {previewOpen ? "Ocultar fuente" : "Ver fuente"}
      </Button>
      {actions}
    </>
  );
}
