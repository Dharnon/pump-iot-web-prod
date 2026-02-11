/**
 * View Mode Types and Constants
 * 
 * Defines the different view modes for test detail pages.
 * Used to configure behavior between pending tests and generated protocols.
 */

export type ViewMode = 'PENDING' | 'GENERATED';

export interface ViewConfig {
  mode: ViewMode;
  /** Whether fields are editable */
  editable: boolean;
  /** Whether to show PDF upload/extraction UI */
  showPdfUpload: boolean;
  /** Whether to show finalize/save button */
  showSaveButton: boolean;
  /** Whether to show motor and details sections */
  showExtendedSections: boolean;
  /** Whether all fields can be edited (including readonly in pending) */
  allFieldsEditable: boolean;
}

/**
 * Configuration for PENDING view mode (test/[id] route)
 * - Used for tests that haven't been generated yet
 * - Shows PDF upload and extraction
 * - Limited editing (only extracted data)
 * - Has "Finalize" button to generate protocol
 */
export const PENDING_VIEW_CONFIG: ViewConfig = {
  mode: 'PENDING',
  editable: true,
  showPdfUpload: true,
  showSaveButton: true,
  showExtendedSections: false, // Don't show motor/details for pending
  allFieldsEditable: false,
};

/**
 * Configuration for GENERATED view mode (protocolo/[id] route)
 * - Used for already generated protocols
 * - Shows existing PDF
 * - All fields are editable
 * - Has "Save" button to update protocol data
 */
export const GENERATED_VIEW_CONFIG: ViewConfig = {
  mode: 'GENERATED',
  editable: true,
  showPdfUpload: false,
  showSaveButton: true,
  showExtendedSections: true, // Show motor/details
  allFieldsEditable: true, // All fields can be edited
};

/**
 * Get view configuration based on mode
 */
export function getViewConfig(mode: ViewMode): ViewConfig {
  return mode === 'PENDING' ? PENDING_VIEW_CONFIG : GENERATED_VIEW_CONFIG;
}
