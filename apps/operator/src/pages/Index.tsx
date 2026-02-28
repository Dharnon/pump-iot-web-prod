/**
 * Index.tsx - Main entry point for Operator application
 * 
 * REFACTORED: Now uses isolated providers instead of monolithic TestingContext.
 * 
 * Provider Hierarchy:
 * - NavigationProvider: View state (infrequent updates)
 * - UserProvider: User-bank association
 * - JobProvider: Job selection and test config (infrequent updates)
 * - TelemetryProvider: Real-time data (500ms updates, ISOLATED)
 * 
 * This structure follows SOLID SRP and Vercel's rerender optimization guidelines.
 */
import React from 'react';
import { AnimatePresence } from 'framer-motion';

// New isolated providers
import { NavigationProvider, useNavigation } from '@/contexts/NavigationProvider';
import { UserProvider } from '@/contexts/UserProvider';
import { JobProvider, useJob } from '@/contexts/JobProvider';
import { TelemetryProvider } from '@/contexts/TelemetryProvider';

// Views
import { Dashboard } from '@/views/Dashboard';
import { SetupModal } from '@/views/SetupModal';
import { Cockpit } from '@/views/Cockpit';
import { Analytics } from '@/views/Analytics';
import { Programacion } from '@/views/Programacion';

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
    <div className="h-full">
      <TelemetryProvider isActive={isTelemetryActive} testConfig={testConfig}>
        <AnimatePresence mode="wait">
          {currentView === 'dashboard' && <Dashboard key="dashboard" />}
          {currentView === 'setup' && <div className="h-full"><SetupModal key="setup" /></div>}
          {currentView === 'cockpit' && <Cockpit key="cockpit" />}
          {currentView === 'analytics' && <Analytics key="analytics" />}
          {currentView === 'programacion' && <Programacion key="programacion" />}
        </AnimatePresence>
      </TelemetryProvider>
    </div>
  );
};

/**
 * Index - Root component with provider composition.
 * 
 * Provider order matters:
 * 1. NavigationProvider (outermost - used by all)
 * 2. UserProvider (user-bank association)
 * 3. JobProvider (middle - used by cockpit/analytics)
 * 4. TelemetryProvider (innermost - only in AppContent, only active in cockpit)
 */
const Index: React.FC = () => {
  return (
    <NavigationProvider>
      <UserProvider>
        <JobProvider>
          <AppContent />
        </JobProvider>
      </UserProvider>
    </NavigationProvider>
  );
};

export default Index;
