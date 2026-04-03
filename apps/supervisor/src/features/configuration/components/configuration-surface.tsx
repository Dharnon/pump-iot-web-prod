"use client";

import type { ReactNode } from "react";

export function ConfigurationSurface({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <section className="min-h-[calc(100vh-13rem)] flex flex-1 flex-col gap-4 rounded-xl border border-border/60 bg-card/50 p-4 md:min-h-min md:p-5">
      {children}
    </section>
  );
}
