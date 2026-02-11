/**
 * Core API Package - Public Exports
 * 
 * Barrel export for all API services.
 * Consumers import from '@pump-iot/core/api' instead of individual files.
 */

// Base client
export { fetchApi, swrFetcher, API_BASE_URL } from './client';

// Auth service
export { login, validateToken, logout } from './authService';
export type { LoginRequest, LoginResponse } from './authService';

// Test service
export { 
  getTests, 
  getTestById, 
  patchTest, 
  getBancos, 
  generateProtocols 
} from './testService';
export type { Test, Banco } from './testService';

// PDF service
export { uploadPdf, getTestPdf, analyzePdf } from './pdfService';
export type { PdfResponse } from './pdfService';

// Import service
export { 
  getListados, 
  getExcelSheets, 
  importExcel, 
  importCsv 
} from './importService';
export type { Listado, ImportResponse } from './importService';
