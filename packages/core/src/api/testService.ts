/**
 * Test Service
 * 
 * Manages pump test CRUD operations.
 * Single Responsibility: Test data management.
 */

import { fetchApi } from './client';

export interface Test {
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'GENERATED' | 'COMPLETED' | 'SIN_PROCESAR' | 'EN_PROCESO' | 'GENERADO' | 'PROCESADO';
  numeroSerie?: string;
  generalInfo: {
    pedido: string;
    cliente: string;
    tipoDeBomba?: string;
    modeloBomba?: string;
    ordenDeTrabajo?: string;
    numeroBombas: number;
    posicion?: string;
    fecha?: string;
    item?: string;
    pedidoCliente?: string;
  };
  createdAt?: string;
  numeroProtocolo?: number;
  bancoId?: number;
  fecha?: string;
  [key: string]: any; // Allow additional properties for detailed test data
}

/**
 * Fetches all tests from the system.
 * 
 * @returns Array of tests ordered by creation date (desc)
 */
export async function getTests(): Promise<Test[]> {
  return fetchApi<Test[]>('/api/tests');
}

/**
 * Fetches a specific test by ID.
 * 
 * @param id - Test identifier
 * @returns Detailed test data
 */
export async function getTestById(id: string): Promise<Test> {
  return fetchApi<Test>(`/api/tests/${id}`);
}

/**
 * Updates a test with partial data (PATCH).
 * 
 * @param id - Test ID
 * @param data - Fields to update
 * @returns Updated test data
 */
export async function patchTest(id: string, data: Partial<Test>): Promise<any> {
  return fetchApi<any>(`/api/tests/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export interface Banco {
  id: number;
  nombre: string;
  estado: boolean;
}

/**
 * Gets all available test benches (Bancos).
 * 
 * @returns Array of test benches
 */
export async function getBancos(): Promise<Banco[]> {
  return fetchApi<Banco[]>('/api/bancos');
}

/**
 * Generates protocols from a production listing.
 * Creates N test records (one per pump count).
 * 
 * @param listadoId - Production listing ID
 * @param bancoId - Test bench ID
 * @param numeroSeriePrefix - Optional serial number prefix
 * @returns List of created protocol numbers
 */
export async function generateProtocols(
  listadoId: number,
  bancoId: number,
  numeroSeriePrefix?: string
): Promise<{ success: boolean; message: string; protocolos: number[] }> {
  return fetchApi('/api/tests/generate', {
    method: 'POST',
    body: JSON.stringify({ listadoId, bancoId, numeroSeriePrefix }),
  });
}
