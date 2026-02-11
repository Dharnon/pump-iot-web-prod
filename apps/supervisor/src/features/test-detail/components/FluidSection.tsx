/**
 * FluidSection Component
 * 
 * Displays and manages guaranteed point in fluid data.
 * Follows SRP: Only responsible for fluid point data UI.
 */

import { Droplets } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { CleanInput } from "./CleanInput";
import type { TestPdfData } from '../services/dtoMapper';

interface FluidSectionProps {
  pdfData: TestPdfData | null | undefined;
  onDataChange: (field: string, value: string) => void;
  allFieldsEditable?: boolean;
}

export function FluidSection({ pdfData, onDataChange, allFieldsEditable = false }: FluidSectionProps) {
  return (
    <section className="space-y-4">
      <Separator className="mb-4 -mx-4 md:-mx-6 w-auto" />
      <div>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Droplets className="w-3.5 h-3.5 text-orange-500" /> Punto Garantizado en Fluido
        </span>
      </div>
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <CleanInput 
          label="Fluido" 
          value={pdfData?.liquidDescription} 
          onChange={(val) => onDataChange("liquidDescription", val)} 
          className="col-span-2 md:col-span-1 h-8 text-xs" 
        />
        <CleanInput 
          label="Temperatura" 
          value={pdfData?.temperature} 
          unit="°C" 
          onChange={(val) => onDataChange("temperature", val)} 
          className="h-8 text-xs" 
        />
        <CleanInput 
          label="Viscosidad" 
          value={pdfData?.viscosity} 
          unit="cSt" 
          onChange={(val) => onDataChange("viscosity", val)} 
          className="h-8 text-xs" 
        />
        <CleanInput 
          label="Densidad" 
          value={pdfData?.density} 
          unit="kg/m³" 
          onChange={(val) => onDataChange("density", val)} 
          className="h-8 text-xs" 
        />
        <div className="hidden lg:block lg:col-span-1"></div>

        <CleanInput 
          label="Caudal" 
          value={pdfData?.fluidFlowRate} 
          unit="m³/h" 
          onChange={(val) => onDataChange("fluidFlowRate", val)} 
          className="h-8 text-xs" 
        />
        <CleanInput 
          label="Altura" 
          value={pdfData?.fluidHead} 
          unit="m" 
          onChange={(val) => onDataChange("fluidHead", val)} 
          className="h-8 text-xs" 
        />
        <CleanInput 
          label="Velocidad" 
          value={pdfData?.fluidRpm} 
          unit="rpm" 
          onChange={(val) => onDataChange("fluidRpm", val)} 
          className="h-8 text-xs" 
        />
        <CleanInput 
          label="Potencia" 
          value={pdfData?.fluidPower} 
          unit="kW" 
          onChange={(val) => onDataChange("fluidPower", val)} 
          className="h-8 text-xs" 
        />
        <CleanInput 
          label="Rendimiento" 
          value={pdfData?.fluidEfficiency} 
          unit="%" 
          onChange={(val) => onDataChange("fluidEfficiency", val)} 
          className="h-8 text-xs" 
        />
      </div>
      <div className="grid gap-3 grid-cols-3 max-w-sm pt-2">
        <CleanInput 
          label="CQ" 
          value={pdfData?.cq} 
          onChange={(val) => onDataChange("cq", val)} 
          className="h-8 text-xs" 
        />
        <CleanInput 
          label="CH" 
          value={pdfData?.ch} 
          onChange={(val) => onDataChange("ch", val)} 
          className="h-8 text-xs" 
        />
        <CleanInput 
          label="CE" 
          value={pdfData?.ce} 
          onChange={(val) => onDataChange("ce", val)} 
          className="h-8 text-xs" 
        />
      </div>
    </section>
  );
}
