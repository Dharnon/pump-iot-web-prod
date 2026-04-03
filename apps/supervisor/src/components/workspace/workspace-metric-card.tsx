"use client";

import type { ComponentType } from "react";

export function WorkspaceMetricCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: number;
  description?: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/28 px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {title}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background/70">
          <Icon className="size-4 text-primary" />
        </div>
      </div>
      {description ? (
        <p className="mt-2 line-clamp-2 max-w-[18rem] text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}
