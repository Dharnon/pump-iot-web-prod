/**
 * Jobs Feature - Public API
 * 
 * Manages job selection, configuration, and data display.
 */

// Views
export { Dashboard } from '../../views/Dashboard';
export { SetupModal } from '../../views/SetupModal';

// Context
export { JobProvider, useJob } from '../../contexts/JobProvider';
export type { Job, JobStatus, TestConfig, TestPoint, TelemetryData } from '../../contexts/JobProvider';
