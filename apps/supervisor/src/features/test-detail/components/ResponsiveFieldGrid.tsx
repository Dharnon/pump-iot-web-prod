import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveFieldGridProps {
  children: ReactNode;
  className?: string;
  minItemWidth?: number;
  compactMinItemWidth?: number;
  denseMinItemWidth?: number;
  gapClassName?: string;
}

export function ResponsiveFieldGrid({
  children,
  className,
  minItemWidth = 160,
  compactMinItemWidth,
  denseMinItemWidth,
  gapClassName = "gap-2.5",
}: ResponsiveFieldGridProps) {
  const style = {
    gridTemplateColumns: `repeat(auto-fit, minmax(min(${denseMinItemWidth ?? compactMinItemWidth ?? minItemWidth}px, 100%), 1fr))`,
  } satisfies CSSProperties;

  return (
    <div
      className={cn(
        "grid items-start max-[2048px]:gap-1.5 max-[1600px]:gap-1",
        gapClassName,
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}
