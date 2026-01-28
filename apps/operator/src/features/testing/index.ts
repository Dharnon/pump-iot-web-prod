/**
 * Testing Feature - Public API
 * 
 * Feature-Based Architecture: Only export what other features need.
 * Everything else stays private to this feature.
 */

// Views (main entry points)
export { Cockpit } from '../../views/Cockpit';

// Hooks (business logic)
export { useCaptureLogic } from '../../hooks/useCaptureLogic';

// Context (if needed by parent)
export { TelemetryProvider, useTelemetry } from '../../contexts/TelemetryProvider';
export type { ControlState } from '../../contexts/TelemetryProvider';
