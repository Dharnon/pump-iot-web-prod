"use client";

import type { ComponentType } from "react";

import { cn } from "@/lib/utils";

export function WorkspaceMetricCard({
  title,
  value,
  description,
  icon: Icon,
  selected,
  onClick,
}: {
  title: string;
  value: number;
  description?: string;
  icon: ComponentType<{ className?: string }>;
  /** Borde de selección (misma vista que pestaña / filtro activo) */
  selected?: boolean;
  onClick?: () => void;
}) {
  const shellClass = cn(
    "w-full rounded-xl border px-4 py-3.5 text-left transition-[border-color,box-shadow,background-color] outline-none",
    "bg-muted/28",
    selected
      ? "border-primary ring-2 ring-primary/25"
      : "border-border/60",
    onClick &&
      "cursor-pointer hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  );

  const body = (
    <>
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
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={shellClass}>
        {body}
      </button>
    );
  }

  return <div className={shellClass}>{body}</div>;
}
