/**
 * Contexts Barrel Export
 * 
 * Provides a clean public API for all context providers and hooks.
 * Import from '@/contexts' instead of individual files.
 */

// Navigation
export { NavigationProvider, useNavigation } from './NavigationProvider';
export type { AppView } from './NavigationProvider';

// Jobs
export { JobProvider, useJob } from './JobProvider';
export type { Job, JobStatus, TestConfig, TestPoint, TelemetryData, TestResults } from './JobProvider';

// Telemetry
export { TelemetryProvider, useTelemetry } from './TelemetryProvider';
export type { ControlState } from './TelemetryProvider';

// Legacy (deprecated - will be removed after migration is complete)
// export { TestingProvider, useTesting } from './TestingContext';
