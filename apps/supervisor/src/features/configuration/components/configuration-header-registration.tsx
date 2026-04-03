"use client";

import { useMemo } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useSupervisorPageHeader } from "@/components/supervisor/supervisor-page-header-context";
import type { ConfigurationTab } from "./configuration-toolbar";

export function ConfigurationHeaderRegistration({
  activeTab,
}: {
  activeTab: ConfigurationTab;
}) {
  const header = useMemo(
    () => ({
      density: "compact" as const,
      center: (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Configuracion
              </span>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {activeTab === "bancos" ? "Bancos" : "Motores"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      ),
    }),
    [activeTab],
  );

  useSupervisorPageHeader(header);

  return null;
}
