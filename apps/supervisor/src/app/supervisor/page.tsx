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
<<<<<<< HEAD
  SearchIcon,
=======
  Search,
  Filter,
  Upload,
  ClipboardList,
  CheckSquare,
  ChevronRight,
  TrendingUp,
  FileCheck,
  Plus,
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
<<<<<<< HEAD
import { getColumns } from "@/components/supervisor/columns";
import { getProtocolColumns } from "@/components/supervisor/protocol-columns";

const ImportModal = dynamic(
  () => import("@/components/import-modal").then((module) => module.ImportModal),
  { ssr: false },
);

type ViewMode = "pending" | "protocols";

=======
import { getColumns, TestItem } from "@/components/supervisor/columns";
import {
  getProtocolColumns,
  ProtocolItem,
} from "@/components/supervisor/protocol-columns";
import { useLanguage } from "@/lib/language-context";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import useSWR from "swr";
import { deleteTest, createListado, patchTest, swrFetcher } from "@/lib/api";
import { toast } from "sonner";
import { useSignalR } from "@/hooks/useSignalR";
import { HubConnectionState } from "@microsoft/signalr";

type ViewMode = "pending" | "protocols";

function normalizeStatusFilter(
  nextViewMode: ViewMode,
  nextStatusFilter: string | null,
) {
  if (nextViewMode === "pending") {
    return nextStatusFilter === "EN_BANCO" ||
      nextStatusFilter === "GENERATED" ||
      nextStatusFilter === "all"
      ? nextStatusFilter
      : "PENDING";
  }

  return nextStatusFilter === "PENDING" ? "all" : (nextStatusFilter ?? "all");
}

/**
 * Dashboard - Firecrawl-inspired "Infinite Lines" Design
 * Grid-based layout with subtle borders, asymmetric structure, and hover interactions
 */
>>>>>>> 95093510d90cbd30f3ba0adce0532518ef8ea829
export default function DashboardPage() {
    const router = useRouter();
    const { t } = useLanguage();

    const [globalFilter, setGlobalFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("PENDING");
    const [viewMode, setViewMode] = useState<ViewMode>("pending");
<<<<<<< HEAD
    const [creating, setCreating] = useState(false);
    const [isReady, setIsReady] = useState(false);
=======
  const [lastImport, setLastImport] = useState<{
    filename: string;
    count: number;
    time: Date;
  } | null>(null);
  const { data: bancos } = useSWR("/api/bancos", swrFetcher);
  const router = useRouter();
  const { t } = useLanguage();
  const [creating, setCreating] = useState(false);
  const [isReady, setIsReady] = useState(false);
  // SWR Hook for data fetching
  const { tests, isLoading, isValidating, mutate } = useTests();
>>>>>>> 95093510d90cbd30f3ba0adce0532518ef8ea829

    const { tests, isLoading, isValidating, mutate } = useTests();
    const { locks, connectionState } = useSignalR({
      onListUpdated: () => mutate(),
    });

    const isConnected = connectionState === HubConnectionState.Connected;

    useEffect(() => {
      const savedViewMode = localStorage.getItem("dashboardViewMode") as ViewMode;
      const savedStatusFilter = localStorage.getItem("dashboardStatusFilter");

      if (savedViewMode) setViewMode(savedViewMode);
      if (savedStatusFilter) setStatusFilter(savedStatusFilter);
      setSidebarOpen(localStorage.getItem("dashboardSidebarOpen") !== "false");
      setIsReady(true);
    }, []);

    useEffect(() => {
      if (isReady) {
        localStorage.setItem("dashboardViewMode", viewMode);
        localStorage.setItem("dashboardStatusFilter", statusFilter);
        localStorage.setItem("dashboardSidebarOpen", String(sidebarOpen));
      }
    }, [viewMode, statusFilter, sidebarOpen, isReady]);

    // Reset status filter when switching views (only if not restoring from mount)
    useEffect(() => {
      if (!isReady) return;

      // Check if we just changed viewMode manually
      // We only want to auto-reset if the viewMode doesn't match the saved status filter logic
      if (
        viewMode === "pending" &&
        statusFilter !== "PENDING" &&
        statusFilter !== "GENERATED" &&
        statusFilter !== "all"
      ) {
        setStatusFilter("PENDING");
      } else if (viewMode === "protocols" && statusFilter === "PENDING") {
        setStatusFilter("all");
      }
    }, [viewMode, isReady]);

    const handleDelete = async (id: string) => {
      try {
        await deleteTest(id);
        toast.success("Registro eliminado correctamente");
        mutate();
      } catch (error) {
        console.error("Error deleting test:", error);
        const message =
          error instanceof Error
            ? error.message
            : "Error al eliminar el registro";
        toast.error(message);
      }
    };

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

    const handleMoveProtocolToBank = useCallback(
      async (id: string, bancoId?: number) => {
        try {
          if (!bancoId) {
            toast.warning("Debe seleccionar un banco antes de enviarlo a banco");
            return;
          }

          await patchTest(id, {
            status: "EN_BANCO",
            bancoId,
          });

          toast.success("Prueba enviada a banco");
          mutate();
        } catch (error) {
          console.error("Error moving protocol to bank:", error);
          toast.error("Error al enviar la prueba a banco");
        }
      },
      [mutate],
    );

    const handleReturnProtocolToGenerated = useCallback(
      async (id: string, bancoId?: number) => {
        try {
          await patchTest(id, {
            status: "GENERATED",
            bancoId,
          });

          toast.success("Prueba devuelta a procesados");
          mutate();
        } catch (error) {
          console.error("Error returning protocol to generated:", error);
          toast.error("Error al devolver la prueba a procesados");
        }
      },
      [mutate],
    );

<<<<<<< HEAD
=======
  const handleMoveProtocolToBank = useCallback(
    async (id: string, bancoId?: number) => {
      try {
        if (!bancoId) {
          toast.warning("Debe seleccionar un banco antes de enviarlo a banco");
          return;
        }

        await patchTest(id, {
          status: "EN_BANCO",
          bancoId,
        });

        toast.success("Prueba enviada a banco");
        mutate();
      } catch (error) {
        console.error("Error moving protocol to bank:", error);
        toast.error("Error al enviar la prueba a banco");
      }
    },
    [mutate],
  );

  const handleReturnProtocolToGenerated = useCallback(
    async (id: string, bancoId?: number) => {
      try {
        await patchTest(id, {
          status: "GENERATED",
          bancoId,
        });

        toast.success("Prueba devuelta a procesados");
        mutate();
      } catch (error) {
        console.error("Error returning protocol to generated:", error);
        toast.error("Error al devolver la prueba a procesados");
      }
    },
    [mutate],
  );

  // Get translated columns — pass locks so status cell shows "En Ejecución"
>>>>>>> 95093510d90cbd30f3ba0adce0532518ef8ea829
    const pendingColumns = useMemo(
      () => getColumns(t, handleDelete, locks),
      [handleDelete, locks, t],
    );

    const protocolColumns = useMemo(
      () => getProtocolColumns(t, handleDelete, locks),
      [t, handleDelete, locks],
    );

    // Separate pending and generated tests
    const pendingTests = useMemo(() => {
      if (!tests) return [];
      return tests.filter((t: any) => t.id.startsWith("pending-"));
    }, [tests]);

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
    }, [viewMode, pendingTests, generatedTests, statusFilter, locks]);

    useEffect(() => {
      const stored = localStorage.getItem("lastImport");
      if (stored) {
        try {
          setLastImport(JSON.parse(stored));
        } catch (e) {
          console.error("Error parsing lastImport:", e);
          localStorage.removeItem("lastImport");
        }
      }
    }, []);

    const handleImportSuccess = (filename: string, count: number) => {
      const importData = { filename, count, time: new Date() };
      setLastImport(importData);
      localStorage.setItem("lastImport", JSON.stringify(importData));
      // Instant revalidation
      mutate();
    };

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

