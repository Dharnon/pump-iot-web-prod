/**
 * BombaDataSection Component
 * 
 * Displays and manages pump (bomba) technical data fields.
 * Follows SRP: Only responsible for pump data UI.
 */

import { Settings2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { CleanAutoInput } from "./CleanAutoInput";
import type { TestPdfData } from '../services/dtoMapper';

interface BombaDataSectionProps {
  pdfData: TestPdfData | null | undefined;
  generalInfo: {
    item?: string;
    modeloBomba?: string;
    ordenTrabajo?: string;
  };
  onDataChange: (field: string, value: string) => void;
  allFieldsEditable?: boolean; // New prop for protocolo view
}

export function BombaDataSection({ pdfData, generalInfo, onDataChange, allFieldsEditable = false }: BombaDataSectionProps) {
  return (
    <section className="space-y-4">
      <Separator className="mb-4 -mx-4 md:-mx-6 w-auto" />
      <div>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Settings2 className="w-3.5 h-3.5 text-primary" /> Datos Bomba
        </span>
      </div>
      <div className="flex flex-wrap gap-4 items-start">
        <CleanAutoInput
          label="Item"
          value={pdfData?.item || generalInfo?.item}
          onChange={(val) => onDataChange("item", val)}
          className="h-9 text-sm"
          minWidth={80}
        />
        <CleanAutoInput
          label="Tipo Bomba"
          value={generalInfo?.modeloBomba || pdfData?.modeloBomba}
          onChange={allFieldsEditable ? (val) => onDataChange("modeloBomba", val) : undefined}
          className="h-9 text-sm"
          minWidth={160}
        />
        <CleanAutoInput
          label="Orden Trabajo"
          value={generalInfo?.ordenTrabajo}
          onChange={allFieldsEditable ? (val) => onDataChange("ordenTrabajo", val) : undefined}
          className="h-9 text-sm"
          minWidth={120}
        />
        <CleanAutoInput
          label="D. Aspiración"
          value={pdfData?.suctionDiameter}
          unit="mm"
          onChange={(val) => onDataChange("suctionDiameter", val)}
          className="h-9 text-sm text-right"
          minWidth={80}
        />
        <CleanAutoInput
          label="D. Impulsión"
          value={pdfData?.dischargeDiameter}
          unit="mm"
          onChange={(val) => onDataChange("dischargeDiameter", val)}
          className="h-9 text-sm text-right"
          minWidth={80}
        />
        <CleanAutoInput
          label="D. Rodete"
          value={pdfData?.impellerDiameter}
          unit="mm"
          onChange={(val) => onDataChange("impellerDiameter", val)}
          className="h-9 text-sm text-right"
          minWidth={80}
        />
        <CleanAutoInput
          label="Tipo Cierre"
          value={pdfData?.sealType}
          onChange={(val) => onDataChange("sealType", val)}
          className="h-9 text-sm"
          minWidth={120}
        />
        <div className="flex items-center gap-2 pt-6 min-w-[120px]">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              id="vertical"
              checked={pdfData?.vertical === true || pdfData?.vertical === "true"}
              onChange={(e) => onDataChange("vertical", e.target.checked ? "true" : "false")}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary transition-all cursor-pointer"
            />
          </div>
          <label htmlFor="vertical" className="text-xs font-medium text-muted-foreground cursor-pointer whitespace-nowrap">
            Bomba Vertical
          </label>
        </div>
      </div>
    </section>
  );
}
