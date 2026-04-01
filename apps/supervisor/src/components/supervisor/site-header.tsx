"use client";

import * as React from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export type SupervisorBreadcrumb = {
  label: string;
  href?: string;
};

export interface SupervisorSiteHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: SupervisorBreadcrumb[];
  actions?: ReactNode;
  className?: string;
}

export function SupervisorSiteHeader({
  title,
  description,
  breadcrumbs = [],
  actions,
  className,
}: SupervisorSiteHeaderProps) {
  return (
    <header
      className={cn(
        "flex shrink-0 items-center gap-2 border-b border-border/70 bg-background/80 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/70 md:px-6",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-1 h-4" />
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <span>Flowserve</span>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={`${crumb.label}-${index}`}>
                <ChevronRight className="size-3" />
                {crumb.href ? (
                  <Button
                    asChild
                    variant="foreground"
                    mode="link"
                    className="h-auto p-0 text-[10px] font-medium uppercase tracking-[0.18em]"
                  >
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </Button>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-foreground md:text-lg">
              {title}
            </h1>
            {description ? (
              <p className="truncate text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}