<<<<<<< HEAD
    <div className="flex-1 overflow-auto">
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <ShellCard
            title="Pending queue"
            value={pendingTests.length}
            description="Listados listos para revision y preparacion."
            icon={FolderClockIcon}
=======
      {/* Main Grid Layout - Asymmetric (Main + Sidebar) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col border-r overflow-hidden">
          {/* Stats Grid - Infinite Lines Style */}
          <div className="grid grid-cols-5 border-b">
            <StatCell
              label={t("dash.stat.pending")}
              value={
                pendingTests.filter((t: any) => t.status === "PENDING").length
              }
              icon={<Clock className="w-4 h-4" />}
              color="text-yellow-600"
              active={viewMode === "pending"}
              onClick={() => {
                setViewMode("pending");
                setStatusFilter("PENDING");
              }}
>>>>>>> 95093510d90cbd30f3ba0adce0532518ef8ea829
          />
          <ShellCard
            title="Generated protocols"
            value={generatedTestsOnly.length}
            description="Protocolos listos para programacion o ejecucion."
            icon={FileCheckIcon}
          />
<<<<<<< HEAD
    <ShellCard
      title="Active work"
=======
            <StatCell
              label="En Banco"
              value={enBancoTests.length}
              icon={<Wrench className="w-4 h-4" />}
              color="text-amber-600"
              active={viewMode === "protocols" && statusFilter === "EN_BANCO"}
              onClick={() => {
                setViewMode("protocols");
                setStatusFilter("EN_BANCO");
              }}
            />
            <StatCell
              label={t("dash.stat.process")}
>>>>>>> 95093510d90cbd30f3ba0adce0532518ef8ea829
      value={inProgressTests.length}
      description="Pruebas en curso o bloqueadas por operator."
      icon={ActivityIcon}
    />
          </div >

