import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface DetailSectionCardProps {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}

export function DetailSectionCard({
  title,
  icon,
  action,
  className,
  contentClassName,
  children,
}: DetailSectionCardProps) {
  return (
    <section
      className={cn(
        "flex min-h-0 flex-col rounded-xl border border-border/80 bg-background px-4 py-4 shadow-sm dark:bg-card/70 md:px-5",
        className,
      )}
    >
      <div className="mb-4 flex shrink-0 items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {icon ? <span className="text-muted-foreground">{icon}</span> : null}
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground dark:text-foreground/90">
            {title}
          </h3>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className={cn("min-h-0 flex-1 space-y-3", contentClassName)}>
        {children}
      </div>
    </section>
  );
}
