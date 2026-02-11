/**
 * BombaDataSection Component
 * 
 * Displays and manages pump (bomba) technical data fields.
 * Follows SRP: Only responsible for pump data UI.
 */

import { Settings2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { CleanInput } from "./CleanInput";
import type { TestPdfData } from '../services/dtoMapper';

interface BombaDataSectionProps {
  pdfData: TestPdfData | null | undefined;
  generalInfo: {
    item?: string;
    modeloBomba?: string;
    ordenTrabajo?: string;
  };
  onDataChange: (field: string, value: string) => void;
}

export function BombaDataSection({ pdfData, generalInfo, onDataChange }: BombaDataSectionProps) {
  return (
    <section className="space-y-4">
      <Separator className="mb-4 -mx-4 md:-mx-6 w-auto" />
      <div>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Settings2 className="w-3.5 h-3.5 text-primary" /> Datos Bomba
        </span>
      </div>
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <CleanInput 
          label="Item" 
          value={pdfData?.item || generalInfo?.item} 
          onChange={(val) => onDataChange("item", val)} 
          className="h-8 text-xs" 
        />
        <CleanInput 
          label="Tipo Bomba" 
          value={generalInfo?.modeloBomba || pdfData?.modeloBomba} 
          className="h-8 text-xs" 
        />
        <CleanInput 
          label="Orden Trabajo" 
          value={generalInfo?.ordenTrabajo} 
          className="h-8 text-xs" 
        />
        <CleanInput 
          label="D. Aspiración" 
          value={pdfData?.suctionDiameter} 
          unit="mm" 
          onChange={(val) => onDataChange("suctionDiameter", val)} 
          className="h-8 text-xs" 
        />
        <CleanInput 
          label="D. Impulsión" 
          value={pdfData?.dischargeDiameter} 
          unit="mm" 
          onChange={(val) => onDataChange("dischargeDiameter", val)} 
          className="h-8 text-xs" 
        />
        <CleanInput 
          label="D. Rodete" 
          value={pdfData?.impellerDiameter} 
          unit="mm" 
          onChange={(val) => onDataChange("impellerDiameter", val)} 
          className="h-8 text-xs" 
        />
        <CleanInput 
          label="Tipo Cierre" 
          value={pdfData?.sealType} 
          onChange={(val) => onDataChange("sealType", val)} 
          className="h-8 text-xs" 
        />
        <div className="flex items-center gap-2 pt-4 col-span-1">
          <div className="relative flex items-center">
            <input 
              type="checkbox" 
              id="vertical"
              checked={pdfData?.vertical === true || pdfData?.vertical === "true"}
              onChange={(e) => onDataChange("vertical", e.target.checked ? "true" : "false")}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary transition-all cursor-pointer"
            />
          </div>
          <label htmlFor="vertical" className="text-[10px] font-medium text-muted-foreground cursor-pointer">
            Bomba Vertical
          </label>
        </div>
      </div>
    </section>
  );
}
