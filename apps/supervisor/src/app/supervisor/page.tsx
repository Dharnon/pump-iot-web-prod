"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { useTests } from "@/hooks/useTests";

// Dynamic import for bundle optimization (Vercel: bundle-dynamic-imports)
const ImportModal = dynamic(
  () => import("@/components/import-modal").then((m) => m.ImportModal),
  { ssr: false },
);
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  FileSpreadsheet,
  RefreshCw,
  Search,
  Filter,
  Upload,
  ClipboardList,
  CheckSquare,
  ChevronRight,
  TrendingUp,
  Clock,
  FileCheck,
  Plus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/supervisor/data-table";
import { getColumns, TestItem } from "@/components/supervisor/columns";
import {
  getProtocolColumns,
  ProtocolItem,
} from "@/components/supervisor/protocol-columns";
import { useLanguage } from "@/lib/language-context";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { deleteTest, createListado } from "@/lib/api";
import { toast } from "sonner";

type ViewMode = "pending" | "protocols";

/**
 * Dashboard - Firecrawl-inspired "Infinite Lines" Design
 * Grid-based layout with subtle borders, asymmetric structure, and hover interactions
 */
export default function DashboardPage() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [viewMode, setViewMode] = useState<ViewMode>("pending");
  const [lastImport, setLastImport] = useState<{
    filename: string;
    count: number;
    time: Date;
  } | null>(null);
  const router = useRouter();
  const { t } = useLanguage();
  const [creating, setCreating] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // SWR Hook for data fetching
  const { tests, isLoading, isValidating, mutate } = useTests();

  // Load state from localStorage on mount
  useEffect(() => {
    const savedViewMode = localStorage.getItem("dashboardViewMode") as ViewMode;
    const savedStatusFilter = localStorage.getItem("dashboardStatusFilter");

    if (savedViewMode) setViewMode(savedViewMode);
    if (savedStatusFilter) setStatusFilter(savedStatusFilter);
    setIsReady(true);
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    if (isReady) {
      localStorage.setItem("dashboardViewMode", viewMode);
      localStorage.setItem("dashboardStatusFilter", statusFilter);
    }
  }, [viewMode, statusFilter, isReady]);

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
      mutate();
      router.push(`/supervisor/test/pending-${result.id}`);
    } catch (error) {
      toast.error("Error al crear la prueba manual");
    } finally {
      setCreating(false);
    }
  };

  // Get translated columns
  const pendingColumns = useMemo(
    () => getColumns(t, handleDelete),
    [t, handleDelete],
  );
  const protocolColumns = useMemo(
    () => getProtocolColumns(t, handleDelete),
    [t, handleDelete],
  );

  // Separate pending and generated tests
  const pendingTests = useMemo(() => {
    if (!tests) return [];
    return tests.filter((t: any) => t.id.startsWith("pending-"));
  }, [tests]);

  const inProgressTests = useMemo(() => {
    if (!tests) return [];
    return tests.filter((t: any) => t.status === "IN_PROGRESS");
  }, [tests]);

  const generatedTestsOnly = useMemo(() => {
    if (!tests) return [];
    // Only count items that are NOT pending-xxx and have GENERATED status
    return tests.filter(
      (t: any) =>
        !t.id.startsWith("pending-") &&
        (t.status === "GENERATED" || t.status === "GENERADO"),
    );
  }, [tests]);

  const completedTests = useMemo(() => {
    if (!tests) return [];
    return tests.filter((t: any) => t.status === "COMPLETED");
  }, [tests]);

  const generatedTests = useMemo(() => {
    if (!tests) return [];
    return tests.filter((t: any) => !t.id.startsWith("pending-"));
  }, [tests]);

  // Apply filters based on view mode
  const filteredData = useMemo(() => {
    const dataSource = viewMode === "pending" ? pendingTests : generatedTests;
    if (statusFilter === "all") return dataSource;
    return dataSource.filter(
      (t) =>
        t.status === statusFilter ||
        (statusFilter === "GENERATED" && t.status === "GENERADO"),
    );
  }, [viewMode, pendingTests, generatedTests, statusFilter]);

  useEffect(() => {
    const stored = localStorage.getItem("lastImport");
    if (stored) setLastImport(JSON.parse(stored));
  }, []);

  const handleImportSuccess = (filename: string, count: number) => {
    const importData = { filename, count, time: new Date() };
    setLastImport(importData);
    localStorage.setItem("lastImport", JSON.stringify(importData));
    // Instant revalidation
    mutate();
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Compact Header - Similar to test/:id */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-2 border-b bg-background/50 backdrop-blur-sm shrink-0 gap-2">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-3 min-w-0 overflow-hidden">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium shrink-0">
              <span>{t("dash.title")}</span>
              <ChevronRight className="w-3 h-3" />
              <span>
                {viewMode === "pending" ? "Pendientes" : "Protocolos"}
              </span>
            </div>
            <span className="text-muted-foreground/30 text-lg sm:text-xl font-light">
              /
            </span>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">
              {filteredData.length} {t("table.records")}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ImportModal onImportSuccess={handleImportSuccess} />
        </div>
      </header>

      {/* Main Grid Layout - Asymmetric (Main + Sidebar) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_420px] overflow-hidden">
        {/* Main Content Area */}
        <div className="flex flex-col border-r overflow-hidden">
          {/* Stats Grid - Infinite Lines Style */}
          <div className="grid grid-cols-4 border-b">
            <StatCell
              label={t("dash.stat.pending")}
              value={pendingTests.filter((t) => t.status === "PENDING").length}
              icon={<Clock className="w-4 h-4" />}
              color="text-yellow-600"
              active={viewMode === "pending"}
              onClick={() => {
                setViewMode("pending");
                setStatusFilter("PENDING");
              }}
            />
            <StatCell
              label={t("dash.stat.generated")}
              value={generatedTestsOnly.length}
              icon={<FileCheck className="w-4 h-4" />}
              color="text-green-600"
              active={
                viewMode === "protocols" &&
                (statusFilter === "GENERATED" || statusFilter === "GENERADO")
              }
              onClick={() => {
                setViewMode("protocols");
                setStatusFilter("GENERATED");
              }}
            />
            <StatCell
              label={t("dash.stat.process")}
              value={inProgressTests.length}
              icon={<TrendingUp className="w-4 h-4" />}
              color="text-blue-600"
              active={
                viewMode === "protocols" && statusFilter === "IN_PROGRESS"
              }
              onClick={() => {
                setViewMode("protocols");
                setStatusFilter("IN_PROGRESS");
              }}
            />
            <StatCell
              label={t("dash.stat.completed")}
              value={completedTests.length}
              icon={<CheckSquare className="w-4 h-4" />}
              color="text-slate-900 dark:text-slate-100"
              active={viewMode === "protocols" && statusFilter === "COMPLETED"}
              onClick={() => {
                setViewMode("protocols");
                setStatusFilter("COMPLETED");
              }}
              noBorderRight
            />
          </div>

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
                      <SelectItem value="GENERATED">
                        {t("status.PROCESSED")}
                      </SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="IN_PROGRESS">
                        {t("status.IN_PROGRESS")}
                      </SelectItem>
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

        {/* Sidebar - Fixed Width Panel */}
        <div className="hidden lg:flex flex-col border-l bg-background overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Actividad Reciente
            </h2>
          </div>
          <div className="flex-1 overflow-auto p-6 space-y-4">
            {lastImport ? (
              <div className="space-y-3">
                <div className="p-4 border border-border/50 hover:border-primary/30 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Última Importación
                      </span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-1">
                    {lastImport.filename}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {lastImport.count} registros importados
                  </p>
                  <p className="text-[10px] text-muted-foreground/70 mt-2">
                    {new Date(lastImport.time).toLocaleString("es-ES")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">
                No hay actividad reciente
              </div>
            )}

            {/* Quick Stats */}
            <div className="space-y-2 pt-4 border-t">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Estadísticas
              </h3>
              <QuickStatRow label="Total de Pruebas" value={tests.length} />
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
                label="Completadas"
                value={generatedTests.length}
                color="text-green-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Cell Component - Infinite Lines Style
function StatCell({
  label,
  value,
  icon,
  color,
  active,
  onClick,
  noBorderRight,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  active?: boolean;
  onClick?: () => void;
  noBorderRight?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`
                relative p-4 border-r ${noBorderRight ? "border-r-0" : ""} 
                hover:bg-black/[0.02] dark:hover:bg-white/[0.02] 
                cursor-pointer transition-all group
                ${active ? "bg-primary/5" : ""}
            `}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`${color} opacity-70 group-hover:opacity-100 transition-opacity`}
        >
          {icon}
        </div>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
      )}
    </div>
  );
}

// Quick Stat Row Component
function QuickStatRow({
  label,
  value,
  color = "text-foreground",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 px-3 border border-border/30 hover:border-border/50 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-all">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm font-bold ${color}`}>{value}</span>
    </div>
  );
}
