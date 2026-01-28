"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTests } from "@/lib/api";

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
    Filter, Upload,
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
import { useLanguage } from "@/lib/language-context";

/**
 * Dashboard - Fully Responsive with Data Table, Sticky Header, Sorting
 */
export default function DashboardPage() {
    const [tests, setTests] = useState<TestItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [lastImport, setLastImport] = useState<{ filename: string; count: number; time: Date } | null>(null);
    const router = useRouter();
    const { t } = useLanguage();

    // Get translated columns
    const columns = useMemo(() => getColumns(t), [t]);

    // Filter by status
    const filteredData = useMemo(() => {
        if (statusFilter === "all") return tests;
        return tests.filter(t => t.status === statusFilter);
    }, [tests, statusFilter]);

    // Fetch tests using centralized API service (SOLID: Dependency Inversion)
    const fetchTests = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getTests();
            setTests(data as TestItem[]);
        } catch (error) {
            console.error("Error fetching tests:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTests();
        const stored = localStorage.getItem("lastImport");
        if (stored) setLastImport(JSON.parse(stored));
    }, [fetchTests]);

    const handleImportSuccess = (filename: string, count: number) => {
        const importData = { filename, count, time: new Date() };
        setLastImport(importData);
        localStorage.setItem("lastImport", JSON.stringify(importData));
        fetchTests();
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

            {/* Mobile Stats - Compact 2x2 Grid */}
            <div className="md:hidden grid grid-cols-2 gap-2 shrink-0 mb-2">
                <Card className="cursor-pointer hover:border-primary/50 transition-colors bg-muted/20 border-dashed shadow-none" onClick={() => setStatusFilter("all")}>
                    <div className="p-2 flex flex-col items-center justify-center text-center gap-0.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("dash.stat.total")}</span>
                        <span className="text-lg font-bold text-foreground">{tests.length}</span>
                    </div>
                </Card>
                <Card className="cursor-pointer hover:border-orange-200 transition-colors bg-orange-50/30 border-orange-100 dark:bg-orange-950/20 dark:border-orange-800/50 shadow-none" onClick={() => setStatusFilter("PENDING")}>
                    <div className="p-2 flex flex-col items-center justify-center text-center gap-0.5">
                        <span className="text-[10px] font-bold text-orange-600/80 dark:text-orange-400 uppercase tracking-wider">{t("dash.stat.pending")}</span>
                        <span className="text-lg font-bold text-orange-700 dark:text-orange-400">
                            {tests.filter(t => t.status === "PENDING").length}
                        </span>
                    </div>
                </Card>
                <Card className="cursor-pointer hover:border-blue-200 transition-colors bg-blue-50/30 border-blue-100 dark:bg-blue-950/20 dark:border-blue-800/50 shadow-none" onClick={() => setStatusFilter("IN_PROGRESS")}>
                    <div className="p-2 flex flex-col items-center justify-center text-center gap-0.5">
                        <span className="text-[10px] font-bold text-blue-600/80 dark:text-blue-400 uppercase tracking-wider">{t("dash.stat.process")}</span>
                        <span className="text-lg font-bold text-blue-700 dark:text-blue-400">
                            {tests.filter(t => t.status === "IN_PROGRESS").length}
                        </span>
                    </div>
                </Card>
                <Card className="cursor-pointer hover:border-green-200 transition-colors bg-green-50/30 border-green-100 dark:bg-green-950/20 dark:border-green-800/50 shadow-none" onClick={() => setStatusFilter("GENERATED")}>
                    <div className="p-2 flex flex-col items-center justify-center text-center gap-0.5">
                        <span className="text-[10px] font-bold text-green-600/80 dark:text-green-400 uppercase tracking-wider">{t("dash.stat.generated")}</span>
                        <span className="text-lg font-bold text-green-700 dark:text-green-400">
                            {tests.filter(t => t.status === "GENERATED").length}
                        </span>
                    </div>
                </Card>
            </div>

            {/* Desktop Stats - Full Cards */}
            <div className="hidden md:grid grid-cols-4 gap-4 shrink-0">
                <Card className="cursor-pointer hover:border-primary/50 transition-colors sm:bg-card" onClick={() => setStatusFilter("all")}>
                    <div className="p-4 flex flex-col gap-1">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">{t("dash.stat.total")}</span>
                        <span className="text-2xl font-bold text-slate-900">{tests.length}</span>
                    </div>
                </Card>
                <Card className="cursor-pointer hover:border-primary/50 transition-colors sm:bg-card" onClick={() => setStatusFilter("PENDING")}>
                    <div className="p-4 flex flex-col gap-1">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">{t("dash.stat.pending")}</span>
                        <span className="text-2xl font-bold text-yellow-600">
                            {tests.filter(t => t.status === "PENDING").length}
                        </span>
                    </div>
                </Card>
                <Card className="cursor-pointer hover:border-primary/50 transition-colors sm:bg-card" onClick={() => setStatusFilter("IN_PROGRESS")}>
                    <div className="p-4 flex flex-col gap-1">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">{t("dash.stat.process")}</span>
                        <span className="text-2xl font-bold text-blue-600">
                            {tests.filter(t => t.status === "IN_PROGRESS").length}
                        </span>
                    </div>
                </Card>
                <Card className="cursor-pointer hover:border-primary/50 transition-colors sm:bg-card" onClick={() => setStatusFilter("GENERATED")}>
                    <div className="p-4 flex flex-col gap-1">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">{t("dash.stat.generated")}</span>
                        <span className="text-2xl font-bold text-green-600">
                            {tests.filter(t => t.status === "GENERATED").length}
                        </span>
                    </div>
                </Card>
            </div>

            {/* Data Table Section - cleaner integrated look */}
            <div className="flex-1 flex flex-col min-h-0 space-y-4">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                    <div>
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <FileSpreadsheet className="w-5 h-5 text-primary" />
                            {t("table.title")}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            {filteredData.length} {t("table.records")}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Status Filter */}
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-32 sm:w-40 text-xs sm:text-sm h-9">
                                <Filter className="w-3.5 h-3.5 mr-2 opacity-70" />
                                <SelectValue placeholder={t("table.filter")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("status.all")}</SelectItem>
                                <SelectItem value="PENDING">{t("status.PENDING")}</SelectItem>
                                <SelectItem value="IN_PROGRESS">{t("status.IN_PROGRESS")}</SelectItem>
                                <SelectItem value="GENERATED">{t("status.GENERATED")}</SelectItem>
                            </SelectContent>
                        </Select>

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

                        <Button variant="outline" size="icon" onClick={fetchTests} disabled={loading} className="h-9 w-9">
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        </Button>
                    </div>
                </div>

                {/* Table Container - simple border, clean design */}
                <div className="flex-1 flex flex-col min-h-0">
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : tests.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center p-8">
                            <Empty className="max-w-md">
                                <EmptyHeader>
                                    <EmptyMedia variant="icon" className="bg-primary/5 text-primary">
                                        <Upload className="w-8 h-8" />
                                    </EmptyMedia>
                                    <EmptyTitle>{t("empty.title")}</EmptyTitle>
                                    <EmptyDescription>
                                        {t("empty.desc")}
                                    </EmptyDescription>
                                </EmptyHeader>
                                <EmptyContent>
                                    <ImportModal onImportSuccess={handleImportSuccess} />
                                </EmptyContent>
                            </Empty>
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={filteredData}
                            loading={loading}
                            onRowClick={(row) => router.push(`/supervisor/test/${row.id}`)}
                            globalFilter={globalFilter}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
