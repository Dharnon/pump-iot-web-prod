/**
 * API-related TypeScript types
 */

// Re-export types from API services
export type { 
  LoginRequest, 
  LoginResponse 
} from '../api/authService';

export type { 
  Test, 
  Banco 
} from '../api/testService';

export type { 
  PdfResponse 
} from '../api/pdfService';

export type { 
  Listado, 
  ImportResponse 
} from '../api/importService';
