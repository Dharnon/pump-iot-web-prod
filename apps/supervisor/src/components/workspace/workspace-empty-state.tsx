"use client";

import type { ComponentType, ReactNode } from "react";

export function WorkspaceEmptyState({
  icon: Icon,
  title,
  description,
  actions,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-[18px] border border-border/50 bg-background/70 px-6 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-border/70 bg-muted/40">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
      {actions ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
