"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function WorkspacePage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "scrollbar-surface flex h-full min-h-0 flex-col gap-4 overflow-auto bg-[var(--supervisor-page-background)] px-4 py-1 my-[5px]",
        className,
      )}
    >
      {children}
    </div>
  );
}
