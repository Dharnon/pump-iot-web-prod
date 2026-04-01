"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { HubConnectionState } from "@microsoft/signalr";
import {
  ActivityIcon,
  BoxesIcon,
  FileCheckIcon,
  FolderClockIcon,
  PlusIcon,
  RefreshCw,
  SearchIcon,
} from "lucide-react";

import { useTests } from "@/hooks/useTests";
import { useSignalR } from "@/hooks/useSignalR";
import { useLanguage } from "@/lib/language-context";
import { createListado, deleteTest } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/supervisor/data-table";
import { getColumns } from "@/components/supervisor/columns";
import { getProtocolColumns } from "@/components/supervisor/protocol-columns";

const ImportModal = dynamic(
  () => import("@/components/import-modal").then((module) => module.ImportModal),
  { ssr: false },
);

type ViewMode = "pending" | "protocols";

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [viewMode, setViewMode] = useState<ViewMode>("pending");
  const [creating, setCreating] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const { tests, isLoading, isValidating, mutate } = useTests();
  const { locks, connectionState } = useSignalR({
    onListUpdated: () => mutate(),
  });

  const isConnected = connectionState === HubConnectionState.Connected;

  useEffect(() => {
    const savedViewMode = localStorage.getItem("dashboardViewMode") as
      | ViewMode
      | null;
    const savedStatusFilter = localStorage.getItem("dashboardStatusFilter");

    if (savedViewMode) {
      setViewMode(savedViewMode);
    }

    if (savedStatusFilter) {
      setStatusFilter(savedStatusFilter);
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    localStorage.setItem("dashboardViewMode", viewMode);
    localStorage.setItem("dashboardStatusFilter", statusFilter);
  }, [isReady, statusFilter, viewMode]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (
      viewMode === "pending" &&
      statusFilter !== "PENDING" &&
      statusFilter !== "all"
    ) {
      setStatusFilter("PENDING");
    }

    if (viewMode === "protocols" && statusFilter === "PENDING") {
      setStatusFilter("all");
    }
  }, [isReady, statusFilter, viewMode]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteTest(id);
        toast.success("Registro eliminado correctamente");
        await mutate();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Error al eliminar el registro";
        toast.error(message);
      }
    },
    [mutate],
  );

  const handleCreateBlank = async () => {
    try {
      setCreating(true);
      const result = await createListado();
      toast.success("Nueva prueba manual creada");
      await mutate();
      router.push(`/supervisor/test/pending-${result.id}`);
    } catch {
      toast.error("Error al crear la prueba manual");
    } finally {
      setCreating(false);
    }
  };

  const pendingColumns = useMemo(
    () => getColumns(t, handleDelete, locks),
    [handleDelete, locks, t],
  );

  const protocolColumns = useMemo(
    () => getProtocolColumns(t, handleDelete, locks),
    [handleDelete, locks, t],
  );

  const pendingTests = useMemo(
    () => tests.filter((test: any) => test.id.startsWith("pending-")),
    [tests],
  );

  const generatedTests = useMemo(
    () => tests.filter((test: any) => !test.id.startsWith("pending-")),
    [tests],
  );

  const generatedTestsOnly = useMemo(
    () =>
      generatedTests.filter(
        (test: any) =>
          (test.status === "GENERATED" || test.status === "GENERADO") &&
          (!locks || !locks[test.id]),
      ),
    [generatedTests, locks],
  );

  const inProgressTests = useMemo(
    () =>
      generatedTests.filter(
        (test: any) => test.status === "IN_PROGRESS" || Boolean(locks?.[test.id]),
      ),
    [generatedTests, locks],
  );

  const filteredData = useMemo(() => {
    const dataSource = viewMode === "pending" ? pendingTests : generatedTests;

    if (statusFilter === "all") {
      return dataSource;
    }

    return dataSource.filter((test: any) => {
      if (statusFilter === "IN_PROGRESS") {
        return test.status === "IN_PROGRESS" || Boolean(locks?.[test.id]);
      }

      if (statusFilter === "GENERATED" || statusFilter === "GENERADO") {
        const isGenerated =
          test.status === "GENERATED" || test.status === "GENERADO";
        return isGenerated && !locks?.[test.id];
      }

      if (statusFilter === "EN_BANCO") {
        return test.status === "EN_BANCO";
      }

      return test.status === statusFilter;
    });
  }, [generatedTests, locks, pendingTests, statusFilter, viewMode]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex w-full items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/supervisor">
                    Build Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => mutate()}
            disabled={isLoading || isValidating}
            className="gap-2"
          >
            <span
              className={cn(
                "size-2 rounded-full",
                isConnected ? "bg-emerald-500" : "bg-rose-500",
              )}
            />
            <RefreshCw
              className={cn("size-4", isValidating && "animate-spin")}
            />
            Actualizar
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <ShellCard
              title="Pending queue"
              value={pendingTests.length}
              description="Listados listos para revision y preparacion."
              icon={FolderClockIcon}
            />
            <ShellCard
              title="Generated protocols"
              value={generatedTestsOnly.length}
              description="Protocolos listos para programacion o ejecucion."
              icon={FileCheckIcon}
            />
            <ShellCard
              title="Active work"
              value={inProgressTests.length}
              description="Pruebas en curso o bloqueadas por operator."
              icon={ActivityIcon}
            />
          </div>

          <section className="min-h-[calc(100vh-13rem)] flex-1 rounded-xl border border-border/60 bg-card/50 p-4 md:min-h-min md:p-5">
            <div className="flex h-full flex-col gap-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-3">
                  <div>
                    <h2 className="text-lg font-semibold">Documents</h2>
                    <p className="text-sm text-muted-foreground">
                      Shell renovado del supervisor con la tabla operativa dentro del
                      panel principal.
                    </p>
                  </div>
                  <Tabs
                    value={viewMode}
                    onValueChange={(value) => setViewMode(value as ViewMode)}
                    className="w-full"
                  >
                    <TabsList variant="line" className="flex-wrap">
                      <TabsTrigger value="pending">
                        Outline
                        <Badge variant="secondary">{pendingTests.length}</Badge>
                      </TabsTrigger>
                      <TabsTrigger value="protocols">
                        Focus Documents
                        <Badge variant="secondary">{generatedTests.length}</Badge>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="flex flex-col gap-2 xl:items-end">
                  <div className="flex flex-wrap items-center gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="min-w-44">
                        <SelectValue placeholder={t("table.filter")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("status.all")}</SelectItem>
                        {viewMode === "pending" ? (
                          <SelectItem value="PENDING">
                            {t("status.PENDING")}
                          </SelectItem>
                        ) : (
                          <>
                            <SelectItem value="GENERATED">
                              {t("status.GENERATED")}
                            </SelectItem>
                            <SelectItem value="EN_BANCO">En banco</SelectItem>
                            <SelectItem value="IN_PROGRESS">
                              {t("status.IN_PROGRESS")}
                            </SelectItem>
                            <SelectItem value="COMPLETED">
                              {t("status.COMPLETED")}
                            </SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>

                    <div className="relative min-w-[280px] flex-1 xl:min-w-[320px]">
                      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={globalFilter}
                        onChange={(event) => setGlobalFilter(event.target.value)}
                        placeholder={t("table.search")}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {viewMode === "pending" ? (
                      <Button
                        variant="outline"
                        onClick={handleCreateBlank}
                        disabled={creating}
                      >
                        <PlusIcon data-icon="inline-start" />
                        New section
                      </Button>
                    ) : null}
                    <ImportModal onImportSuccess={() => mutate()} />
                  </div>
                </div>
              </div>

              <div className="flex min-h-[520px] flex-1 flex-col rounded-xl bg-muted/35 p-1">
                {isLoading && !tests.length ? (
                  <div className="flex flex-1 items-center justify-center rounded-[18px] border border-border/50 bg-background/80">
                    <RefreshCw className="size-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredData.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center rounded-[18px] border border-border/50 bg-background/70 px-6 text-center">
                    <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-border/70 bg-muted/40">
                      <BoxesIcon className="size-5 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No hay pruebas registradas</h3>
                    <p className="mt-2 max-w-md text-sm text-muted-foreground">
                      Importa tu primer archivo o crea una prueba manual para empezar a
                      poblar este panel.
                    </p>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                      {viewMode === "pending" ? (
                        <Button
                          variant="outline"
                          onClick={handleCreateBlank}
                          disabled={creating}
                        >
                          <PlusIcon data-icon="inline-start" />
                          Nueva prueba
                        </Button>
                      ) : null}
                      <ImportModal onImportSuccess={() => mutate()} />
                    </div>
                  </div>
                ) : (
                  <DataTable
                    key={viewMode}
                    columns={
                      (viewMode === "pending"
                        ? pendingColumns
                        : protocolColumns) as any
                    }
                    data={filteredData}
                    loading={isLoading}
                    globalFilter={globalFilter}
                    onRowClick={(row: any) => {
                      const lockedBy = row.id ? locks[row.id] : undefined;

                      if (lockedBy && row.status !== "PENDING") {
                        toast.warning(`Protocolo en ejecucion por ${lockedBy}`, {
                          description:
                            "No es posible editar el protocolo mientras esta siendo ejecutado.",
                          duration: 4000,
                        });
                        return;
                      }

                      const route =
                        row.status === "PENDING"
                          ? `/supervisor/test/${row.id}`
                          : `/supervisor/protocolo/${row.id}`;

                      router.push(route);
                    }}
                  />
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ShellCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="aspect-video rounded-xl border border-border/60 bg-muted/35 p-5">
      <div className="flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
              {value}
            </p>
          </div>
          <div className="flex size-10 items-center justify-center rounded-xl border border-border/70 bg-background/70">
            <Icon className="size-4 text-primary" />
          </div>
        </div>
        <p className="max-w-[18rem] text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
