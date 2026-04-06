/**
 * FluidH2OSection Component
 *
 * Displays and manages guaranteed point in water (H2O) data.
 * Automatically calculated from fluid data when available.
 * Values can be manually overridden.
 */

import { useMemo } from "react";
import { Calculator, Droplets } from "lucide-react";
import { CleanInput } from "./CleanInput";
import { ResponsiveFieldGrid } from "./ResponsiveFieldGrid";
import type { TestPdfData } from "../services/dtoMapper";
import {
  calculateWaterFromFluid,
  hasCalculatedValues,
  type FluidData,
} from "../utils/fluidCalculations";
import { DetailSectionCard } from "./DetailSectionCard";

interface FluidH2OSectionProps {
  pdfData: TestPdfData | null | undefined;
  onDataChange: (field: string, value: string) => void;
  allFieldsEditable?: boolean;
  className?: string;
}

export function FluidH2OSection({
  pdfData,
  onDataChange,
  className,
}: FluidH2OSectionProps) {
  const calculatedWater = useMemo(() => {
    const fluidData: FluidData = {
      density: pdfData?.density,
      fluidFlowRate: pdfData?.fluidFlowRate,
      fluidHead: pdfData?.fluidHead,
      fluidRpm: pdfData?.fluidRpm,
      fluidPower: pdfData?.fluidPower,
      fluidEfficiency: pdfData?.fluidEfficiency,
      ce: pdfData?.ce,
    };

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

    return calculateWaterFromFluid(fluidData, manualWater);
  }, [
    pdfData?.bepFlow,
    pdfData?.ce,
    pdfData?.density,
    pdfData?.efficiency,
    pdfData?.flowRate,
    pdfData?.fluidEfficiency,
    pdfData?.fluidFlowRate,
    pdfData?.fluidHead,
    pdfData?.fluidPower,
    pdfData?.fluidRpm,
    pdfData?.head,
    pdfData?.maxPower,
    pdfData?.npshr,
    pdfData?.qMin,
    pdfData?.rpm,
  ]);

  const showCalculatedIndicators = hasCalculatedValues(
    calculatedWater.isCalculated,
  );

  const handleChange = (field: string, value: string) => {
    onDataChange(field, value);
  };

  const isCalculated = (key: keyof typeof calculatedWater.isCalculated) => {
    return calculatedWater.isCalculated[key];
  };

  return (
    <DetailSectionCard
      title="Punto garantizado en agua (H2O)"
      className={className}
      icon={<Droplets className="size-5 text-blue-500" />}
      action={
        showCalculatedIndicators ? (
          <div className="flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-1 text-xs text-blue-300">
            <Calculator className="size-3" />
            <span>Calculado</span>
          </div>
        ) : null
      }
    >
      <ResponsiveFieldGrid
        layout="container-2col"
        gapClassName="gap-3"
      >
        <div className="relative">
          <CleanInput
            label="Caudal"
            value={
              calculatedWater.flowRate !== null
                ? String(calculatedWater.flowRate)
                : (pdfData?.flowRate ?? "")
            }
            unit="m3/h"
            onChange={(val) => handleChange("flowRate", val)}
            className="h-10 text-sm font-mono"
            containerClassName="min-w-0 w-full"
            type="number"
          />
          {isCalculated("flowRate") && (
            <div
              className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"
              title="Calculado automaticamente"
            />
          )}
        </div>

        <div className="relative">
          <CleanInput
            label="Altura"
            value={
              calculatedWater.head !== null
                ? String(calculatedWater.head)
                : (pdfData?.head ?? "")
            }
            unit="m"
            onChange={(val) => handleChange("head", val)}
            className="h-10 text-sm font-mono"
            containerClassName="min-w-0 w-full"
            type="number"
          />
          {isCalculated("head") && (
            <div
              className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"
              title="Calculado automaticamente"
            />
          )}
        </div>

        <div className="relative">
          <CleanInput
            label="Velocidad"
            value={
              calculatedWater.rpm !== null
                ? String(calculatedWater.rpm)
                : (pdfData?.rpm ?? "")
            }
            unit="rpm"
            onChange={(val) => handleChange("rpm", val)}
            className="h-10 text-sm font-mono"
            containerClassName="min-w-0 w-full"
            type="number"
          />
          {isCalculated("rpm") && (
            <div
              className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"
              title="Calculado automaticamente"
            />
          )}
        </div>

        <div className="relative">
          <CleanInput
            label="Potencia"
            value={
              calculatedWater.maxPower !== null
                ? String(calculatedWater.maxPower)
                : (pdfData?.maxPower ?? "")
            }
            unit="kW"
            onChange={(val) => handleChange("maxPower", val)}
            className="h-10 text-sm font-mono"
            containerClassName="min-w-0 w-full"
            type="number"
          />
          {isCalculated("maxPower") && (
            <div
              className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"
              title="Calculado: Potencia / Densidad"
            />
          )}
        </div>

        <div className="relative">
          <CleanInput
            label="Rendimiento"
            value={
              calculatedWater.efficiency !== null
                ? String(calculatedWater.efficiency)
                : (pdfData?.efficiency ?? "")
            }
            unit="%"
            onChange={(val) => handleChange("efficiency", val)}
            className="h-10 text-sm font-mono"
            containerClassName="min-w-0 w-full"
            type="number"
          />
          {isCalculated("efficiency") && (
            <div
              className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"
              title="Calculado: Rendimiento / CE"
            />
          )}
        </div>

        <CleanInput
          label="NPSHr"
          value={pdfData?.npshr ?? ""}
          unit="m"
          onChange={(val) => handleChange("npshr", val)}
          className="h-10 text-sm font-mono"
          containerClassName="min-w-0 w-full"
          type="number"
        />

        <CleanInput
          label="Q Min"
          value={pdfData?.qMin ?? ""}
          unit="m3/h"
          onChange={(val) => handleChange("qMin", val)}
          className="h-10 text-sm font-mono"
          labelClassName="text-red-500"
          containerClassName="min-w-0 w-full"
          type="number"
        />

        <CleanInput
          label="BEP"
          value={pdfData?.bepFlow ?? ""}
          unit="m3/h"
          onChange={(val) => handleChange("bepFlow", val)}
          className="h-10 text-sm font-mono"
          labelClassName="text-red-500"
          containerClassName="min-w-0 w-full"
          type="number"
        />
      </ResponsiveFieldGrid>

      {showCalculatedIndicators &&
        (pdfData?.density != null || pdfData?.ce != null) && (
        <div className="rounded-lg border border-border/60 bg-muted/5 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground dark:bg-muted/15">
          <p className="font-medium text-foreground/90">
            Valores calculados usando:
          </p>
          <ul className="mt-1.5 list-inside list-disc space-y-0.5">
            {pdfData?.density != null && Number(pdfData.density) > 0 && (
              <li>Densidad: {pdfData.density} kg/m³</li>
            )}
            {pdfData?.ce != null && pdfData.ce !== "" && (
              <li>CE (coef. eficiencia): {pdfData.ce}</li>
            )}
          </ul>
          <p className="mt-2 text-[11px] text-primary/90">
            Se actualizan al cambiar los datos del fluido.
          </p>
        </div>
      )}
    </DetailSectionCard>
  );
}
