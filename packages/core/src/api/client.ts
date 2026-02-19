/**
 * Base API Client
 * 
 * Provides core HTTP functionality for all service modules.
 * Centralizes error handling and request configuration.
 */

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

/**
 * Generic fetch wrapper with centralized error handling.
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
