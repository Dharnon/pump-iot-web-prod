/**
 * =============================================================================
 * API CLIENT - Pump IoT Platform
 * =============================================================================
 * 
 * @fileoverview Cliente HTTP centralizado para comunicación con el backend.
 * 
 * Este módulo actúa como única capa de comunicación entre el frontend y el 
 * backend REST API. Todos los componentes deben usar estas funciones en lugar 
 * de llamar a fetch directamente.
 * 
 * @example
 * ```typescript
 * import { login, getTests, importExcel } from '@/lib/api';
 * 
 * // Autenticación
 * const response = await login('admin', 'password');
 * 
 * // Obtener datos
 * const tests = await getTests();
 * 
 * // Importar archivo
 * const result = await importExcel(file, 'Hoja1');
 * ```
 * 
 * @see docs/ARCHITECTURE.md para diagramas de flujo de datos
 */

// =============================================================================
// CONFIGURACIÓN
// =============================================================================

/**
 * URL base del backend API.
 * 
 * Prioridad:
 * 1. Variable de entorno NEXT_PUBLIC_API_URL (para producción)
 * 2. localhost:4000 (para desarrollo)
 * 
 * @example En .env.local:
 * NEXT_PUBLIC_API_URL=http://192.168.1.100:4000
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5002';

// =============================================================================
// CLIENTE HTTP GENÉRICO
// =============================================================================

/**
 * Wrapper genérico de fetch con manejo de errores centralizado.
 * 
 * Esta función:
 * - Añade headers por defecto (Content-Type: application/json)
 * - Parsea automáticamente la respuesta JSON
 * - Lanza Error con mensaje descriptivo si la respuesta no es OK
 * 
 * @template T - Tipo de la respuesta esperada (inferido del caller)
 * @param endpoint - Ruta del endpoint (ej: '/api/tests')
 * @param options - Opciones de fetch (method, body, headers, etc.)
 * @returns Promise con los datos parseados del tipo T
 * @throws Error si la respuesta HTTP no es 2xx
 * 
 * @example
 * ```typescript
 * // GET request
 * const data = await fetchApi<User[]>('/api/users');
 * 
 * // POST request
 * const result = await fetchApi<CreateResponse>('/api/users', {
 *     method: 'POST',
 *     body: JSON.stringify({ name: 'John' })
 * });
 * ```
 */
export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Construir URL completa combinando base + endpoint
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers, // Permite override de headers
        },
    });

    // Manejo de errores HTTP
    if (!response.ok) {
        // Intentar extraer mensaje de error del body JSON
        const error = await response.json().catch(() => ({ error: null }));
        throw new Error(error.error || `Error HTTP ${response.status}`);
    }

    // Parsear y retornar respuesta JSON
    return response.json();
}

/**
 * Fetcher function for SWR
 * @param url - The endpoint URL
 */
export const swrFetcher = (url: string) => fetchApi<any>(url);

// =============================================================================
// AUTENTICACIÓN
// =============================================================================

/**
 * Respuesta del endpoint de login.
 * 
 * @property success - Indica si el login fue exitoso
 * @property user - Datos del usuario autenticado
 * @property token - JWT token para futuras requests (TODO: migrar a httpOnly cookie)
 */
export interface LoginResponse {
    success: boolean;
    user: {
        id: number;
        username: string;
        role: string;  // 'admin' | 'supervisor' | 'operator'
    };
    token: string;
}

/**
 * Autentica un usuario contra el backend.
 * 
 * @param username - Nombre de usuario
 * @param password - Contraseña (enviada en texto plano sobre HTTPS)
 * @returns Datos del usuario + token JWT
 * @throws Error si credenciales inválidas o servidor no disponible
 * 
 * @example
 * ```typescript
 * try {
 *     const { token, user } = await login('admin', 'admin123');
 *     localStorage.setItem('token', token);
 *     localStorage.setItem('user', JSON.stringify(user));
 * } catch (error) {
 *     console.error('Login failed:', error.message);
 * }
 * ```
 */
export async function login(username: string, password: string): Promise<LoginResponse> {
    return fetchApi<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });
}

/**
 * Valida un token JWT contra el backend.
 * 
 * Esta función es utilizada por el middleware de Next.js para verificar
 * la autenticidad del token en cada petición a rutas protegidas.
 * 
 * SEGURIDAD OT:
 * - Implementa el principio de "Zero Trust" (verificación continua)
 * - Timeout corto (3s) para no bloquear el middleware en caso de latencia
 * - Manejo explícito de errores de red (crítico en entornos industriales)
 * 
 * @param token - Token JWT a validar
 * @returns Datos del usuario si el token es válido
 * @throws Error si el token es inválido, expirado o el backend no responde
 * 
 * @example
 * ```typescript
 * try {
 *     const user = await validateToken(token);
 *     console.log(`Usuario válido: ${user.username}`);
 * } catch (error) {
 *     // Token inválido o backend no disponible
 *     console.error('Validación fallida:', error.message);
 * }
 * ```
 */
