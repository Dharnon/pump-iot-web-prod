/**
 * Dashboard.tsx - Refactored to use isolated providers
 * 
 * Changes:
 * - useTesting() → useJob() + useNavigation()
 * - setCapturedPoints moved to TelemetryProvider (used via hook in Analytics)
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { JobCard } from '@/components/testing/JobCard';
import { FloatingSidebar } from '@/components/testing/FloatingSidebar';
import { useJob, Job } from '@/contexts/JobProvider';
import { useNavigation } from '@/contexts/NavigationProvider';
import { cn } from '@/lib/utils';

type TabType = 'pendientes' | 'historial';

export const Dashboard: React.FC = () => {
  const { jobs, selectJob, setTestConfig } = useJob();
  const { setCurrentView } = useNavigation();
  const [activeTab, setActiveTab] = useState<TabType>('pendientes');

  const pendingJobs = jobs.filter(job => job.status === 'GENERADA' || job.status === 'EN_PROCESO');
  const historyJobs = jobs.filter(job => job.status === 'OK' || job.status === 'KO');

  const displayedJobs = activeTab === 'pendientes' ? pendingJobs : historyJobs;

  const handleStartJob = (job: Job) => {
    selectJob(job);
    setCurrentView('setup');
  };

  const handleViewOrAnalyze = (job: Job) => {
    selectJob(job);
    // Load historical test results if available
    if (job.testResults) {
      setTestConfig(job.testResults.testConfig);
    }
    setCurrentView('analytics');
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <FloatingSidebar />

      <div className="ml-16 md:ml-20 lg:ml-24 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Banco de Pruebas
          </h1>
          <p className="text-muted-foreground">
            Gestione y ejecute pruebas de bombas hidráulicas
          </p>
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
              onClick={() => setActiveTab('pendientes')}
              className={cn(
                "px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-sm font-semibold transition-all",
                activeTab === 'pendientes'
                  ? "gradient-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Pendientes
              <span className="ml-1 md:ml-2 px-1.5 md:px-2 py-0.5 rounded-full bg-white/20 text-xs">
                {pendingJobs.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('historial')}
              className={cn(
                "px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-sm font-semibold transition-all",
                activeTab === 'historial'
                  ? "gradient-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Historial
              <span className="ml-1 md:ml-2 px-1.5 md:px-2 py-0.5 rounded-full bg-black/10 text-xs">
                {historyJobs.length}
              </span>
            </button>
          </div>
        </motion.div>

        {/* Job Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
        >
          {displayedJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <JobCard
                job={job}
                onStart={() => handleStartJob(job)}
                onView={() => handleViewOrAnalyze(job)}
                onAnalyze={() => handleViewOrAnalyze(job)}
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
              No hay trabajos {activeTab === 'pendientes' ? 'pendientes' : 'en el historial'}
            </h3>
            <p className="text-muted-foreground">
              {activeTab === 'pendientes'
                ? 'Todos los trabajos han sido completados'
                : 'Aún no se han completado pruebas'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
