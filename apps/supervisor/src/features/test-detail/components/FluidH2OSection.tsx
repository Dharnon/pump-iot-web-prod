/**
 * FluidH2OSection Component
 *
 * Displays and manages guaranteed point in water (H2O) data.
 * Follows SRP: Only responsible for H2O point data UI.
 */

import { Droplets } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { CleanInput } from "./CleanInput";
import type { TestPdfData } from "../services/dtoMapper";

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
  return (
    <section className="space-y-4">
      <Separator className="mb-4 -mx-4 md:-mx-6 w-auto" />
      <div>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Droplets className="w-3.5 h-3.5 text-blue-500" /> Punto Garantizado
          en Agua (H₂O)
        </span>
      </div>
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
        <CleanInput
          label="Caudal"
          value={pdfData?.flowRate}
          unit="m³/h"
          onChange={(val) => onDataChange("flowRate", val)}
          className="h-8 text-xs font-mono"
          type="number"
        />
        <CleanInput
          label="Altura"
          value={pdfData?.head}
          unit="m"
          onChange={(val) => onDataChange("head", val)}
          className="h-8 text-xs font-mono"
          type="number"
        />
        <CleanInput
          label="Velocidad"
          value={pdfData?.rpm}
          unit="rpm"
          onChange={(val) => onDataChange("rpm", val)}
          className="h-8 text-xs font-mono"
          type="number"
        />
        <CleanInput
          label="Potencia"
          value={pdfData?.maxPower}
          unit="kW"
          onChange={(val) => onDataChange("maxPower", val)}
          className="h-8 text-xs font-mono"
          type="number"
        />
        <CleanInput
          label="Rendimiento"
          value={pdfData?.efficiency}
          unit="%"
          onChange={(val) => onDataChange("efficiency", val)}
          className="h-8 text-xs font-mono"
          type="number"
        />
        <CleanInput
          label="NPSHr"
          value={pdfData?.npshr}
          unit="m"
          onChange={(val) => onDataChange("npshr", val)}
          className="h-8 text-xs font-mono"
          type="number"
        />
        <CleanInput
          label="Q Min"
          value={pdfData?.qMin}
          unit="m³/h"
          onChange={(val) => onDataChange("qMin", val)}
          className="h-8 text-xs font-mono"
          labelClassName="text-red-500"
          type="number"
        />
        <CleanInput
          label="BEP"
          value={pdfData?.bepFlow}
          unit="m³/h"
          onChange={(val) => onDataChange("bepFlow", val)}
          className="h-8 text-xs font-mono"
          labelClassName="text-red-500"
          type="number"
        />
      </div>
    </section>
  );
}
