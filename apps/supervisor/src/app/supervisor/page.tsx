"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTests } from "@/hooks/useTests";

// Dynamic import for bundle optimization (Vercel: bundle-dynamic-imports)
const ImportModal = dynamic(
    () => import("@/components/import-modal").then(m => m.ImportModal),
    { ssr: false }
);
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
    FileSpreadsheet, RefreshCw, Search,
    Filter, Upload, ClipboardList, CheckSquare,
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
import { getProtocolColumns, ProtocolItem } from "@/components/supervisor/protocol-columns";
import { useLanguage } from "@/lib/language-context";

type ViewMode = "pending" | "protocols";

/**
 * Dashboard - Fully Responsive with Data Table, Sticky Header, Sorting
 */
export default function DashboardPage() {
    const [globalFilter, setGlobalFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [viewMode, setViewMode] = useState<ViewMode>("pending");
    const [lastImport, setLastImport] = useState<{ filename: string; count: number; time: Date } | null>(null);
    const router = useRouter();
    const { t } = useLanguage();

    // SWR Hook for data fetching
    const { tests, isLoading, mutate } = useTests();

    // Get translated columns
    const pendingColumns = useMemo(() => getColumns(t), [t]);
    const protocolColumns = useMemo(() => getProtocolColumns(t), [t]);

    // Separate pending and generated tests
    const pendingTests = useMemo(() => {
        if (!tests) return [];
        return tests.filter(t => t.status === "PENDING");
    }, [tests]);

    const generatedTests = useMemo(() => {
        if (!tests) return [];
        return tests.filter(t => t.status !== "PENDING");
    }, [tests]);

    // Apply filters based on view mode
    const filteredData = useMemo(() => {
        const dataSource = viewMode === "pending" ? pendingTests : generatedTests;
        if (statusFilter === "all") return dataSource;
        return dataSource.filter(t => t.status === statusFilter);
    }, [viewMode, pendingTests, generatedTests, statusFilter]);

    useEffect(() => {
        const stored = localStorage.getItem("lastImport");
        if (stored) setLastImport(JSON.parse(stored));
    }, []);

    // Reset status filter when switching views
    useEffect(() => {
        setStatusFilter("all");
    }, [viewMode]);

    const handleImportSuccess = (filename: string, count: number) => {
        const importData = { filename, count, time: new Date() };
        setLastImport(importData);
        localStorage.setItem("lastImport", JSON.stringify(importData));
        // Instant revalidation
        mutate();
    };

    return (
        <div className="h-full flex flex-col gap-4 sm:gap-6 p-6 overflow-y-auto md:overflow-hidden">
            {/* Header - Responsive */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("dash.title")}</h1>
                        <p className="text-sm sm:text-base text-muted-foreground">
                            {t("dash.subtitle")}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    {lastImport && (
                        <div className="text-right text-xs sm:text-sm hidden sm:block">
                            <p className="text-muted-foreground">{t("dash.lastFile")}</p>
                            <p className="font-medium text-primary">{lastImport.filename}</p>
                        </div>
                    )}
                    <ImportModal onImportSuccess={handleImportSuccess} />
                </div>
            </div>

            {/* Desktop Stats - Full Cards */}
            <div className="hidden md:grid grid-cols-4 gap-4 shrink-0">
                <Card className="cursor-pointer hover:border-primary/50 transition-colors sm:bg-card" onClick={() => { setViewMode("pending"); setStatusFilter("all"); }}>
                    <div className="p-4 flex flex-col gap-1">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">{t("dash.stat.total")}</span>
                        <span className="text-2xl font-bold text-slate-900">{tests.length}</span>
                    </div>
                </Card>
                <Card className={`cursor-pointer hover:border-primary/50 transition-colors sm:bg-card ${viewMode === "pending" ? "ring-2 ring-primary" : ""}`} onClick={() => { setViewMode("pending"); setStatusFilter("all"); }}>
                    <div className="p-4 flex flex-col gap-1">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">{t("dash.stat.pending")}</span>
                        <span className="text-2xl font-bold text-yellow-600">{pendingTests.length}</span>
                    </div>
                </Card>
                <Card className="cursor-pointer hover:border-primary/50 transition-colors sm:bg-card" onClick={() => { setViewMode("protocols"); setStatusFilter("IN_PROGRESS"); }}>
                    <div className="p-4 flex flex-col gap-1">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">{t("dash.stat.process")}</span>
                        <span className="text-2xl font-bold text-blue-600">
                            {tests.filter(t => t.status === "IN_PROGRESS").length}
                        </span>
                    </div>
                </Card>
                <Card className={`cursor-pointer hover:border-primary/50 transition-colors sm:bg-card ${viewMode === "protocols" && statusFilter === "all" ? "ring-2 ring-primary" : ""}`} onClick={() => { setViewMode("protocols"); setStatusFilter("all"); }}>
                    <div className="p-4 flex flex-col gap-1">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">{t("dash.stat.generated")}</span>
                        <span className="text-2xl font-bold text-green-600">{generatedTests.length}</span>
                    </div>
                </Card>
            </div>

            {/* Data Table Section */}
            <div className="flex-1 flex flex-col min-h-0 space-y-4">
                {/* Section Header with View Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-4">
                        {/* View Mode Toggle - Tab Style */}
                        <div className="flex items-center bg-muted rounded-lg p-1 gap-1">
                            <Button
                                variant={viewMode === "pending" ? "default" : "ghost"}
                                size="sm"
                                className="h-8 px-3 gap-2"
                                onClick={() => setViewMode("pending")}
                            >
                                <ClipboardList className="w-4 h-4" />
                                <span>Pendientes</span>
                                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">
                                    {pendingTests.length}
                                </span>
                            </Button>
                            <Button
                                variant={viewMode === "protocols" ? "default" : "ghost"}
                                size="sm"
                                className="h-8 px-3 gap-2"
                                onClick={() => setViewMode("protocols")}
                            >
                                <CheckSquare className="w-4 h-4" />
                                <span>Protocolos</span>
                                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-green-100 text-green-700">
                                    {generatedTests.length}
                                </span>
                            </Button>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">
                                {filteredData.length} {t("table.records")}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Status Filter - Only show for protocols view */}
                        {viewMode === "protocols" && (
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-32 sm:w-40 text-xs sm:text-sm h-9">
                                    <Filter className="w-3.5 h-3.5 mr-2 opacity-70" />
                                    <SelectValue placeholder={t("table.filter")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("status.all")}</SelectItem>
                                    <SelectItem value="IN_PROGRESS">{t("status.IN_PROGRESS")}</SelectItem>
                                    <SelectItem value="GENERATED">{t("status.GENERATED")}</SelectItem>
                                    <SelectItem value="GENERADO">Generado</SelectItem>
                                    <SelectItem value="COMPLETED">{t("status.COMPLETED")}</SelectItem>
                                </SelectContent>
                            </Select>
                        )}

                        {/* Search */}
                        <div className="relative flex-1 sm:flex-none">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-70" />
                            <Input
                                placeholder={t("table.search")}
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                className="pl-9 w-full sm:w-48 lg:w-64 text-xs sm:text-sm h-9"
                            />
                        </div>

                        <Button variant="outline" size="icon" onClick={() => mutate()} disabled={isLoading} className="h-9 w-9">
                            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                        </Button>
                    </div>
                </div>

                {/* Table Container */}
                <div className="flex-1 flex flex-col min-h-0">
                    {isLoading && !tests.length ? (
                        <div className="flex-1 flex items-center justify-center">
                            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center p-8">
                            <Empty className="max-w-md">
                                <EmptyHeader>
                                    <EmptyMedia variant="icon" className="bg-primary/5 text-primary">
                                        {viewMode === "pending" ? <Upload className="w-8 h-8" /> : <CheckSquare className="w-8 h-8" />}
                                    </EmptyMedia>
                                    <EmptyTitle>
                                        {viewMode === "pending" ? t("empty.title") : "No hay protocolos"}
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
                            columns={viewMode === "pending" ? pendingColumns : protocolColumns}
                            // @ts-ignore
                            data={filteredData}
                            loading={isLoading}
                            onRowClick={(row) => router.push(`/supervisor/test/${row.id}`)}
                            globalFilter={globalFilter}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
