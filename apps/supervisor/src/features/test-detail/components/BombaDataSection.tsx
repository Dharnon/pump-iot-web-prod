/**
 * BombaDataSection Component
 */

import { Settings2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { CleanAutoInput } from "./CleanAutoInput";
import { ResponsiveFieldFlow } from "./ResponsiveFieldFlow";
import type { TestPdfData } from "../services/dtoMapper";

interface BombaDataSectionProps {
  pdfData: TestPdfData | null | undefined;
  generalInfo: {
    item?: string;
    modeloBomba?: string;
    ordenTrabajo?: string;
  };
  onDataChange: (field: string, value: string) => void;
  allFieldsEditable?: boolean;
}

export function BombaDataSection({
  pdfData,
  generalInfo,
  onDataChange,
  allFieldsEditable = false,
}: BombaDataSectionProps) {
  return (
    <section className="space-y-2">
      <Separator className="mb-2 -mx-4 md:-mx-6 w-auto" />
      <div>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Settings2 className="w-3.5 h-3.5 text-primary" /> Datos Bomba
        </span>
      </div>

      <ResponsiveFieldFlow>
        <CleanAutoInput
          label="Item"
          value={generalInfo?.item || pdfData?.item || ""}
          onChange={(val) => onDataChange("item", val)}
          className="h-8 text-xs font-mono"
          minWidth={90}
        />
        <CleanAutoInput
          label="Tipo Bomba"
          value={generalInfo?.modeloBomba || pdfData?.modeloBomba || ""}
          onChange={
            allFieldsEditable
              ? (val) => onDataChange("modeloBomba", val)
              : undefined
          }
          className="h-8 text-xs font-mono"
          minWidth={240}
        />
        <CleanAutoInput
          label="Orden Trabajo"
          value={generalInfo?.ordenTrabajo || ""}
          onChange={
            allFieldsEditable
              ? (val) => onDataChange("ordenTrabajo", val)
              : undefined
          }
          className="h-8 text-xs font-mono"
          minWidth={150}
        />
        <CleanAutoInput
          label="D. Aspiracion"
          value={pdfData?.suctionDiameter || ""}
          unit="mm"
          onChange={(val) => onDataChange("suctionDiameter", val)}
          className="h-8 text-xs font-mono"
          minWidth={110}
          type="number"
        />
        <CleanAutoInput
          label="D. Impulsion"
          value={pdfData?.dischargeDiameter || ""}
          unit="mm"
          onChange={(val) => onDataChange("dischargeDiameter", val)}
          className="h-8 text-xs font-mono"
          minWidth={110}
          type="number"
        />
        <CleanAutoInput
          label="D. Rodete"
          value={pdfData?.impellerDiameter || ""}
          unit="mm"
          onChange={(val) => onDataChange("impellerDiameter", val)}
          className="h-8 text-xs font-mono"
          minWidth={110}
          type="number"
        />
        <CleanAutoInput
          label="Tipo Cierre"
          value={pdfData?.sealType || ""}
          onChange={(val) => onDataChange("sealType", val)}
          className="h-8 text-xs font-mono"
          minWidth={140}
        />
        <div className="flex min-h-8 items-center justify-center gap-2 rounded-md border border-border/60 bg-muted/10 px-3">
          <input
            type="checkbox"
            id="vertical"
            checked={pdfData?.vertical === true || pdfData?.vertical === "true"}
            onChange={(e) =>
              onDataChange("vertical", e.target.checked ? "true" : "false")
            }
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary transition-all cursor-pointer"
          />
          <label
            htmlFor="vertical"
            className="text-xs max-[2048px]:text-[10px] max-[1600px]:text-[9px] font-medium text-muted-foreground cursor-pointer whitespace-nowrap"
          >
            Bomba Vertical
          </label>
        </div>
      </ResponsiveFieldFlow>
    </section>
  );
}
