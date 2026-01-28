/**
 * =============================================================================
 * PDF EXTRACTION SERVICE - Pump IoT Platform
 * =============================================================================
 * 
 * @fileoverview Servicio para extraer especificaciones técnicas de PDFs Flowserve.
 * 
 * Este módulo utiliza pdfjs-dist (librería de Mozilla) para:
 * 1. Cargar y parsear PDFs de datasheets de bombas
 * 2. Extraer el texto estructurado por posición (coordenadas X,Y)
 * 3. Aplicar regex patterns para identificar campos específicos
 * 4. Retornar un objeto tipado con las especificaciones
 * 
 * IMPORTANTE PARA ENTORNO AIR-GAPPED:
 * Actualmente el worker se carga desde CDN (unpkg.com).
 * Ver docs/README_PDF_WORKER_FIX.md para instrucciones de migración a local.
 * 
 * @example
 * ```typescript
 * import { extractSpecsFromPdf } from '@/lib/pdfExtractionService';
 * 
 * const file = event.target.files[0];
 * const specs = await extractSpecsFromPdf(file);
 * console.log(`Caudal: ${specs.flowRate} m³/h`);
 * console.log(`Altura: ${specs.head} m`);
 * ```
 */

import * as pdfjsLib from 'pdfjs-dist';

// =============================================================================
// CONFIGURACIÓN DEL WORKER PDF.JS
// =============================================================================

/**
 * Configuración del Web Worker de PDF.js
 * 
 * PDF.js usa un Web Worker para procesar PDFs sin bloquear la UI.
 * El worker es un archivo JavaScript separado que se carga async.
 * 
 * ⚠️ ISSUE PARA AIR-GAP:
 * Esta configuración carga el worker desde CDN, lo cual NO funciona offline.
 * 
 * TODO: Cambiar a carga local:
 * pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
 */
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// =============================================================================
// TIPOS
// =============================================================================

/**
 * Especificaciones técnicas extraídas de un PDF de datasheet.
 * 
 * Todos los campos son opcionales porque dependen del contenido del PDF.
 * Los campos que no se encuentren quedarán como undefined.
 */
export interface ExtractedSpecs {
    // --- Parámetros Hidráulicos Principales ---
    /** Caudal en m³/h */
    flowRate?: number;
    /** Altura manométrica total (TDH) en metros */
    head?: number;
    /** Velocidad de rotación en RPM */
    rpm?: number;
    /** Potencia máxima en kW */
    maxPower?: number;
    /** Eficiencia de la bomba en % */
    efficiency?: number;
    /** NPSH requerido en metros */
    npshr?: number;
    /** Caudal mínimo continuo en m³/h */
    qMin?: number;
    /** Caudal máximo en m³/h */
    qMax?: number;
    /** Caudal en BEP (Best Efficiency Point) en m³/h */
    bepFlow?: number;

    // --- Propiedades del Fluido ---
    /** Temperatura del fluido en °C */
    temperature?: number;
    /** Viscosidad cinemática en cSt */
    viscosity?: number;
    /** Densidad del fluido en kg/m³ */
    density?: number;
    /** Descripción del líquido (ej: "Water", "Fuel Oil") */
    liquidDescription?: string;

    // --- Dimensiones y Construcción ---
    /** Diámetro del impulsor en mm */
    impellerDiameter?: number;
    /** Diámetro de brida de succión en mm */
    suctionDiameter?: number;
    /** Diámetro de brida de descarga en mm */
    dischargeDiameter?: number;
    /** Tolerancia de prueba (ej: "ISO 9906 Grade 1") */
    tolerance?: string;
    /** Tipo de sello mecánico */
    sealType?: string;
}

// =============================================================================
// FUNCIÓN PRINCIPAL DE EXTRACCIÓN
// =============================================================================

/**
 * Extrae especificaciones técnicas de un archivo PDF.
 * 
 * Proceso:
 * 1. Convierte el File a ArrayBuffer
 * 2. Carga el documento con pdfjs-dist
 * 3. Itera sobre cada página extrayendo el texto
 * 4. Agrupa los fragmentos de texto por coordenadas Y (líneas)
 * 5. Ordena por coordenadas X para reconstruir el orden de lectura
 * 6. Aplica regex patterns para identificar campos
 * 
 * @param file - Archivo PDF a procesar (debe ser PDF nativo, no escaneado)
 * @returns Objeto con las especificaciones encontradas
 * @throws Error si el PDF no puede leerse o está corrupto
 * 
 * @example
 * ```typescript
 * try {
 *     const specs = await extractSpecsFromPdf(pdfFile);
 *     if (specs.flowRate && specs.head) {
 *         console.log('Datos completos');
 *     }
 * } catch (error) {
 *     console.error('PDF inválido o escaneado');
 * }
 * ```
 */
