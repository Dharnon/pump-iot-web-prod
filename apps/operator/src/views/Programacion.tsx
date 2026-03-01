import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJob } from '@/contexts/JobProvider';
import { useUser, BankId } from '@/contexts/UserProvider';
import { useNavigation } from '@/contexts/NavigationProvider';
import { FloatingSidebar } from '@/components/testing/FloatingSidebar';
import { SettingsModal } from '@/views/SettingsModal';
import { Settings, Home, BarChart3, Wrench, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const BANKS: BankId[] = ['A', 'B', 'C', 'D', 'E'];
const BANK_LABELS: Record<BankId, string> = {
  A: 'Banco A',
  B: 'Banco B',
  C: 'Banco C',
  D: 'Banco D',
  E: 'Banco E',
};

export const Programacion: React.FC = () => {
  const { jobs } = useJob();
  const { user } = useUser();
  const { setCurrentView } = useNavigation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const bankData = useMemo(() => {
    // Map bank letter to number
    const bankLetterToNumber: Record<BankId, number> = { A: 1, B: 2, C: 3, D: 4, E: 5 };
    const userBankNumber = bankLetterToNumber[user.assignedBank];

    return BANKS.map(bankId => {
      const bankNumber = { A: 1, B: 2, C: 3, D: 4, E: 5 }[bankId];
      // Filter: Only show jobs from user's assigned bench (operator can only see their bench's tests)
      const bankJobs = jobs.filter(j => j.bancoId === bankNumber && j.bancoId === userBankNumber);

      return {
        id: bankId,
        label: BANK_LABELS[bankId],
        isUserBank: bankId === user.assignedBank,
        jobs: {
          // Only show GENERADA (EN_BANCO) and EN_PROCESO (IN_PROGRESS) - no completed tests
          enBanco: bankJobs.filter(j => j.status === 'GENERADA'),
          enProceso: bankJobs.filter(j => j.status === 'EN_PROCESO'),
          completadas: [], // Don't show completed jobs in operator view
        },
        total: bankJobs.length,
      };
    });
  }, [jobs, user.assignedBank]);

  const totalStats = useMemo(() => {
    // Map bank letter to number
    const bankLetterToNumber: Record<BankId, number> = { A: 1, B: 2, C: 3, D: 4, E: 5 };
    const userBankNumber = bankLetterToNumber[user.assignedBank];
    // Filter by user's assigned bench
    const userBankJobs = jobs.filter(j => j.bancoId === userBankNumber);
    return {
      enBanco: userBankJobs.filter(j => j.status === 'GENERADA').length,
      enProceso: userBankJobs.filter(j => j.status === 'EN_PROCESO').length,
      completadas: 0, // Don't show completed in operator view
    };
  }, [jobs, user.assignedBank]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'GENERADA':
        return { bg: 'bg-orange-500', label: 'Pendiente', dot: 'bg-orange-400' };
      case 'EN_PROCESO':
        return { bg: 'bg-blue-500', label: 'En Prueba', dot: 'bg-blue-400' };
      case 'OK':
        return { bg: 'bg-green-500', label: 'OK', dot: 'bg-green-400' };
      case 'KO':
        return { bg: 'bg-red-500', label: 'Fallo', dot: 'bg-red-400' };
      default:
        return { bg: 'bg-slate-500', label: status, dot: 'bg-slate-400' };
    }
  };

  const handleLogout = () => {
    toast.success('Sesión cerrada correctamente');
    setIsLogoutDialogOpen(false);
  };

  const sidebarItems = [
    { icon: Home, label: 'Inicio', onClick: () => setCurrentView('dashboard') },
    { icon: Wrench, label: 'Programación', active: true, onClick: () => setCurrentView('programacion') },
    { icon: BarChart3, label: 'Reportes', onClick: () => setCurrentView('analytics') },
    { icon: Settings, label: 'Configuración', onClick: () => setCurrentView('setup') },
    { icon: LogOut, label: 'Salir', onClick: () => setIsLogoutDialogOpen(true) },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      <FloatingSidebar items={sidebarItems} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Header - Compact for all screen sizes */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-2 md:px-3 py-1.5 border-b shrink-0 bg-background"
      >
        <div className="ml-14 md:ml-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-semibold rounded-full border border-primary/30 shrink-0">
              {BANK_LABELS[user.assignedBank]}
            </span>
            <div className="min-w-0">
              <h1 className="text-sm md:text-base font-bold text-foreground truncate">Programación</h1>
              <p className="text-[9px] md:text-[10px] text-muted-foreground truncate">{user.name}</p>
            </div>
          </div>

          {/* Stats - Responsive: Only show "En Prueba" to save space */}
          <div className="flex items-center gap-1 md:gap-2">
            <div className="flex items-center gap-1 px-2 py-1 bg-card rounded-full border border-border">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-medium">{totalStats.enProceso}</span>
              <span className="hidden sm:inline text-[10px] text-muted-foreground">En prueba</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Kanban - All 5 Banks with compact columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-1 md:p-1.5">
        <div className="flex gap-1 h-full px-1 ml-12 md:ml-14 pr-1">
          {bankData.map((bank) => (
            <motion.div
              key={bank.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                // Compact column widths to fit all 5 columns on typical laptop screens
                "w-40 sm:w-44 md:w-48 lg:w-52 xl:w-56 flex-shrink-0 flex flex-col rounded-xl border transition-all h-full",
                bank.isUserBank
                  ? "bg-primary/5 border-primary/30 shadow-lg shadow-primary/10"
                  : "bg-card/50 border-border/50"
              )}
            >
              {/* Column Header - Compact */}
              <div className={cn(
                "px-2 py-1.5 rounded-t-xl border-b",
                bank.isUserBank ? "bg-primary/10 border-primary/20" : "bg-muted/30"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={cn(
                      "text-xs font-bold truncate",
                      bank.isUserBank ? "text-primary" : "text-foreground"
                    )}>
                      {bank.label}
                    </span>
                    {bank.isUserBank && (
                      <span className="px-1 py-0.5 bg-primary text-[8px] font-medium text-primary-foreground rounded shrink-0 hidden sm:inline-block">
                        TU BANCO
                      </span>
                    )}
                  </div>
                  <span className={cn(
                    "text-[10px] font-mono px-1.5 py-0.5 rounded-full shrink-0",
                    bank.isUserBank ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {bank.total}
                  </span>
                </div>

                {/* Compact mini stats - only show En Proceso */}
                <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                  <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-muted-foreground">{bank.jobs.enProceso.length}</span>
                  </span>
                </div>
              </div>

              {/* Cards List - Compact layout */}
              <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5 min-h-0 scroll-smooth">
                <AnimatePresence>
                  {bank.jobs.enProceso.map((job, idx) => {
                    const config = getStatusConfig(job.status);
                    const isFirstCard = idx === 0;
                    return (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: idx * 0.02 }}
                        className={cn(
                          "p-1.5 rounded-md transition-all",
                          "bg-card border border-border hover:border-primary/30 hover:shadow-md"
                        )}
                      >
                        {isFirstCard && (
                          <div className="flex items-center justify-between mb-1">
                            <div className={cn("flex items-center gap-1", config.bg, "text-white px-1 py-0.5 rounded text-[9px] font-medium")}>
                              <div className={cn("w-1 h-1 rounded-full", config.dot)} />
                              {config.label}
                            </div>
                            <span className="text-[9px] font-mono text-muted-foreground">#{job.id}</span>
                          </div>
                        )}
                        <p className="text-[10px] font-semibold truncate mb-0.5">{job.client}</p>
                        <p className="text-[9px] text-muted-foreground truncate">{job.model}</p>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                <AnimatePresence>
                  {bank.jobs.enBanco.map((job, idx) => {
                    const config = getStatusConfig(job.status);
                    const isFirstCard = bank.jobs.enProceso.length === 0 && idx === 0;
                    return (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: (bank.jobs.enProceso.length + idx) * 0.02 }}
                        className={cn(
                          "p-1.5 rounded-md transition-all",
                          "bg-card/60 border border-border/50 hover:border-primary/20 hover:shadow-sm"
                        )}
                      >
                        {isFirstCard && (
                          <div className="flex items-center justify-between mb-1">
                            <div className={cn("flex items-center gap-1", config.bg, "text-white px-1 py-0.5 rounded text-[9px] font-medium")}>
                              <div className={cn("w-1 h-1 rounded-full", config.dot)} />
                              {config.label}
                            </div>
                            <span className="text-[9px] font-mono text-muted-foreground">#{job.id}</span>
                          </div>
                        )}
                        <p className="text-[10px] font-semibold truncate mb-0.5">{job.client}</p>
                        <p className="text-[9px] text-muted-foreground truncate">{job.model}</p>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                <AnimatePresence>
                  {bank.jobs.completadas.map((job, idx) => {
                    const config = getStatusConfig(job.status);
                    return (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: (bank.jobs.enProceso.length + bank.jobs.enBanco.length + idx) * 0.02 }}
                        className={cn(
                          "p-1.5 rounded-md transition-all opacity-70 hover:opacity-90",
                          "bg-muted/20 border border-border/30"
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className={cn("flex items-center gap-1", config.bg, "text-white px-1 py-0.5 rounded text-[9px] font-medium")}>
                            <div className={cn("w-1 h-1 rounded-full", config.dot)} />
                            {config.label}
                          </div>
                          <span className="text-[9px] font-mono text-muted-foreground">#{job.id}</span>
                        </div>
                        <p className="text-[10px] font-semibold truncate mb-0.5">{job.client}</p>
                        <p className="text-[9px] text-muted-foreground truncate">{job.model}</p>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {bank.total === 0 && (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <div className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center mb-1">
                      <span className="text-sm text-muted-foreground/50">-</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Sin pruebas</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
