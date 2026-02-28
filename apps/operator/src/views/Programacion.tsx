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
    return BANKS.map(bankId => {
      const bankNumber = { A: 1, B: 2, C: 3, D: 4, E: 5 }[bankId];
      const bankJobs = jobs.filter(j => j.bancoId === bankNumber);
      
      return {
        id: bankId,
        label: BANK_LABELS[bankId],
        isUserBank: bankId === user.assignedBank,
        jobs: {
          enBanco: bankJobs.filter(j => j.status === 'GENERADA'),
          enProceso: bankJobs.filter(j => j.status === 'EN_PROCESO'),
          completadas: bankJobs.filter(j => j.status === 'OK' || j.status === 'KO'),
        },
        total: bankJobs.length,
      };
    });
  }, [jobs, user.assignedBank]);

  const totalStats = useMemo(() => ({
    enBanco: jobs.filter(j => j.status === 'GENERADA').length,
    enProceso: jobs.filter(j => j.status === 'EN_PROCESO').length,
    completadas: jobs.filter(j => j.status === 'OK' || j.status === 'KO').length,
  }), [jobs]);

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
    { icon: Wrench, label: 'Programación', active: true, onClick: () => {} },
    { icon: BarChart3, label: 'Reportes', onClick: () => setCurrentView('analytics') },
    { icon: Settings, label: 'Ajustes', onClick: () => setIsSettingsOpen(true) },
    { icon: LogOut, label: 'Salir', onClick: () => setIsLogoutDialogOpen(true) },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      <FloatingSidebar items={sidebarItems} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 py-2 border-b shrink-0 bg-background"
      >
        <div className="ml-14 md:ml-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full border border-primary/30">
              {BANK_LABELS[user.assignedBank]}
            </span>
            <div>
              <h1 className="text-lg font-bold text-foreground">Programación</h1>
              <p className="text-[10px] text-muted-foreground">{user.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-card rounded-full border border-border">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-xs font-medium">{totalStats.enBanco}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-card rounded-full border border-border">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-medium">{totalStats.enProceso}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-card rounded-full border border-border">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs font-medium">{totalStats.completadas}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Kanban - All 5 Banks */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-2">
        <div className="flex gap-2 h-full px-2 ml-14 md:ml-18 pr-2">
          {bankData.map((bank) => (
            <motion.div
              key={bank.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "w-56 lg:w-60 flex-shrink-0 flex flex-col rounded-2xl border transition-all h-full",
                bank.isUserBank 
                  ? "bg-primary/5 border-primary/30 shadow-lg shadow-primary/10" 
                  : "bg-card/50 border-border/50"
              )}
            >
              {/* Column Header */}
              <div className={cn(
                "px-3 py-2 rounded-t-2xl border-b",
                bank.isUserBank ? "bg-primary/10 border-primary/20" : "bg-muted/30"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-bold",
                      bank.isUserBank ? "text-primary" : "text-foreground"
                    )}>
                      {bank.label}
                    </span>
                    {bank.isUserBank && (
                      <span className="px-1.5 py-0.5 bg-primary text-[10px] font-medium text-primary-foreground rounded">
                        TU BANCO
                      </span>
                    )}
                  </div>
                  <span className={cn(
                    "text-xs font-mono px-2 py-0.5 rounded-full",
                    bank.isUserBank ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {bank.total}
                  </span>
                </div>
                
                {/* Mini stats */}
                <div className="flex items-center gap-2 mt-2 text-[10px]">
                  <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    <span className="text-muted-foreground">{bank.jobs.enBanco.length}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-muted-foreground">{bank.jobs.enProceso.length}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-muted-foreground">{bank.jobs.completadas.length}</span>
                  </span>
                </div>
              </div>

              {/* Cards List */}
              <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5 min-h-0">
                <AnimatePresence>
                  {bank.jobs.enProceso.map((job, idx) => {
                    const config = getStatusConfig(job.status);
                    return (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: idx * 0.02 }}
                        className={cn(
                          "p-2 rounded-lg transition-all",
                          "bg-card border border-border"
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className={cn("flex items-center gap-1", config.bg, "text-white px-1 py-0.5 rounded text-[9px] font-medium")}>
                            <div className={cn("w-1 h-1 rounded-full", config.dot)} />
                            {config.label}
                          </div>
                          <span className="text-[9px] font-mono text-muted-foreground">#{job.id}</span>
                        </div>
                        <p className="text-xs font-semibold truncate mb-0.5">{job.client}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{job.model}</p>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                
                <AnimatePresence>
                  {bank.jobs.enBanco.map((job, idx) => {
                    const config = getStatusConfig(job.status);
                    return (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: (bank.jobs.enProceso.length + idx) * 0.02 }}
                        className={cn(
                          "p-2 rounded-lg transition-all",
                          "bg-card/60 border border-border/50"
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className={cn("flex items-center gap-1", config.bg, "text-white px-1 py-0.5 rounded text-[9px] font-medium")}>
                            <div className={cn("w-1 h-1 rounded-full", config.dot)} />
                            {config.label}
                          </div>
                          <span className="text-[9px] font-mono text-muted-foreground">#{job.id}</span>
                        </div>
                        <p className="text-xs font-semibold truncate mb-0.5">{job.client}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{job.model}</p>
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
                          "p-2 rounded-lg transition-all opacity-70",
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
                        <p className="text-xs font-semibold truncate mb-0.5">{job.client}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{job.model}</p>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {bank.total === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Wrench className="w-8 h-8 text-muted-foreground/30 mb-2" />
                    <p className="text-xs text-muted-foreground">Sin pruebas</p>
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
