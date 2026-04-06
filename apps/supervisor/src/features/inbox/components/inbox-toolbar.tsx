"use client";

import { PlusIcon, SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  InboxStatusFilter,
  InboxViewMode,
} from "@/features/inbox/lib/inbox-selectors";

import { InboxImportAction } from "./inbox-import-action";

/** Filtro de estado (primer hijo de la barra con scroll; va antes del bloque búsqueda + acciones). */
export function InboxStatusFilterSelect({
  viewMode,
  statusFilter,
  onStatusFilterChange,
  t,
}: {
  viewMode: InboxViewMode;
  statusFilter: InboxStatusFilter;
  onStatusFilterChange: (value: InboxStatusFilter) => void;
  t: (key: string) => string;
}) {
  const show =
    viewMode === "pending" || viewMode === "protocols";
  if (!show) return null;

  return (
    <Select value={statusFilter} onValueChange={onStatusFilterChange}>
      <SelectTrigger className="h-9 w-full min-w-0 sm:w-[11rem] sm:shrink-0">
        <SelectValue placeholder={t("table.filter")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t("status.all")}</SelectItem>
        {viewMode === "pending" ? (
          <SelectItem value="PENDING">{t("status.PENDING")}</SelectItem>
        ) : (
          <>
            <SelectItem value="GENERATED">{t("status.GENERATED")}</SelectItem>
            <SelectItem value="EN_BANCO">En banco</SelectItem>
            <SelectItem value="IN_PROGRESS">{t("status.IN_PROGRESS")}</SelectItem>
            <SelectItem value="COMPLETED">{t("status.COMPLETED")}</SelectItem>
          </>
        )}
      </SelectContent>
    </Select>
  );
}

/** Búsqueda, nueva prueba e importar (misma fila que pestañas; el Select de estado va fuera, en el slot superior). */
export function InboxToolbar({
  viewMode,
  globalFilter,
  onGlobalFilterChange,
  creating,
  onCreateBlank,
  onImportSuccess,
  t,
}: {
  viewMode: InboxViewMode;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  creating: boolean;
  onCreateBlank: () => void;
  onImportSuccess: () => void;
  t: (key: string) => string;
}) {
  return (
    <div className="flex w-full min-w-0 flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
      <div className="relative min-w-0 w-full sm:min-w-[12rem] sm:flex-1 sm:max-w-md">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={globalFilter}
          onChange={(event) => onGlobalFilterChange(event.target.value)}
          placeholder={t("table.search")}
          className="h-9 w-full min-w-0 pl-9 shadow-none focus-visible:border-white"
        />
      </div>

      {viewMode === "pending" ? (
        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-9 shrink-0"
            onClick={onCreateBlank}
            disabled={creating}
          >
            <PlusIcon className="size-4" />
            Nueva prueba
          </Button>
          <div className="flex shrink-0 items-center">
            <InboxImportAction onImportSuccess={onImportSuccess} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