export async function extractSpecsFromPdf(file: File): Promise<ExtractedSpecs> {
    try {
        // Convertir File a ArrayBuffer para pdfjs
        const arrayBuffer = await file.arrayBuffer();

        // Cargar el documento PDF
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';

        // Iterar sobre todas las páginas del PDF
        // La mayoría de datasheets son 1-2 páginas
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();

            // ===============================================================
            // EXTRACCIÓN MEJORADA DE TEXTO
            // ===============================================================
            // PDF.js retorna fragmentos de texto con coordenadas X,Y.
            // Los agrupamos por líneas (coordenada Y similar) y luego
            // ordenamos por X para reconstruir el orden de lectura.

            const items = textContent.items as any[];

            // Tolerancia en píxeles para considerar que dos items están en la misma línea
            const yTolerance = 5;

            // Diccionario: Y → lista de {x, texto}
            const rows: Record<number, { x: number; str: string }[]> = {};

            // Agrupar items por coordenada Y
            items.forEach(item => {
                // transform[5] = coordenada Y, transform[4] = coordenada X
                const y = Math.round(item.transform[5]);
                const x = item.transform[4];
                const str = item.str;

                // Buscar si ya existe una fila cercana (dentro de tolerancia)
                const existingY = Object.keys(rows).map(Number).find(key => Math.abs(key - y) < yTolerance);

                if (existingY !== undefined) {
                    rows[existingY].push({ x, str });
                } else {
                    rows[y] = [{ x, str }];
                }
            });

            // Ordenar filas por Y descendente (en PDF, Y crece hacia arriba)
            // Esto da orden top-to-bottom
            const sortedYs = Object.keys(rows).map(Number).sort((a, b) => b - a);

            // Reconstruir el texto línea por línea
            for (const y of sortedYs) {
                // Ordenar items dentro de la fila por X (izquierda a derecha)
                const rowItems = rows[y].sort((a, b) => a.x - b.x);
                const rowText = rowItems.map(i => i.str).join(' ');
                fullText += rowText + '\n';
            }
        }

        // Log para depuración (útil para ajustar regex patterns)
        console.log("Texto extraído del PDF:", fullText);

        // Aplicar patrones regex para extraer campos
        return parseTextToSpecs(fullText);

    } catch (error) {
        console.error("Error al extraer texto del PDF:", error);
        throw new Error("No se pudo leer el PDF. Asegúrese de que no sea una imagen escaneada.");
    }
}

// =============================================================================
// PARSEO DE TEXTO A ESPECIFICACIONES
// =============================================================================

/**
 * Convierte el texto extraído del PDF a un objeto de especificaciones.
 * 
 * Usa múltiples regex patterns por campo para manejar variaciones
 * en el formato de los datasheets Flowserve.
 * 
 * @param text - Texto completo extraído del PDF
 * @returns Objeto con las especificaciones encontradas
 */
