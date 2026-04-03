import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface DetailSectionGridProps {
  left: ReactNode;
  right: ReactNode;
  className?: string;
}

export function DetailSectionGrid({
  left,
  right,
  className,
}: DetailSectionGridProps) {
  return (
    <div className={cn("grid gap-4 xl:grid-cols-2", className)}>
      <div className="space-y-4">{left}</div>
      <div className="space-y-4">{right}</div>
    </div>
  );
}
