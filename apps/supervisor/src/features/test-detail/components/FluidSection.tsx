/**
 * FluidSection Component
 */

import { Droplets } from "lucide-react";
import { CleanAutoInput } from "./CleanAutoInput";
import { ResponsiveFieldGrid } from "./ResponsiveFieldGrid";
import type { TestPdfData } from "../services/dtoMapper";
import { DetailSectionCard } from "./DetailSectionCard";

interface FluidSectionProps {
  pdfData: TestPdfData | null | undefined;
  onDataChange: (field: string, value: string) => void;
  allFieldsEditable?: boolean;
  className?: string;
}

export function FluidSection({ pdfData, onDataChange, className }: FluidSectionProps) {
  return (
    <DetailSectionCard
      title="Punto garantizado en fluido"
      className={className}
      icon={<Droplets className="size-5 text-orange-500" />}
      contentClassName="space-y-0"
    >
      <ResponsiveFieldGrid minItemWidth={200} gapClassName="gap-3">
        <CleanAutoInput
          label="Fluido"
          value={pdfData?.liquidDescription || ""}
          onChange={(val) => onDataChange("liquidDescription", val)}
          className="h-10 text-sm font-mono"
          containerClassName="w-full min-w-0"
          minWidth={160}
          fullWidth
        />
        <CleanAutoInput
          label="Temperatura"
          value={pdfData?.temperature || ""}
          unit="C"
          onChange={(val) => onDataChange("temperature", val)}
          className="h-10 text-sm font-mono"
          containerClassName="w-full min-w-0"
          minWidth={100}
          fullWidth
          type="number"
        />
        <CleanAutoInput
          label="Viscosidad"
          value={pdfData?.viscosity || ""}
          unit="cSt"
          onChange={(val) => onDataChange("viscosity", val)}
          className="h-10 text-sm font-mono"
          containerClassName="w-full min-w-0"
          minWidth={100}
          fullWidth
          type="number"
        />
        <CleanAutoInput
          label="Densidad"
          value={pdfData?.density || ""}
          unit="kg/m3"
          onChange={(val) => onDataChange("density", val)}
          className="h-10 text-sm font-mono"
          containerClassName="w-full min-w-0"
          minWidth={110}
          fullWidth
          type="number"
        />
        <CleanAutoInput
          label="Caudal"
          value={pdfData?.fluidFlowRate || ""}
          unit="m3/h"
          onChange={(val) => onDataChange("fluidFlowRate", val)}
          className="h-10 text-sm font-mono"
          containerClassName="w-full min-w-0"
          minWidth={100}
          fullWidth
          type="number"
        />
        <CleanAutoInput
          label="Altura"
          value={pdfData?.fluidHead || ""}
          unit="m"
          onChange={(val) => onDataChange("fluidHead", val)}
          className="h-10 text-sm font-mono"
          containerClassName="w-full min-w-0"
          minWidth={100}
          fullWidth
          type="number"
        />
        <CleanAutoInput
          label="Velocidad"
          value={pdfData?.fluidRpm || ""}
          unit="rpm"
          onChange={(val) => onDataChange("fluidRpm", val)}
          className="h-10 text-sm font-mono"
          containerClassName="w-full min-w-0"
          minWidth={100}
          fullWidth
          type="number"
        />
        <CleanAutoInput
          label="Potencia"
          value={pdfData?.fluidPower || ""}
          unit="kW"
          onChange={(val) => onDataChange("fluidPower", val)}
          className="h-10 text-sm font-mono"
          containerClassName="w-full min-w-0"
          minWidth={100}
          fullWidth
          type="number"
        />
        <CleanAutoInput
          label="Rendimiento"
          value={pdfData?.fluidEfficiency || ""}
          unit="%"
          onChange={(val) => onDataChange("fluidEfficiency", val)}
          className="h-10 text-sm font-mono"
          containerClassName="w-full min-w-0"
          minWidth={105}
          fullWidth
          type="number"
        />
        <CleanAutoInput
          label="CQ"
          value={pdfData?.cq || ""}
          onChange={(val) => onDataChange("cq", val)}
          className="h-10 text-sm font-mono"
          containerClassName="w-full min-w-0"
          minWidth={85}
          fullWidth
          type="number"
        />
        <CleanAutoInput
          label="CH"
          value={pdfData?.ch || ""}
          onChange={(val) => onDataChange("ch", val)}
          className="h-10 text-sm font-mono"
          containerClassName="w-full min-w-0"
          minWidth={85}
          fullWidth
          type="number"
        />
        <CleanAutoInput
          label="CE"
          value={pdfData?.ce || ""}
          onChange={(val) => onDataChange("ce", val)}
          className="h-10 text-sm font-mono"
          containerClassName="w-full min-w-0"
          minWidth={85}
          fullWidth
          type="number"
        />
      </ResponsiveFieldGrid>
    </DetailSectionCard>
  );
}
