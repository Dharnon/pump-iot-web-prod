import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveFieldFlowProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveFieldFlow({
  children,
  className,
}: ResponsiveFieldFlowProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start gap-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
