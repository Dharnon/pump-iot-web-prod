/**
 * FluidH2OSection Component
 *
 * Displays and manages guaranteed point in water (H2O) data.
 * Automatically calculated from fluid data when available.
 * Values can be manually overridden.
 */

import { useMemo } from "react";
import { Droplets, Calculator } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { CleanInput } from "./CleanInput";
import type { TestPdfData } from "../services/dtoMapper";
import {
  calculateWaterFromFluid,
  hasCalculatedValues,
  type FluidData
} from "../utils/fluidCalculations";

interface FluidH2OSectionProps {
  pdfData: TestPdfData | null | undefined;
  onDataChange: (field: string, value: string) => void;
  allFieldsEditable?: boolean;
}

export function FluidH2OSection({
  pdfData,
  onDataChange,
  allFieldsEditable = false,
}: FluidH2OSectionProps) {

  // Extract fluid data from pdfData
  const fluidData: FluidData = {
    density: pdfData?.density,
    fluidFlowRate: pdfData?.fluidFlowRate,
    fluidHead: pdfData?.fluidHead,
    fluidRpm: pdfData?.fluidRpm,
    fluidPower: pdfData?.fluidPower,
    fluidEfficiency: pdfData?.fluidEfficiency,
    ce: pdfData?.ce,
  };

  // Extract manual water values from pdfData
  const manualWater = {
    flowRate: pdfData?.flowRate,
    head: pdfData?.head,
    rpm: pdfData?.rpm,
    maxPower: pdfData?.maxPower,
    efficiency: pdfData?.efficiency,
    npshr: pdfData?.npshr,
    qMin: pdfData?.qMin,
    bepFlow: pdfData?.bepFlow,
  };

  // Calculate water values from fluid data
  const calculatedWater = useMemo(() => {
    return calculateWaterFromFluid(fluidData, manualWater);
  }, [fluidData, manualWater]);

  const showCalculatedIndicators = hasCalculatedValues(calculatedWater.isCalculated);

  // Handle change - this allows manual override
  const handleChange = (field: string, value: string) => {
    onDataChange(field, value);
  };

  // Helper to check if a field is calculated
  const isCalculated = (key: keyof typeof calculatedWater.isCalculated) => {
    return calculatedWater.isCalculated[key];
  };

  return (
    <section className="space-y-4">
      <Separator className="mb-4 -mx-4 md:-mx-6 w-auto" />
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Droplets className="w-3.5 h-3.5 text-blue-500" /> Punto Garantizado
          en Agua (H₂O)
        </span>
        {showCalculatedIndicators && (
          <div className="flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
            <Calculator className="w-3 h-3" />
            <span>Calculado desde fluido</span>
          </div>
        )}
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
        {/* Caudal - calculated from fluid or manual */}
        <div className="relative">
          <CleanInput
            label="Caudal"
            value={calculatedWater.flowRate !== null ? String(calculatedWater.flowRate) : (pdfData?.flowRate ?? '') || ''}
            unit="m³/h"
            onChange={(val) => handleChange("flowRate", val)}
            className="h-8 text-xs font-mono"
            type="number"
          />
          {isCalculated('flowRate') && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" title="Calculado automáticamente" />
          )}
        </div>

        {/* Altura - calculated from fluid or manual */}
        <div className="relative">
          <CleanInput
            label="Altura"
            value={calculatedWater.head !== null ? String(calculatedWater.head) : (pdfData?.head ?? '') || ''}
            unit="m"
            onChange={(val) => handleChange("head", val)}
            className="h-8 text-xs font-mono"
            type="number"
          />
          {isCalculated('head') && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" title="Calculado automáticamente" />
          )}
        </div>

        {/* Velocidad - calculated from fluid or manual */}
        <div className="relative">
          <CleanInput
            label="Velocidad"
            value={calculatedWater.rpm !== null ? String(calculatedWater.rpm) : (pdfData?.rpm ?? '') || ''}
            unit="rpm"
            onChange={(val) => handleChange("rpm", val)}
            className="h-8 text-xs font-mono"
            type="number"
          />
          {isCalculated('rpm') && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" title="Calculado automáticamente" />
          )}
        </div>

        {/* Potencia - calculated from fluid/density or manual */}
        <div className="relative">
          <CleanInput
            label="Potencia"
            value={calculatedWater.maxPower !== null ? String(calculatedWater.maxPower) : (pdfData?.maxPower ?? '') || ''}
            unit="kW"
            onChange={(val) => handleChange("maxPower", val)}
            className="h-8 text-xs font-mono"
            type="number"
          />
          {isCalculated('maxPower') && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" title="Calculado: Potencia / Densidad" />
          )}
        </div>

        {/* Rendimiento - calculated from fluid/CE or manual */}
        <div className="relative">
          <CleanInput
            label="Rendimiento"
            value={calculatedWater.efficiency !== null ? String(calculatedWater.efficiency) : (pdfData?.efficiency ?? '') || ''}
            unit="%"
            onChange={(val) => handleChange("efficiency", val)}
            className="h-8 text-xs font-mono"
            type="number"
          />
          {isCalculated('efficiency') && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" title="Calculado: Rendimiento / CE" />
          )}
        </div>

        {/* NPSHr - always manual */}
        <CleanInput
          label="NPSHr"
          value={pdfData?.npshr ?? ''}
          unit="m"
          onChange={(val) => handleChange("npshr", val)}
          className="h-8 text-xs font-mono"
          type="number"
        />

        {/* Q Min - always manual */}
        <CleanInput
          label="Q Min"
          value={pdfData?.qMin ?? ''}
          unit="m³/h"
          onChange={(val) => handleChange("qMin", val)}
          className="h-8 text-xs font-mono"
          labelClassName="text-red-500"
          type="number"
        />

        {/* BEP - always manual */}
        <CleanInput
          label="BEP"
          value={pdfData?.bepFlow ?? ''}
          unit="m³/h"
          onChange={(val) => handleChange("bepFlow", val)}
          className="h-8 text-xs font-mono"
          labelClassName="text-red-500"
          type="number"
        />
      </div>

      {/* Info about calculations */}
      {showCalculatedIndicators && fluidData.density && (
        <div className="text-[10px] text-muted-foreground bg-muted/30 p-2 rounded">
          <p><strong>Valores calculados usando:</strong></p>
          <ul className="mt-1 space-y-0.5">
            {fluidData.density > 0 && <li>• Densidad: {fluidData.density} kg/m³</li>}
            {fluidData.ce && <li>• CE (Coeficiente Eficiencia): {fluidData.ce}</li>}
          </ul>
          <p className="mt-1 text-blue-600">Los valores se actualizan automáticamente al cambiar los datos del fluido.</p>
        </div>
      )}
    </section>
  );
}
