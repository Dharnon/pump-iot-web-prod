/**
 * FluidSection Component
 *
 * Displays and manages guaranteed point in fluid data.
 * Follows SRP: Only responsible for fluid point data UI.
 */

import { Droplets } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { CleanAutoInput } from "./CleanAutoInput";
import type { TestPdfData } from "../services/dtoMapper";

interface FluidSectionProps {
  pdfData: TestPdfData | null | undefined;
  onDataChange: (field: string, value: string) => void;
  allFieldsEditable?: boolean;
}

export function FluidSection({
  pdfData,
  onDataChange,
  allFieldsEditable = false,
}: FluidSectionProps) {
  return (
    <section className="space-y-4">
      <Separator className="mb-4 -mx-4 md:-mx-6 w-auto" />
      <div>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Droplets className="w-3.5 h-3.5 text-orange-500" /> Punto Garantizado
          en Fluido
        </span>
      </div>
      <div className="flex flex-wrap gap-4 items-start">
        <CleanAutoInput
          label="Fluido"
          value={pdfData?.liquidDescription}
          onChange={(val) => onDataChange("liquidDescription", val)}
          className="h-9 text-sm"
          minWidth={100}
        />
        <CleanAutoInput
          label="Temperatura"
          value={pdfData?.temperature}
          unit="°C"
          onChange={(val) => onDataChange("temperature", val)}
          className="h-9 text-sm text-right"
          minWidth={80}
          type="number"
        />
        <CleanAutoInput
          label="Viscosidad"
          value={pdfData?.viscosity}
          unit="cSt"
          onChange={(val) => onDataChange("viscosity", val)}
          className="h-9 text-sm text-right"
          minWidth={80}
          type="number"
        />
        <CleanAutoInput
          label="Densidad"
          value={pdfData?.density}
          unit="kg/m³"
          onChange={(val) => onDataChange("density", val)}
          className="h-9 text-sm text-right"
          minWidth={80}
          type="number"
        />

        <div className="w-full md:w-auto md:border-l md:pl-4 md:ml-2 flex flex-wrap gap-4">
          <CleanAutoInput
            label="Caudal"
            value={pdfData?.fluidFlowRate}
            unit="m³/h"
            onChange={(val) => onDataChange("fluidFlowRate", val)}
            className="h-9 text-sm text-right"
            minWidth={80}
            type="number"
          />
          <CleanAutoInput
            label="Altura"
            value={pdfData?.fluidHead}
            unit="m"
            onChange={(val) => onDataChange("fluidHead", val)}
            className="h-9 text-sm text-right"
            minWidth={80}
            type="number"
          />
          <CleanAutoInput
            label="Velocidad"
            value={pdfData?.fluidRpm}
            unit="rpm"
            onChange={(val) => onDataChange("fluidRpm", val)}
            className="h-9 text-sm text-right"
            minWidth={80}
            type="number"
          />
          <CleanAutoInput
            label="Potencia"
            value={pdfData?.fluidPower}
            unit="kW"
            onChange={(val) => onDataChange("fluidPower", val)}
            className="h-9 text-sm text-right"
            minWidth={80}
            type="number"
          />
          <CleanAutoInput
            label="Rendimiento"
            value={pdfData?.fluidEfficiency}
            unit="%"
            onChange={(val) => onDataChange("fluidEfficiency", val)}
            className="h-9 text-sm text-right"
            minWidth={80}
            type="number"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-4 items-start pt-2">
        <CleanAutoInput
          label="CQ"
          value={pdfData?.cq}
          onChange={(val) => onDataChange("cq", val)}
          className="h-9 text-sm"
          minWidth={60}
          type="number"
        />
        <CleanAutoInput
          label="CH"
          value={pdfData?.ch}
          onChange={(val) => onDataChange("ch", val)}
          className="h-9 text-sm"
          minWidth={60}
          type="number"
        />
        <CleanAutoInput
          label="CE"
          value={pdfData?.ce}
          onChange={(val) => onDataChange("ce", val)}
          className="h-9 text-sm"
          minWidth={60}
          type="number"
        />
      </div>
    </section>
  );
}