function parseTextToSpecs(text: string): ExtractedSpecs {
    const specs: ExtractedSpecs = {};

    // =========================================================================
    // HELPERS DE EXTRACCIÓN
    // =========================================================================

    /**
     * Intenta extraer un número usando múltiples patrones regex.
     * Retorna el primer match encontrado.
     * 
     * @param patterns - Array de regex, cada una con un grupo de captura para el número
     */
    const extractNumber = (patterns: RegExp[]): number | undefined => {
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                // Limpiar: quitar comas de miles, convertir a número
                let numStr = match[1].replace(/,/g, '');
                return parseFloat(numStr);
            }
        }
        return undefined;
    };

    /**
     * Intenta extraer un string usando múltiples patrones regex.
     * 
     * @param patterns - Array de regex con grupo de captura para el texto
     */
    const extractString = (patterns: RegExp[]): string | undefined => {
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                return match[1].trim();
            }
        }
        return undefined;
    };

    // =========================================================================
    // PATRONES REGEX PARA DATASHEETS FLOWSERVE
    // =========================================================================
    // Cada campo tiene múltiples patrones para manejar variaciones de formato.
    // Los patrones se prueban en orden; el primero que matchea gana.

    // --- CAUDAL (Capacity / Flow) ---
    // Formato típico: "Capacity (rated/normal) : 10.7"
    specs.flowRate = extractNumber([
        /Capacity\s*\(.*?\)\s*:\s*([\d.]+)/i,
        /Flow\s*:\s*([\d.]+)/i
    ]);

    // --- ALTURA (TDH / Head) ---
    // Formato típico: "Total developed head : 85.5"
    specs.head = extractNumber([
        /Total developed head\s*:\s*([\d.]+)/i,
        /Head\s*:\s*([\d.]+)/i
    ]);

    // --- RPM ---
    // Formato típico: "Pump speed : 2,950"
    specs.rpm = extractNumber([
        /Pump speed\s*:\s*([\d,]+)/i,
        /Speed\s*:\s*([\d,]+)/i
    ]);

    // --- POTENCIA (Power) ---
    // Formato típico: "Rated brake power : 12.5"
    specs.maxPower = extractNumber([
        /Rated brake power\s*:\s*([\d.]+)/i,
        /Power\s*:\s*([\d.]+)\s*kW/i
    ]);

    // --- EFICIENCIA ---
    // Formato típico: "Pump overall efficiency (rated) : 75.2"
    specs.efficiency = extractNumber([
        /Pump overall efficiency\s*\(.*?\)\s*:\s*([\d.]+)/i,
        /Efficiency\s*:\s*([\d.]+)/i
    ]);

    // --- NPSHr ---
    // Formato típico: "NPSH required (rated) : 3.2"
    specs.npshr = extractNumber([
        /NPSH required\s*\(.*?\)\s*:\s*([\d.]+)/i,
        /NPSHr\s*:\s*([\d.]+)/i
    ]);

    // --- CAUDAL MÍNIMO ---
    specs.qMin = extractNumber([
        /Minimum continuous flow\s*:\s*([\d.]+)/i
    ]);

    // --- CAUDAL EN BEP ---
    specs.bepFlow = extractNumber([
        /Flow at BEP\s*:\s*([\d.]+)/i
    ]);

    // --- TEMPERATURA ---
    specs.temperature = extractNumber([
        /Temperature\s*:\s*([\d.]+)/i
    ]);

    // --- VISCOSIDAD ---
    specs.viscosity = extractNumber([
        /Viscosity\s*\/.*?\s*:\s*([\d.]+)/i
    ]);

    // --- DENSIDAD ---
    // Formato puede ser: "Density / ... : - / 1000"
    specs.density = extractNumber([
        /Density\s*\/.*?\s*:\s*.*?\/\s*([\d.]+)/i,
        /Density\s*:\s*([\d.]+)/i
    ]);

    // --- DIÁMETRO IMPULSOR ---
    // Busca "Rated : 140 mm" en la sección de diámetro
    specs.impellerDiameter = extractNumber([
        /Rated\s*:\s*([\d.]+)\s*mm/i,
        /Impeller diameter\s*:\s*([\d.]+)/i
    ]);

    // --- TOLERANCIA ---
    specs.tolerance = extractString([
        /Test tolerance\s*:\s*([^:\n]+)/i
    ]);

    // --- DESCRIPCIÓN DEL LÍQUIDO ---
    // Captura hasta encontrar otro campo o fin de línea
    specs.liquidDescription = extractString([
        /Liquid description\s*:\s*(.*?)(?=\s+(?:Temperature|Seal|Performance|$))/i,
        /Liquid description\s*:\s*([^:\n]+)/i
    ]);

    // --- TIPO DE SELLO ---
    // Limitamos a 50 chars para evitar capturar texto de otros campos
    specs.sealType = extractString([
        /Seal configuration\s*:\s*(.{1,50}?)(?=\s+(?:Performance|Hydraulic|Liquid|Construction|Materials|Driver|Motor|$))/i,
        /Seal configuration\s*:\s*([^:\n]{1,50})/i,
        /Shaft Sealing\s*:\s*([^:\n]{1,50})/i
    ]);

    // --- DIÁMETROS DE BRIDAS ---
    // Los patrones buscan mm después del número
    specs.suctionDiameter = extractNumber([
        /Suction.{0,40}?(\d+(?:\.\d+)?)\s*mm/i,
        /Suction\s+Size.{0,20}?(\d+(?:\.\d+)?)\s*mm/i
    ]);

    specs.dischargeDiameter = extractNumber([
        /Discharge.{0,40}?(\d+(?:\.\d+)?)\s*mm/i,
        /Discharge\s+Size.{0,20}?(\d+(?:\.\d+)?)\s*mm/i
    ]);

    return specs;
}
