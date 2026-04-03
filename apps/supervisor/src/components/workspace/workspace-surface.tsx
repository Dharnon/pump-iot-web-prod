"use client";

import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

/**
 * Contenedor de contenido: flujo y espacio, sin segundo “card”
 * alrededor de la tabla (el borde va en WorkspaceTable).
 */
export function WorkspaceSurface({
  className,
  ...props
}: ComponentPropsWithoutRef<"section">) {
  return (
    <section
      className={cn("flex min-h-0 min-w-0 flex-1 flex-col gap-4", className)}
      {...props}
    />
  );
}
