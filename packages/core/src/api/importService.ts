/**
 * Import Service
 * 
 * Handles Excel/CSV file import operations.
 * Single Responsibility: File import and listing management.
 */

import { fetchApi, fetchFormData, API_BASE_URL } from './client';

export interface Listado {
  id: number;
  pedido: string;
  cliente: string;
  tipoDeBomba: string;
  ordenDeTrabajo: string;
  numeroBombas: number;
}

export interface ImportResponse {
  success: boolean;
  count: number;
}

/**
 * Gets production listings (staging data from last import).
 * 
 * @returns Array of imported listings
 */
export async function getListados(): Promise<Listado[]> {
  return fetchApi<Listado[]>('/api/Import/listados');
}

/**
 * Gets sheet names from an Excel file.
 * 
 * @param file - Excel file
 * @returns List of sheet names and filename
 */
export async function getExcelSheets(
  file: File
): Promise<{ sheets: string[]; filename: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/Import/excel/sheets`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to read Excel sheets');
  }

  return response.json();
}

/**
 * Imports an Excel file to the system.
 * Replaces existing data in the staging table.
 * 
 * @param file - Excel file
 * @param sheetName - Name of the sheet to import
 * @returns Import result with record count
 */
export async function importExcel(
  file: File,
  sheetName: string
): Promise<ImportResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('sheetName', sheetName);

  return fetchFormData<ImportResponse>('/api/Import/excel', formData);
}

/**
 * Imports a CSV file to the system.
 * 
 * @param file - CSV file
 * @returns Import result with record count
 */
export async function importCsv(file: File): Promise<ImportResponse> {
  const formData = new FormData();
  formData.append('file', file);

  return fetchFormData<ImportResponse>('/api/Import/csv', formData);
}
