import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveFieldGridProps {
  children: ReactNode;
  className?: string;
  minItemWidth?: number;
  compactMinItemWidth?: number;
  denseMinItemWidth?: number;
  gapClassName?: string;
  /**
   * `auto-fit`: columnas según min-width (comportamiento por defecto).
   * `container-2col`: 1 columna estrecha; 2 columnas cuando el contenedor (p. ej. columna con PDF abierto) mide ~22rem+.
   */
  layout?: "auto-fit" | "container-2col";
}

export function ResponsiveFieldGrid({
  children,
  className,
  minItemWidth = 160,
  compactMinItemWidth,
  denseMinItemWidth,
  gapClassName = "gap-2.5",
  layout = "auto-fit",
}: ResponsiveFieldGridProps) {
  if (layout === "container-2col") {
    return (
      <div className="@container min-w-0 w-full">
        <div
          className={cn(
            "grid grid-cols-1 items-start @min-[22rem]:grid-cols-2",
            gapClassName,
            className,
          )}
        >
          {children}
        </div>
      </div>
    );
  }

  const style = {
    gridTemplateColumns: `repeat(auto-fit, minmax(min(${denseMinItemWidth ?? compactMinItemWidth ?? minItemWidth}px, 100%), 1fr))`,
  } satisfies CSSProperties;

  return (
    <div
      className={cn("grid items-start", gapClassName, className)}
      style={style}
    >
      {children}
    </div>
  );
}
