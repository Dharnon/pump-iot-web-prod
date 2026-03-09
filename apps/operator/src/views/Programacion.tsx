import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useJob } from "@/contexts/JobProvider";
import { useUser, BankId } from "@/contexts/UserProvider";
import { useNavigation } from "@/contexts/NavigationProvider";
import { FloatingSidebar } from "@/components/testing/FloatingSidebar";
import { SettingsModal } from "@/views/SettingsModal";
import { Settings, Home, BarChart3, Wrench, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// All 5 banks — same as Supervisor
const BANKS: { id: BankId; bankNum: number; label: string }[] = [
  { id: "A", bankNum: 1, label: "Banco A" },
  { id: "B", bankNum: 2, label: "Banco B" },
  { id: "C", bankNum: 3, label: "Banco C" },
  { id: "D", bankNum: 4, label: "Banco D" },
  { id: "E", bankNum: 5, label: "Banco E" },
];

export const Programacion: React.FC = () => {
  const { jobs, locks, myLockedProtocols } = useJob();
  const { user } = useUser();
  const { setCurrentView } = useNavigation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  // Build columnar data sorted by orden — mirrors Supervisor's boardData
  const columnData = useMemo(() => {
    return BANKS.map(({ id, bankNum, label }) => {
      const bankJobs = jobs
        .filter(
          (j) =>
            j.bancoId === bankNum &&
            (j.status === "GENERADA" || j.status === "EN_PROCESO"),
        )
        .sort((a, b) => (a.orden || 0) - (b.orden || 0));

      return {
        id,
        bankNum,
        label,
        isUserBank: id === user.assignedBank,
        jobs: bankJobs,
        total: bankJobs.length,
      };
    });
  }, [jobs, user.assignedBank]);

  const stats = useMemo(() => {
    const allVisible = columnData.flatMap((c) => c.jobs);
    return {
      enBanco: allVisible.filter((j) => j.status === "GENERADA").length,
      enProceso: allVisible.filter((j) => j.status === "EN_PROCESO").length,
    };
  }, [columnData]);

  const handleLogout = () => {
    toast.success("Sesión cerrada correctamente");
    setIsLogoutDialogOpen(false);
  };

  const sidebarItems = [
    { icon: Home, label: "Inicio", onClick: () => setCurrentView("dashboard") },
    {
      icon: Wrench,
      label: "Programación",
      active: true,
      onClick: () => setCurrentView("programacion"),
    },
    {
      icon: BarChart3,
      label: "Reportes",
      onClick: () => setCurrentView("analytics"),
    },
    {
      icon: Settings,
      label: "Configuración",
      onClick: () => setIsSettingsOpen(true),
    },
    {
      icon: LogOut,
      label: "Salir",
      onClick: () => setIsLogoutDialogOpen(true),
    },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <FloatingSidebar items={sidebarItems} />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Header — same compact style as Supervisor */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-4 py-3 border-b shrink-0 bg-background ml-14 md:ml-16"
      >
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-medium text-foreground">Programación</h1>
          <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-semibold rounded-full border border-primary/30">
            {user.name} · {`Banco ${user.assignedBank}`}
          </span>
        </div>

        {/* Stats — mirrors Supervisor header */}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            En banco:{" "}
            <strong className="text-foreground">{stats.enBanco}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            En prueba:{" "}
            <strong className="text-foreground">{stats.enProceso}</strong>
          </span>
        </div>
      </motion.div>

      {/* Kanban Board — all 5 banks, same column layout as Supervisor */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-2 pl-16 md:pl-18">
        <div className="flex gap-3 h-full min-w-max">
          <AnimatePresence>
            {columnData.map((col, colIdx) => (
              <motion.div
                key={col.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: colIdx * 0.05 }}
                className={cn(
                  "h-full min-w-[180px] flex-1 max-w-[350px] flex flex-col rounded-xl border transition-all",
                  col.isUserBank
                    ? "bg-primary/5 border-primary/30 shadow-md shadow-primary/10"
                    : "bg-secondary/20 dark:bg-slate-900/50 border-border/50",
                )}
              >
                {/* Column Header — mirrors Supervisor */}
                <div
                  className={cn(
                    "px-3 py-2 border-b rounded-t-xl",
                    col.isUserBank
                      ? "bg-primary/10 border-primary/20"
                      : "border-border/50",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          col.isUserBank
                            ? "text-primary"
                            : "text-slate-700 dark:text-slate-200",
                        )}
                      >
                        {col.label}
                      </span>
                      {col.isUserBank && (
                        <span className="px-1 py-0.5 bg-primary text-[8px] font-medium text-primary-foreground rounded hidden sm:inline-block">
                          TU BANCO
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {col.total}
                    </span>
                  </div>
                </div>

                {/* Cards List — same card style as Supervisor */}
                <div className="p-2 h-[calc(100%-50px)] overflow-y-auto space-y-1.5">
                  <AnimatePresence>
                    {col.jobs.map((job, idx) => {
                      const isInProgress = job.status === "EN_PROCESO";
                      const isLocked =
                        locks[job.id] && !myLockedProtocols.has(job.id);
                      const lockedBy = isLocked ? locks[job.id] : null;

                      const statusDot = isInProgress
                        ? "bg-blue-500"
                        : "bg-amber-500";

                      return (
                        <motion.div
                          key={job.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ delay: idx * 0.03 }}
                          className={cn(
                            "block bg-white dark:bg-slate-800 border rounded-md p-2.5 transition-all relative overflow-hidden",
                            isLocked
                              ? "border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                              : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50",
                          )}
                        >
                          {/* Lock indicator bar */}
                          {isLocked && (
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 animate-pulse" />
                          )}

                          {/* Card header */}
                          <div className="flex items-start justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  statusDot,
                                  isLocked && "animate-ping",
                                )}
                              />
                              <span className="text-[10px] font-mono text-slate-400">
                                #{job.id}
                              </span>
                              {isLocked && (
                                <span className="text-[9px] font-medium text-blue-500 animate-pulse">
                                  LOCKED ({lockedBy})
                                </span>
                              )}
                            </div>
                            {isInProgress && (
                              <span className="text-[9px] px-1.5 py-0.5 bg-blue-500 text-white rounded">
                                En prueba
                              </span>
                            )}
                          </div>

                          {/* Card body — same fields as Supervisor */}
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                            {job.client || "-"}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {job.model || "-"}
                          </p>
                          {job.protocolSpec?.workOrder && (
                            <p className="text-[10px] font-mono text-slate-400 mt-1">
                              OT: {job.protocolSpec.workOrder}
                            </p>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {col.jobs.length === 0 && (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-[11px] text-slate-400 dark:text-slate-600">
                        Sin pruebas
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
