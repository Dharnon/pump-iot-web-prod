/**
 * Base API Client
 * 
 * Provides core HTTP functionality for all service modules.
 * Centralizes error handling and request configuration.
 */

import { mockJobs, mockBancos, mockMotores } from './mockData';

const getBaseUrl = () => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      const url = process.env.NEXT_PUBLIC_API_URL || process.env.VITE_API_URL;
      if (url) return url;
    }
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      const url = import.meta.env.VITE_API_URL;
      if (url) return url;
    }
  } catch (e) { }
  return 'http://localhost:5002';
};

const API_BASE_URL = getBaseUrl();

// Flag to use mock data when API is unavailable
const USE_MOCK_DATA = true; // Set to false to use real API

/**
 * Generic fetch wrapper with centralized error handling.
 * Falls back to mock data when API is unavailable.
 * 
 * @template T - Expected response type
 * @param endpoint - API endpoint path
 * @param options - Fetch options
 * @returns Parsed JSON response
 * @throws Error if response is not OK
 */
export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  // Handle mock data for common endpoints
  if (USE_MOCK_DATA) {
    return handleMockEndpoint(endpoint) as Promise<T>;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

function handleMockEndpoint(endpoint: string): any {
  // Tests endpoint
  if (endpoint === '/api/tests' || endpoint === '/api/Tests') {
    return mockJobs.map(job => ({
      id: job.id,
      status: job.status === 'EN_PROCESO' ? 'IN_PROGRESS' : 
             job.status === 'OK' ? 'COMPLETED' : 
             job.status === 'KO' ? 'COMPLETED' : 'GENERATED',
      generalInfo: {
        pedido: job.orderId,
        cliente: job.client,
        modeloBomba: job.model,
        ordenDeTrabajo: job.protocolSpec?.workOrder,
        numeroBombas: job.protocolSpec?.pumpQuantity || 1,
      },
      numeroProtocolo: parseInt(job.id),
      bancoId: job.bancoId || 1,
    }));
  }

  // Bancos endpoint
  if (endpoint === '/api/bancos' || endpoint === '/api/Bancos') {
    return mockBancos;
  }

  // Motores endpoint
  if (endpoint.includes('/api/Motores/banco/')) {
    const bankId = parseInt(endpoint.split('/').pop() || '1');
    return mockMotores.filter(m => m.bancoId === bankId);
  }

  // Single test endpoint
  const testMatch = endpoint.match(/\/api\/tests\/(.+)/i);
  if (testMatch) {
    const testId = testMatch[1];
    const job = mockJobs.find(j => j.id === testId);
    if (job) {
      return {
        id: job.id,
        status: job.status === 'EN_PROCESO' ? 'IN_PROGRESS' : 
               job.status === 'OK' ? 'COMPLETED' : 
               job.status === 'KO' ? 'COMPLETED' : 'GENERATED',
        generalInfo: {
          pedido: job.orderId,
          cliente: job.client,
          modeloBomba: job.model,
          ordenDeTrabajo: job.protocolSpec?.workOrder,
          numeroBombas: job.protocolSpec?.pumpQuantity || 1,
          pedidoCliente: job.protocolSpec?.customerOrder,
        },
        numeroProtocolo: parseInt(job.id),
        bancoId: job.bancoId || 1,
        pdfData: {},
      };
    }
  }

  console.warn(`No mock data for endpoint: ${endpoint}`);
  return [];
}

/**
 * Fetch wrapper for form data (file uploads).
 * 
 * @template T - Expected response type
 * @param endpoint - API endpoint path
 * @param formData - Form data to send
 * @returns Parsed JSON response
 */
export async function fetchFormData<T>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch wrapper for binary data (PDFs, images, etc).
 */
export async function fetchBlob(endpoint: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }
  return response.blob();
}

/**
 * SWR fetcher function
 */
export const swrFetcher = (url: string) => fetchApi<any>(url);

export { API_BASE_URL };
