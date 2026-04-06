"use client";

import { Plus, Search } from "lucide-react";

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
}: {
  activeTab: ConfigurationTab;
  onActiveTabChange: (value: ConfigurationTab) => void;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  onCreate: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border/50 pb-4">
      <Tabs
        value={activeTab}
        onValueChange={(value) => onActiveTabChange(value as ConfigurationTab)}
        className="w-full lg:w-auto"
      >
        <TabsList className="h-9 w-full min-w-0 flex-wrap justify-start gap-1 border border-border bg-secondary shadow-sm sm:w-auto sm:flex-nowrap">
          <TabsTrigger
            value="bancos"
            className="data-[state=inactive]:bg-secondary data-[state=active]:bg-background data-[state=active]:shadow-sm dark:data-[state=inactive]:bg-secondary dark:data-[state=active]:bg-background"
          >
            Bancos
          </TabsTrigger>
          <TabsTrigger
            value="motores"
            className="data-[state=inactive]:bg-secondary data-[state=active]:bg-background data-[state=active]:shadow-sm dark:data-[state=inactive]:bg-secondary dark:data-[state=active]:bg-background"
          >
            Motores
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
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
  );
}