<<<<<<< HEAD
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
=======
          {/* Filters Bar */}
          <div className="flex items-center justify-end px-6 py-3 border-b bg-muted/5">
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 h-8 text-xs border-border/50">
                  <Filter className="w-3 h-3 mr-2 opacity-70" />
                  <SelectValue placeholder={t("table.filter")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("status.all")}</SelectItem>
                  {viewMode === "pending" ? (
                    <>
                      <SelectItem value="PENDING">
                        {t("status.PENDING")}
                      </SelectItem>
                      <SelectItem value="EN_BANCO">En Banco</SelectItem>
                      <SelectItem value="GENERATED">
                        {t("status.PROCESSED")}
                      </SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="IN_PROGRESS">
                        {t("status.IN_PROGRESS")}
                      </SelectItem>
                      <SelectItem value="EN_BANCO">En Banco</SelectItem>
                      <SelectItem value="GENERATED">
                        {t("status.GENERATED")}
                      </SelectItem>
                      <SelectItem value="COMPLETED">
                        {t("status.COMPLETED")}
                      </SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground opacity-70" />
                <Input
                  placeholder={t("table.search")}
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-9 w-56 h-8 text-xs border-border/50"
                />
              </div>

              {viewMode === "pending" && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCreateBlank}
                  disabled={creating}
                  className="h-8 w-8 border-border/50 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/10"
                  title="Nueva prueba manual"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              )}

              <Button
                variant="outline"
                size="icon"
                onClick={() => mutate()}
                disabled={isLoading || isValidating}
                className="h-8 w-8 border-border/50"
                title={t("table.refresh")}
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isValidating ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto">
            {isLoading && !tests.length ? (
              <div className="flex-1 flex items-center justify-center h-full">
                <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-8 h-full">
                <Empty className="max-w-md">
                  <EmptyHeader>
                    <EmptyMedia
                      variant="icon"
                      className="bg-primary/5 text-primary"
                    >
                      {viewMode === "pending" ? (
                        <Upload className="w-8 h-8" />
                      ) : (
                        <CheckSquare className="w-8 h-8" />
                      )}
                    </EmptyMedia>
                    <EmptyTitle>
                      {viewMode === "pending"
                        ? t("empty.title")
                        : "No hay protocolos"}
                    </EmptyTitle>
                    <EmptyDescription>
                      {viewMode === "pending"
                        ? t("empty.desc")
                        : "Genera protocolos desde los listados pendientes para verlos aquí"}
                    </EmptyDescription>
                  </EmptyHeader>
                  {viewMode === "pending" && (
                    <EmptyContent>
                      <ImportModal onImportSuccess={handleImportSuccess} />
                    </EmptyContent>
                  )}
                </Empty>
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
                onRowClick={(row) => {
                  // Block access if an operator is actively executing this protocol
                  const lockedBy = (row as any).id && locks[(row as any).id];
                  if (lockedBy && row.status !== "PENDING") {
                    toast.warning(`Protocolo en ejecución por ${lockedBy}`, {
                      description:
                        "No es posible editar el protocolo mientras está siendo ejecutado.",
                      duration: 4000,
                    });
                    return;
                  }
                  // Route to test page for pending, protocolo page for generated
                  const route =
                    row.status === "PENDING"
                      ? `/supervisor/test/${row.id}`
                      : `/supervisor/protocolo/${row.id}`;
                  router.push(route);
                }}
                globalFilter={globalFilter}
              />
            )}
          </div>
        </div>

        {/* Sidebar - Collapsible Panel */}
        <div
          className={[
            "hidden lg:flex flex-col border-l bg-background overflow-hidden transition-all duration-300",
            sidebarOpen ? "w-[320px] min-w-[320px]" : "w-10 min-w-10",
          ].join(" ")}
        >
          {/* Header - always visible, acts as toggle */}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="flex items-center justify-between px-3 py-2.5 border-b w-full hover:bg-muted/30 transition-colors group shrink-0"
          >
            {sidebarOpen && (
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                Actividad Reciente
              </span>
            )}
            <ChevronRight
              className={[
                "w-3.5 h-3.5 text-muted-foreground/60 group-hover:text-foreground transition-all shrink-0",
                sidebarOpen ? "rotate-180" : "",
              ].join(" ")}
            />
          </button>

          {/* Content — only shown when open */}
          {sidebarOpen && (
            <div className="flex-1 overflow-auto p-3 space-y-3">
              {/* Last Import */}
              {lastImport ? (
                <div className="p-3 border border-border/40 hover:border-primary/30 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all rounded-sm">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Última Importación
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-foreground truncate mb-0.5">
                    {lastImport.filename}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {lastImport.count} registros •{" "}
                    {new Date(lastImport.time).toLocaleString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-12 text-[10px] text-muted-foreground/60">
                  Sin actividad
                </div>
              )}

              {/* Quick Stats */}
              <div className="space-y-1 pt-2 border-t">
                <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                  Estadísticas
                </h3>
                <QuickStatRow label="Total" value={tests.length} />
                <QuickStatRow
                  label="Pendientes"
                  value={pendingTests.length}
                  color="text-yellow-600"
                />
                <QuickStatRow
                  label="En Proceso"
                  value={tests.filter((t) => t.status === "IN_PROGRESS").length}
                  color="text-blue-600"
                />
                <QuickStatRow
                  label="En Banco"
                  value={enBancoTests.length}
                  color="text-amber-600"
                />
                <QuickStatRow
                  label="Completadas"
                  value={generatedTests.length}
                  color="text-green-600"
                />
              </div>
            </div>
          )}
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
