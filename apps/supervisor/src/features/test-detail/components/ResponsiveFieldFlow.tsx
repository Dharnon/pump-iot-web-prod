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
        "flex flex-wrap items-start gap-3 max-[2048px]:gap-1.5 max-[1600px]:gap-1",
        className,
      )}
    >
      {children}
    </div>
  );
}
