/**
 * =============================================================================
 * SCHEMAS DE VALIDACIÓN - Pump IoT Platform
 * =============================================================================
 * 
 * @fileoverview Schemas Zod para validación de formularios y datos.
 * 
 * Zod es una librería de validación TypeScript-first que permite:
 * - Validación en runtime (captura errores antes de enviar al backend)
 * - Inferencia automática de tipos TypeScript
 * - Mensajes de error personalizados en español
 * 
 * @see https://zod.dev para documentación completa de Zod
 * 
 * COMPARACIÓN CON .NET:
 * - Zod ≈ FluentValidation en C#
 * - z.object({}) ≈ AbstractValidator<T>
 * - z.coerce.number() ≈ int.TryParse con conversión automática
 * - z.infer<typeof schema> ≈ El tipo del modelo validado
 * 
 * @example
 * ```typescript
 * import { technicalSpecsSchema, TechnicalSpecsFormValues } from '@/lib/schemas';
 * 
 * // Validar datos
 * const result = technicalSpecsSchema.safeParse(formData);
 * if (!result.success) {
 *     console.error(result.error.errors);
 * }
 * 
 * // Uso con React Hook Form
 * const form = useForm<TechnicalSpecsFormValues>({
 *     resolver: zodResolver(technicalSpecsSchema)
 * });
 * ```
 */

import { z } from "zod";

// =============================================================================
// SCHEMA: ESPECIFICACIONES TÉCNICAS DE BOMBA
// =============================================================================

/**
 * Schema de validación para especificaciones técnicas de una bomba.
 * 
 * Usado en el formulario de edición de test/prueba.
 * Los campos marcados con .min() son obligatorios.
 * Los campos con .optional() pueden quedar vacíos.
 * 
 * NOTA SOBRE z.coerce:
 * - z.coerce.number() convierte strings a números automáticamente
 * - Útil para inputs HTML que siempre retornan strings
 * - Si el input es "123" → se convierte a number 123
 * - Si el input es "" o no numérico → validation error
 */
export const technicalSpecsSchema = z.object({
    // =========================================================================
    // DATOS PRIMARIOS (Requeridos)
    // Estos son los parámetros mínimos necesarios para definir una bomba
    // =========================================================================

    /** 
     * Caudal de diseño en m³/h
     * Punto de operación nominal de la bomba
     */
    flowRate: z.coerce.number().min(0.1, "Requerido"),

    /** 
     * Altura manométrica total (TDH) en metros
     * Energía que la bomba transfiere al fluido
     */
    head: z.coerce.number().min(0.1, "Requerido"),

    /** 
     * Velocidad de rotación en RPM
     * Debe ser número entero positivo
     */
    rpm: z.coerce.number().int().min(1, "Requerido"),

    /** 
     * Diámetro del impulsor en mm (opcional)
     * Se usa para verificar el recorte correcto
     */
    impellerDiameter: z.coerce.number().optional(),

    /** 
     * Potencia máxima absorbida en kW (opcional)
     * Para verificar que el motor sea adecuado
     */
    maxPower: z.coerce.number().optional(),

    // =========================================================================
    // PROPIEDADES DEL FLUIDO
    // Características del líquido bombeado
    // =========================================================================

    /** Temperatura del fluido en °C */
    temperature: z.coerce.number().optional(),

    /** Viscosidad cinemática en cSt */
    viscosity: z.coerce.number().optional(),

    /** Densidad del fluido en kg/m³ (agua = 1000) */
    density: z.coerce.number().optional(),

    // =========================================================================
    // PARÁMETROS DE RENDIMIENTO
    // Datos de la curva característica
    // =========================================================================

    /** NPSHr - NPSH requerido en metros */
    npshr: z.coerce.number().optional(),

    /** Eficiencia de la bomba en % */
    efficiency: z.coerce.number().optional(),

    /** Caudal mínimo continuo en m³/h */
    qMin: z.coerce.number().optional(),

    /** Caudal en el punto de mejor eficiencia (BEP) en m³/h */
    bepFlow: z.coerce.number().optional(),

    // =========================================================================
    // DATOS DE CONSTRUCCIÓN
    // Información física y de materiales
    // =========================================================================

    /** Tolerancia de prueba según norma (ej: "ISO 9906 Grade 1") */
    tolerance: z.string().optional(),

    /** Tipo de sello mecánico (ej: "Single Cartridge", "Double") */
    sealType: z.string().optional(),

    /** Diámetro de brida de succión en mm */
    suctionDiameter: z.coerce.number().optional(),

    /** Diámetro de brida de descarga en mm */
    dischargeDiameter: z.coerce.number().optional(),
});

/**
 * Tipo TypeScript inferido del schema de especificaciones técnicas.
 * 
 * Este tipo se genera automáticamente a partir del schema Zod.
 * Usarlo garantiza que el tipo siempre esté sincronizado con la validación.
 * 
 * Equivalente C#:
 * ```csharp
 * public class TechnicalSpecsFormValues {
 *     public double FlowRate { get; set; }
 *     public double Head { get; set; }
 *     public int Rpm { get; set; }
 *     public double? ImpellerDiameter { get; set; }
 *     // ...
 * }
 * ```
 */
export type TechnicalSpecsFormValues = z.infer<typeof technicalSpecsSchema>;

// =============================================================================
// INTERFACE: PRUEBAS A REALIZAR
// =============================================================================

/**
 * Flags de pruebas a ejecutar para una bomba.
 * 
 * Cada boolean indica si ese tipo de prueba está requerida.
 * Se usa para configurar el protocolo de prueba.
 */
export interface TestsToPerform {
    /** Prueba de rendimiento hidráulico (curva H-Q) */
    performanceTest?: boolean;

    /** Prueba de NPSH (cavitación) */
    npsh?: boolean;

    /** Medición de vibraciones según ISO 10816 */
    vibraciones?: boolean;

    /** Medición de nivel de ruido en dB(A) */
    ruido?: boolean;

    /** Marcha en seco 1 hora */
    mrt1h?: boolean;

    /** Marcha en seco 4 horas */
    mrt4h?: boolean;

    /** Prueba para homologación de nuevo modelo */
    homologacion?: boolean;

    /** Prueba presenciada por el cliente */
    presenciada?: boolean;

    /** Usar el motor del pedido (no motor de banco) */
    motorDelPedido?: boolean;
}

// =============================================================================
// INTERFACE: INFORMACIÓN GENERAL
// =============================================================================

/**
 * Información general de un pedido/prueba.
 * 
 * Estos datos provienen de la importación Excel/CSV
 * y se usan para identificar y agrupar las pruebas.
 */
export interface GeneralInfo {
    /** Número de pedido interno (ej: "PED-2024-001") */
    pedido: string;

    /** Posición dentro del pedido (ej: "01", "02") */
    posicion?: string;

    /** Modelo de la bomba (ej: "CPX 50-200") */
    modeloBomba?: string;

    /** Orden de trabajo de fabricación */
    ordenTrabajo?: string;

    /** Nombre del cliente */
    cliente: string;

    /** Número de item en el pedido del cliente */
    item?: string;

    /** Referencia del pedido del cliente */
    pedidoCliente?: string;

    /** Cantidad de bombas en este pedido/posición */
    numeroBombas: number;
}
