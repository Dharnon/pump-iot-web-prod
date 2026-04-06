"use client";

import { Plus, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type ConfigurationTab = "bancos" | "motores";

export function ConfigurationToolbar({
  activeTab,
  onActiveTabChange,
  searchValue,
  onSearchValueChange,
  onCreate,
  banksCount,
  motorsCount,
  banksWithMotorCount,
  banksInactiveCount,
  t,
}: {
  activeTab: ConfigurationTab;
  onActiveTabChange: (value: ConfigurationTab) => void;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  onCreate: () => void;
  banksCount: number;
  motorsCount: number;
  banksWithMotorCount: number;
  banksInactiveCount: number;
  t: (key: string) => string;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border/50 pb-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            Workspace de configuracion
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Bancos queda como vista principal y motores como catalogo de soporte
            para asignaciones y mantenimiento.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 xl:w-auto xl:min-w-[34rem]">
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div className="relative min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(event) => onSearchValueChange(event.target.value)}
                placeholder={
                  activeTab === "bancos"
                    ? "Buscar banco o motor asignado"
                    : "Buscar plantilla, marca o tipo"
                }
                className="pl-9"
              />
            </div>

            <Button onClick={onCreate}>
              <Plus className="mr-2 h-4 w-4" />
              {activeTab === "bancos" ? "Nuevo banco" : "Nuevo motor"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          value={activeTab}
          onValueChange={(value) => onActiveTabChange(value as ConfigurationTab)}
          className="w-full lg:w-auto"
        >
          <TabsList className="h-9 w-full min-w-0 flex-wrap justify-start gap-1 border border-border bg-secondary shadow-sm sm:w-auto sm:flex-nowrap">
            <TabsTrigger
              value="bancos"
              className="gap-1.5 data-[state=inactive]:bg-secondary data-[state=active]:bg-background data-[state=active]:shadow-sm dark:data-[state=inactive]:bg-secondary dark:data-[state=active]:bg-background"
            >
              Bancos
              <Badge variant="secondary" className="font-normal tabular-nums">
                {banksCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="motores"
              className="gap-1.5 data-[state=inactive]:bg-secondary data-[state=active]:bg-background data-[state=active]:shadow-sm dark:data-[state=inactive]:bg-secondary dark:data-[state=active]:bg-background"
            >
              Motores
              <Badge variant="secondary" className="font-normal tabular-nums">
                {motorsCount}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <p className="text-xs text-muted-foreground lg:text-right">
          {activeTab === "bancos"
            ? `${banksWithMotorCount} bancos vinculados a motor y ${banksInactiveCount} inactivos.`
            : "Catalogo de plantillas reutilizable para asignar y mantener motores."}
        </p>
      </div>
    </div>
  );
}
