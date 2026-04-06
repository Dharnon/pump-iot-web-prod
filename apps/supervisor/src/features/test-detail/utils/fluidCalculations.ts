/**
 * Fluid Calculations Utility
 * 
 * Handles conversion from Fluid (test fluid) to Water (H2O) values.
 * 
 * Formulas:
 * - PG agua = PG fluido / densidad
 * - Potencia agua = Potencia fluido / densidad  
 * - Eficiencia agua = Eficiencia fluido / CE (coefficient of efficiency)
 * - Velocidad agua = Velocidad fluido (direct)
 * - Caudal agua = Caudal fluido (direct - from PDF)
 * - Altura agua = Altura fluido (direct - from PDF)
 * - NPSHR = manual/PDF (not calculated)
 * - QMIN = manual/PDF (not calculated)
 * - BEP = manual/PDF (not calculated)
 */

export interface FluidData {
    // From Fluid section
    density?: number | null;        // Densidad (kg/m³)
    fluidFlowRate?: number | null; // Caudal fluido (m³/h)
    fluidHead?: number | null;     // Altura fluido (m)
    fluidRpm?: number | null;      // Velocidad fluido (rpm)
    fluidPower?: number | null;    // Potencia fluido (kW)
    fluidEfficiency?: number | null; // Rendimiento fluido (%)
    ce?: number | null;            // CE (Coefficient of Efficiency)
}

export interface WaterData {
    // From H2O section (some calculated, some manual)
    flowRate?: number | null;   // Caudal agua (calculated from fluid)
    head?: number | null;      // Altura agua (calculated from fluid)
    rpm?: number | null;       // Velocidad agua (calculated from fluid)
    maxPower?: number | null;  // Potencia agua (calculated)
    efficiency?: number | null; // Eficiencia agua (calculated)
    npshr?: number | null;     // NPSHr (manual)
    qMin?: number | null;      // Q Min (manual)
    bepFlow?: number | null;   // BEP (manual)
}

export interface CalculatedWaterData extends WaterData {
    isCalculated: {
        flowRate: boolean;
        head: boolean;
        rpm: boolean;
        maxPower: boolean;
        efficiency: boolean;
        npshr: boolean;
        qMin: boolean;
        bepFlow: boolean;
    };
}

/**
 * Calculates water (H2O) values from fluid values
 * 
 * @param fluid - The fluid data (from Fluid section)
 * @param manualWater - Any manually entered water values (these take precedence)
 * @returns Calculated water data with flags indicating which values are calculated
 */
export function calculateWaterFromFluid(
    fluid: FluidData,
    manualWater?: Partial<WaterData>
): CalculatedWaterData {
    const density = fluid.density ?? 1; // Default to 1 to avoid division by zero
    const ce = fluid.ce ?? 1; // Default to 1 to avoid division by zero
    const manual = manualWater ?? {};

    // Helper to check if a manual value exists
    const hasManual = (key: keyof WaterData) =>
        manual[key] !== undefined && manual[key] !== null;

    // Caudal: direct from fluid (or PDF), can be overridden manually
    const flowRate = hasManual('flowRate')
        ? manual.flowRate
        : fluid.fluidFlowRate ?? null;

    // Altura: direct from fluid (or PDF), can be overridden manually  
    const head = hasManual('head')
        ? manual.head
        : fluid.fluidHead ?? null;

    // Velocidad: direct from fluid, can be overridden manually
    const rpm = hasManual('rpm')
        ? manual.rpm
        : fluid.fluidRpm ?? null;

    // Potencia: fluidPower / density
    const maxPower = hasManual('maxPower')
        ? manual.maxPower
        : (fluid.fluidPower && density > 0)
            ? fluid.fluidPower / density
            : null;

    // Eficiencia: fluidEfficiency / CE
    const efficiency = hasManual('efficiency')
        ? manual.efficiency
        : (fluid.fluidEfficiency && ce > 0)
            ? fluid.fluidEfficiency / ce
            : null;

    // NPSHR, QMin, BEP - always manual (from PDF or entered manually)
    const npshr = manual.npshr ?? null;
    const qMin = manual.qMin ?? null;
    const bepFlow = manual.bepFlow ?? null;

    return {
        flowRate,
        head,
        rpm,
        maxPower,
        efficiency,
        npshr,
        qMin,
        bepFlow,
        isCalculated: {
            flowRate: !hasManual('flowRate') && fluid.fluidFlowRate !== undefined,
            head: !hasManual('head') && fluid.fluidHead !== undefined,
            rpm: !hasManual('rpm') && fluid.fluidRpm !== undefined,
            maxPower: !hasManual('maxPower') && fluid.fluidPower !== undefined && density > 0,
            efficiency: !hasManual('efficiency') && fluid.fluidEfficiency !== undefined && ce > 0,
            npshr: false, // Always manual
            qMin: false,  // Always manual
            bepFlow: false, // Always manual
        }
    };
}

/**
 * Format a number for display
 * @param value - The value to format
 * @param decimals - Number of decimal places (default 2)
 */
export function formatFluidValue(value: number | null | undefined, decimals: number = 2): string {
    if (value === null || value === undefined || isNaN(value)) {
        return '';
    }
    return value.toFixed(decimals);
}

/**
 * Check if any water values are calculated (for showing visual indicators)
 */
export function hasCalculatedValues(calculated: CalculatedWaterData['isCalculated']): boolean {
    return Object.values(calculated).some(v => v);
}