export async function validateToken(token: string): Promise<{
    valid: boolean;
    user?: {
        id: number;
        username: string;
        role: string;
    };
}> {
    try {
        // Timeout de 3 segundos para no bloquear el middleware
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error('Token validation failed');
        }

        return response.json();
    } catch (error) {
        // En caso de error de red o timeout, consideramos el token inválido
        // (Fail-Safe Default - principio de seguridad OT)
        throw new Error('Token validation failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
}

/**
 * Cierra la sesión del usuario de forma segura.
 * 
 * Esta función:
 * - Borra la cookie de autenticación
 * - Limpia los datos de usuario del localStorage
 * - Opcionalmente notifica al backend (para invalidar el token)
 * 
 * SEGURIDAD OT:
 * - Limpieza completa de credenciales en el cliente
 * - Previene reutilización de tokens después del logout
 * 
 * @example
 * ```typescript
 * logout();
 * router.push('/login');
 * ```
 */
export function logout(): void {
    // Borrar cookies de autenticación y modo mock
    document.cookie = 'token=; path=/; max-age=0; SameSite=Strict';
    document.cookie = 'use_mock_data=; path=/; max-age=0; SameSite=Strict';
    
    // Limpiar localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('USE_MOCK_DATA');
}

// =============================================================================
// TESTS (Pruebas de Bombas)
// =============================================================================

/**
 * Representa una prueba de bomba en el sistema.
 * 
 * Una prueba contiene toda la información necesaria para ejecutar
 * y documentar el test de una bomba industrial.
 * 
 * @property id - Identificador único (UUID)
 * @property status - Estado actual: PENDING → IN_PROGRESS → GENERATED
 * @property generalInfo - Información del pedido/cliente
 * @property createdAt - Fecha de creación (ISO 8601)
 */
export interface Test {
    id: string; // This maps to NumeroProtocolo
    status: 'PENDING' | 'IN_PROGRESS' | 'GENERATED' | 'GENERADO' | 'COMPLETED';
    numeroSerie?: string;
    generalInfo: {
        pedido: string;        // Número de pedido (ej: "PED-2024-001")
        cliente: string;       // Nombre del cliente
        tipoDeBomba: string;   // Modelo de bomba (ej: "CPX 50-200")
        ordenDeTrabajo: string; // OT de fabricación
        numeroBombas: number;  // Cantidad de bombas en el pedido
    };
    createdAt: string;
}

/**
 * Obtiene todas las pruebas del sistema.
 * 
 * El backend retorna las pruebas ordenadas por fecha de creación (desc).
 * 
 * @returns Array de pruebas
 * @throws Error si el backend no está disponible
 * 
 * @example
 * ```typescript
 * const tests = await getTests();
 * const pending = tests.filter(t => t.status === 'PENDING');
 * console.log(`${pending.length} pruebas pendientes`);
 * ```
 */
export async function getTests(): Promise<Test[]> {
    return fetchApi<Test[]>('/api/tests');
}

/**
 * Obtiene una prueba específica por su ID.
 * 
 * @param id - Identificador de la prueba (ej: "pending-1" o "123")
 * @returns Datos detallados de la prueba
 */
export async function getTestById(id: string): Promise<any> {
    return fetchApi<any>(`/api/tests/${id}`);
}

/**
 * Actualiza parcialmente una prueba.
 * 
 * @param id - ID de la prueba
 * @param data - Objeto con los campos a actualizar (status, technicalInfo, etc.)
 * @returns Resultado de la operación
 */
export async function patchTest(id: string, data: any): Promise<any> {
    return fetchApi<any>(`/api/tests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
}

/**
 * Elimina una prueba o protocolo.
 * 
 * @param id - ID de la prueba o protocolo
 * @returns Resultado de la operación
 */
export async function deleteTest(id: string): Promise<any> {
    return fetchApi<any>(`/api/tests/${id}`, {
        method: 'DELETE'
    });
}

/**
 * Generate protocols from a ListadoProduccion entry.
 * Creates N Prueba records (one per NumeroBombas) with empty related entities.
 * 
 * @param listadoId - ID of the ListadoProduccion entry
 * @param bancoId - ID of the Banco where tests will be performed
 * @param numeroSeriePrefix - Optional prefix for NumeroSerie (e.g., "C8r")
 * @returns List of created NumeroProtocolo values
 */
export async function generateProtocols(
    listadoId: number, 
    bancoId: number, 
    numeroSeriePrefix?: string
): Promise<{ success: boolean; message: string; protocolos: number[] }> {
    return fetchApi('/api/tests/generate', {
        method: 'POST',
        body: JSON.stringify({ listadoId, bancoId, numeroSeriePrefix })
    });
}

/**
 * Get all available Bancos (test benches).
 * 
 * @returns Array of Banco objects with id and nombre
 */
export interface Banco {
    id: number;
    nombre: string;
    estado: boolean;
}

export async function getBancos(): Promise<Banco[]> {
    return fetchApi<Banco[]>('/api/bancos');
}

// =============================================================================
// LISTADOS (Datos CSV/Excel importados)
// =============================================================================

/**
 * Representa un registro importado desde CSV/Excel.
 * 
 * Esta es la tabla de "staging" - se vacía y rellena con cada importación.
 * Es una vista temporal de los datos antes de crear las pruebas.
 */
export interface Listado {
    id: number;
    pedido: string;
    cliente: string;
    tipoDeBomba: string;
    ordenDeTrabajo: string;
    numeroBombas: number;
}

/**
 * Obtiene los datos de la tabla de staging (listados).
 * 
 * Estos datos provienen de la última importación CSV/Excel.
 * 
 * @returns Array de listados
 */
export async function getListados(): Promise<Listado[]> {
    return fetchApi<Listado[]>('/api/Import/listados');
}

/**
 * Creates a new blank listado entry.
 */
export async function createListado(data?: Partial<Listado>): Promise<{ success: boolean; id: number }> {
    return fetchApi('/api/tests/listado', {
        method: 'POST',
        body: JSON.stringify(data || {})
    });
}

// =============================================================================
// IMPORTACIÓN DE ARCHIVOS
// =============================================================================

/**
 * Respuesta estándar para operaciones de importación.
 */
export interface ImportResponse {
    success: boolean;
    count: number;  // Número de registros importados
}
/**
 * Obtiene los nombres de las hojas de un archivo Excel.
 * 
 * @param file - Archivo Excel
 * @returns Lista de nombres de hojas
 */
export async function getExcelSheets(file: File): Promise<{ sheets: string[]; filename: string }> {
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
 * Importa un archivo Excel al sistema.
 * 
 * El proceso:
 * 1. Sube el archivo al backend
 * 2. Backend parsea la hoja especificada
 * 3. Inserta los registros en la tabla de staging
 * 4. Retorna el conteo de registros importados
 * 
 * @param file - Archivo Excel (.xlsx o .xls)
 * @param sheet - Nombre de la hoja a importar (opcional si solo hay una)
 * @returns Resultado con cantidad de registros importados
 * @throws Error si el archivo es inválido o el backend falla
 * 
 * @example
 * ```typescript
 * const file = event.target.files[0];
 * const result = await importExcel(file, 'Hoja1');
 * console.log(`Importados ${result.count} registros`);
 * ```
 * 
 * @see ImportModal para el flujo completo de UI
 */
export async function importExcel(file: File, sheet?: string): Promise<ImportResponse> {
    // Usar FormData para enviar archivo (no JSON)
    const formData = new FormData();
    formData.append('file', file);
    if (sheet) formData.append('sheet', sheet);

    const response = await fetch(`${API_BASE_URL}/api/Import/excel`, {
        method: 'POST',
        body: formData,
        // No establecer Content-Type - el browser lo hace automáticamente con boundary
    });

    if (!response.ok) {
        throw new Error('Failed to import Excel');
    }

    return response.json();
}

/**
 * Importa un archivo CSV al sistema.
 * 
 * Similar a importExcel pero para archivos CSV.
 * 
 * @param file - Archivo CSV
 * @returns Resultado con cantidad de registros importados
 */
export async function importCsv(file: File): Promise<ImportResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/Import/csv`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Failed to import CSV');
    }

    return response.json();
}

// =============================================================================
// ALMACENAMIENTO DE PDFs
// =============================================================================

/**
 * Respuesta del endpoint de subida de PDF.
 */
export interface PdfResponse {
    numeroprotocolo: number;
    success: boolean;
}

/**
 * Sube un PDF de protocolo de prueba al backend.
 * 
 * El PDF se almacena en la base de datos asociado al número de protocolo.
 * 
 * @param numeroProtocolo - Identificador único del protocolo
 * @param file - Archivo PDF a subir
 * @returns Confirmación con número de protocolo
 */
export async function uploadPdf(numeroProtocolo: number, file: File): Promise<PdfResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('numeroProtocolo', numeroProtocolo.toString());

    const response = await fetch(`${API_BASE_URL}/api/pdf/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Failed to upload PDF to database');
    }

    return response.json();
}

// =============================================================================
// HEALTH CHECK
// =============================================================================

/**
 * Verifica que el backend esté funcionando correctamente.
 * 
 * Útil para:
 * - Mostrar indicador de conexión en UI
 * - Verificar antes de operaciones críticas
 * - Obtener versión del backend
 * 
 * @returns Estado y versión del backend
 * 
 * @example
 * ```typescript
 * try {
 *     const health = await checkHealth();
 *     console.log(`Backend v${health.version} - ${health.status}`);
 * } catch {
 *     console.error('Backend no disponible');
 * }
 * ```
 */
export async function checkHealth(): Promise<{ status: string; version: string }> {
    return fetchApi('/api/health');
}

/**
 * Obtiene el archivo PDF de un protocolo.
 * 
 * @param id - ID del protocolo
 * @returns Blob del archivo PDF
 */
export async function getTestPdf(id: number | string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/api/pdf/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch PDF');
    }
    return response.blob();
}
