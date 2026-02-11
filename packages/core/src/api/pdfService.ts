/**
 * PDF Service
 * 
 * Handles PDF file upload, download, and extraction.
 * Single Responsibility: PDF file operations.
 */

import { fetchFormData, fetchBlob, API_BASE_URL } from './client';

export interface PdfResponse {
  numeroprotocolo: number;
  success: boolean;
}

/**
 * Uploads a PDF file to the database.
 * Associates the PDF with a protocol number.
 * 
 * @param numeroProtocolo - Protocol identifier
 * @param file - PDF file to upload
 * @returns Upload confirmation
 */
export async function uploadPdf(
  numeroProtocolo: number,
  file: File
): Promise<PdfResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('numeroProtocolo', numeroProtocolo.toString());

  return fetchFormData<PdfResponse>('/api/pdf/upload', formData);
}

/**
 * Downloads a PDF file for a given protocol.
 * 
 * @param id - Protocol ID
 * @returns PDF file as Blob
 */
export async function getTestPdf(id: number | string): Promise<Blob> {
  return fetchBlob(`/api/pdf/${id}`);
}

/**
 * Analyzes a PDF file to extract test data.
 * Uses OCR/parsing service on the backend.
 * 
 * @param file - PDF file to analyze
 * @returns Extracted data fields
 */
export async function analyzePdf(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/pdf/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('PDF analysis failed');
  }

  return response.json();
}
