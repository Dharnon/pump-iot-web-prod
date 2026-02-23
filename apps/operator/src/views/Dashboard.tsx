/**
 * Dashboard.tsx - Refactored to use isolated providers
 *
 * Changes:
 * - useTesting() → useJob() + useNavigation()
 * - setCapturedPoints moved to TelemetryProvider (used via hook in Analytics)
 */
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Settings,
  BarChart3,
  Home,
  LogOut,
  Wifi,
  WifiOff,
} from "lucide-react";
import { HubConnectionState } from "@microsoft/signalr";
import { useJob, Job } from "@/contexts/JobProvider";
import { useNavigation } from "@/contexts/NavigationProvider";

import { JobCard } from "@/components/testing/JobCard";
import { FloatingSidebar } from "@/components/testing/FloatingSidebar";
import { SettingsModal } from "@/views/SettingsModal";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { getTestPdf } from "@pump-iot/core/api";

type TabType = "pendientes" | "historial";

import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { es } from "date-fns/locale";

export const Dashboard: React.FC = () => {
  const {
    jobs,
    selectJob,
    setTestConfig,
    connectionState,
    locks,
    myLockedProtocols,
  } = useJob();
  const { setCurrentView } = useNavigation();

  const isConnected = connectionState === HubConnectionState.Connected;
  const isReconnecting = connectionState === HubConnectionState.Reconnecting;

  const [activeTab, setActiveTab] = useState<TabType>("pendientes");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.model.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesDate = true;
    if (dateRange?.from) {
      const jobDate = new Date(job.createdAt);

      if (dateRange.to) {
        matchesDate = isWithinInterval(jobDate, {
          start: startOfDay(dateRange.from),
          end: endOfDay(dateRange.to),
        });
      } else {
        matchesDate = isWithinInterval(jobDate, {
          start: startOfDay(dateRange.from),
          end: endOfDay(dateRange.from),
        });
      }
    }

    return matchesSearch && matchesDate;
  });

  const pendingJobs = filteredJobs.filter(
    (job) => job.status === "GENERADA" || job.status === "EN_PROCESO",
  );
  const historyJobs = filteredJobs.filter(
    (job) => job.status === "OK" || job.status === "KO",
  );

  const displayedJobs = activeTab === "pendientes" ? pendingJobs : historyJobs;

  const handleStartJob = (job: Job) => {
    selectJob(job);
    setCurrentView("setup");
  };

  const handleAnalyze = (job: Job) => {
    selectJob(job);
    // Load historical test results if available
    if (job.testResults) {
      setTestConfig(job.testResults.testConfig);
    }
    setCurrentView("analytics");
  };

  const handleViewPdf = async (job: Job) => {
    try {
      const blob = await getTestPdf(job.id);
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error opening PDF:", error);
      toast.error("Error al abrir el reporte PDF");
    }
  };

  const handleLogout = () => {
    toast.success("Sesión cerrada correctamente");
    setIsLogoutDialogOpen(false);
    // Here you would typically redirect to login or clear auth state
  };

  const sidebarItems = [
    {
      icon: Home,
      label: "Inicio",
      active: true,
      onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
    },
    {
      icon: BarChart3,
      label: "Reportes",
      onClick: () => setActiveTab("historial"),
    },
    {
      icon: Search,
      label: "Buscar",
      onClick: () => searchInputRef.current?.focus(),
    },
    {
      icon: Settings,
      label: "Ajustes",
      onClick: () => setIsSettingsOpen(true),
    },
    {
      icon: LogOut,
      label: "Salir",
      onClick: () => setIsLogoutDialogOpen(true),
    },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <FloatingSidebar items={sidebarItems} />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <AlertDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
            <AlertDialogDescription>
              Se cerrará su sesión actual en el terminal de operador.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cerrar Sesión
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="ml-16 md:ml-20 lg:ml-24 max-w-7xl mx-auto">
        {/* Header & Search */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Banco de Pruebas
            </h1>
            {/* SignalR connection indicator */}
            <div
              className="flex items-center gap-1.5 mb-2"
              title={
                isConnected
                  ? "Conectado al servidor"
                  : isReconnecting
                    ? "Reconectando..."
                    : "Sin conexión"
              }
            >
              <span
                className={[
                  "block w-2.5 h-2.5 rounded-full",
                  isConnected
                    ? "bg-green-500 shadow-[0_0_6px_2px_rgba(34,197,94,0.6)]"
                    : isReconnecting
                      ? "bg-yellow-400 animate-pulse shadow-[0_0_6px_2px_rgba(250,204,21,0.5)]"
                      : "bg-red-500 animate-pulse shadow-[0_0_6px_2px_rgba(239,68,68,0.6)]",
                ].join(" ")}
              />
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {isConnected
                  ? "En línea"
                  : isReconnecting
                    ? "Reconectando"
                    : "Sin conexión"}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full sm:w-[260px] justify-start text-left font-normal rounded-xl border-input bg-card h-[46px]",
                    !dateRange && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y", { locale: es })} -{" "}
                        {format(dateRange.to, "LLL dd, y", { locale: es })}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y", { locale: es })
                    )
                  ) : (
                    <span>Filtrar por fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  locale={es}
                />
              </PopoverContent>
            </Popover>

            {/* Search Bar */}
            <div className="relative w-full md:w-72 lg:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-muted-foreground">🔍</span>
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar pedido, cliente o modelo..."
                className="block w-full pl-10 pr-3 py-2.5 border border-input rounded-xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="inline-flex bg-card rounded-full p-1 shadow-soft">
            <button
              onClick={() => setActiveTab("pendientes")}
              className={cn(
                "px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-sm font-semibold transition-all",
                activeTab === "pendientes"
                  ? "gradient-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Pendientes
              <span className="ml-1 md:ml-2 px-1.5 md:px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                {pendingJobs.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("historial")}
              className={cn(
                "px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-sm font-semibold transition-all",
                activeTab === "historial"
                  ? "gradient-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Historial
              <span className="ml-1 md:ml-2 px-1.5 md:px-2 py-0.5 rounded-full bg-secondary text-foreground text-xs">
                {historyJobs.length}
              </span>
            </button>
          </div>
        </motion.div>

        {/* Job Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {displayedJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="h-full" // Ensure equal height for motion container
            >
              <JobCard
                job={job}
                lockedBy={
                  // Show lock only if another device (not this session) holds it
                  locks[job.id] && !myLockedProtocols.has(job.id)
                    ? locks[job.id]
                    : undefined
                }
                onStart={() => handleStartJob(job)}
                onView={() => handleViewPdf(job)}
                onAnalyze={() => handleAnalyze(job)}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Empty state */}
        {displayedJobs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchQuery || dateRange
                ? "No se encontraron resultados"
                : `No hay trabajos ${activeTab === "pendientes" ? "pendientes" : "en el historial"}`}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery || dateRange
                ? `Intenta con otros términos o cambia el rango de fechas`
                : activeTab === "pendientes"
                  ? "Todos los trabajos han sido completados"
                  : "Aún no se han completado pruebas"}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
