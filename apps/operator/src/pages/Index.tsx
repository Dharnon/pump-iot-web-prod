/**
 * Index.tsx - Main entry point for Operator application
 * 
 * REFACTORED: Now uses isolated providers instead of monolithic TestingContext.
 * 
 * Provider Hierarchy:
 * - NavigationProvider: View state (infrequent updates)
 * - JobProvider: Job selection and test config (infrequent updates)
 * - TelemetryProvider: Real-time data (500ms updates, ISOLATED)
 * 
 * This structure follows SOLID SRP and Vercel's rerender optimization guidelines.
 */
import React from 'react';
import { AnimatePresence } from 'framer-motion';

// New isolated providers
import { NavigationProvider, useNavigation } from '@/contexts/NavigationProvider';
import { JobProvider, useJob } from '@/contexts/JobProvider';
import { TelemetryProvider } from '@/contexts/TelemetryProvider';

// Views
import { Dashboard } from '@/views/Dashboard';
import { SetupModal } from '@/views/SetupModal';
import { Cockpit } from '@/views/Cockpit';
import { Analytics } from '@/views/Analytics';

/**
 * AppContent - Renders current view based on navigation state.
 * 
 * TelemetryProvider is placed here so we can pass isActive based on currentView.
 * This ensures telemetry simulation only runs when in 'cockpit' view.
 */
const AppContent: React.FC = () => {
  const { currentView } = useNavigation();
  const { testConfig } = useJob();

  // Only activate telemetry in cockpit view
  const isTelemetryActive = currentView === 'cockpit';

  return (
    <TelemetryProvider isActive={isTelemetryActive} testConfig={testConfig}>
      <AnimatePresence mode="wait">
        {currentView === 'dashboard' && <Dashboard key="dashboard" />}
        {currentView === 'setup' && <SetupModal key="setup" />}
        {currentView === 'cockpit' && <Cockpit key="cockpit" />}
        {currentView === 'analytics' && <Analytics key="analytics" />}
      </AnimatePresence>
    </TelemetryProvider>
  );
};

/**
 * Index - Root component with provider composition.
 * 
 * Provider order matters:
 * 1. NavigationProvider (outermost - used by all)
 * 2. JobProvider (middle - used by cockpit/analytics)
 * 3. TelemetryProvider (innermost - only in AppContent, only active in cockpit)
 */
const Index: React.FC = () => {
  return (
    <NavigationProvider>
      <JobProvider>
        <AppContent />
      </JobProvider>
    </NavigationProvider>
  );
};

export default Index;
