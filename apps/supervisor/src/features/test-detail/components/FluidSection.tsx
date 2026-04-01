/**
 * FluidSection Component
 */

import { Droplets } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { CleanAutoInput } from "./CleanAutoInput";
import { ResponsiveFieldFlow } from "./ResponsiveFieldFlow";
import type { TestPdfData } from "../services/dtoMapper";

interface FluidSectionProps {
  pdfData: TestPdfData | null | undefined;
  onDataChange: (field: string, value: string) => void;
  allFieldsEditable?: boolean;
}

export function FluidSection({ pdfData, onDataChange }: FluidSectionProps) {
  return (
    <section className="space-y-2">
      <Separator className="mb-2 -mx-4 md:-mx-6 w-auto" />
      <div>
        <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <Droplets className="w-4 h-4 text-orange-500" /> Punto Garantizado en
          Fluido
        </span>
      </div>

      <ResponsiveFieldFlow>
        <CleanAutoInput
          label="Fluido"
          value={pdfData?.liquidDescription || ""}
          onChange={(val) => onDataChange("liquidDescription", val)}
          className="h-8 text-xs font-mono"
          minWidth={180}
        />
        <CleanAutoInput
          label="Temperatura"
          value={pdfData?.temperature || ""}
          unit="C"
          onChange={(val) => onDataChange("temperature", val)}
          className="h-8 text-xs font-mono"
          minWidth={110}
          type="number"
        />
        <CleanAutoInput
          label="Viscosidad"
          value={pdfData?.viscosity || ""}
          unit="cSt"
          onChange={(val) => onDataChange("viscosity", val)}
          className="h-8 text-xs font-mono"
          minWidth={110}
          type="number"
        />
        <CleanAutoInput
          label="Densidad"
          value={pdfData?.density || ""}
          unit="kg/m3"
          onChange={(val) => onDataChange("density", val)}
          className="h-8 text-xs font-mono"
          minWidth={120}
          type="number"
        />
        <CleanAutoInput
          label="Caudal"
          value={pdfData?.fluidFlowRate || ""}
          unit="m3/h"
          onChange={(val) => onDataChange("fluidFlowRate", val)}
          className="h-8 text-xs font-mono"
          minWidth={110}
          type="number"
        />
        <CleanAutoInput
          label="Altura"
          value={pdfData?.fluidHead || ""}
          unit="m"
          onChange={(val) => onDataChange("fluidHead", val)}
          className="h-8 text-xs font-mono"
          minWidth={110}
          type="number"
        />
        <CleanAutoInput
          label="Velocidad"
          value={pdfData?.fluidRpm || ""}
          unit="rpm"
          onChange={(val) => onDataChange("fluidRpm", val)}
          className="h-8 text-xs font-mono"
          minWidth={110}
          type="number"
        />
        <CleanAutoInput
          label="Potencia"
          value={pdfData?.fluidPower || ""}
          unit="kW"
          onChange={(val) => onDataChange("fluidPower", val)}
          className="h-8 text-xs font-mono"
          minWidth={110}
          type="number"
        />
        <CleanAutoInput
          label="Rendimiento"
          value={pdfData?.fluidEfficiency || ""}
          unit="%"
          onChange={(val) => onDataChange("fluidEfficiency", val)}
          className="h-8 text-xs font-mono"
          minWidth={115}
          type="number"
        />
        <CleanAutoInput
          label="CQ"
          value={pdfData?.cq || ""}
          onChange={(val) => onDataChange("cq", val)}
          className="h-8 text-xs font-mono"
          minWidth={90}
          type="number"
        />
        <CleanAutoInput
          label="CH"
          value={pdfData?.ch || ""}
          onChange={(val) => onDataChange("ch", val)}
          className="h-8 text-xs font-mono"
          minWidth={90}
          type="number"
        />
        <CleanAutoInput
          label="CE"
          value={pdfData?.ce || ""}
          onChange={(val) => onDataChange("ce", val)}
          className="h-8 text-xs font-mono"
          minWidth={90}
          type="number"
        />
      </ResponsiveFieldFlow>
    </section>
  );
}
