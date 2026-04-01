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
        <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <img
            src="/icons/water-pump.png"
            alt="Bomba"
            className="w-5 h-5 brightness-0 dark:invert"
          />
          Datos Bomba
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
        <div className="flex flex-col gap-1.5 max-[2048px]:gap-0.75 max-[1600px]:gap-0.5 min-w-0">
          <label
            htmlFor="vertical"
            className="text-sm max-[2048px]:text-xs max-[1600px]:text-[10px] uppercase font-bold tracking-tight leading-none text-muted-foreground cursor-pointer"
          >
            Bomba Vertical
          </label>
          <div className="flex h-9 max-[2048px]:h-7 max-[1600px]:h-6.5 items-center rounded-md border border-transparent bg-muted/20 hover:bg-muted/40 transition-all px-3">
            <input
              type="checkbox"
              id="vertical"
              checked={
                pdfData?.vertical === true || pdfData?.vertical === "true"
              }
              onChange={(e) =>
                onDataChange("vertical", e.target.checked ? "true" : "false")
              }
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary transition-all cursor-pointer"
            />
          </div>
        </div>
      </ResponsiveFieldFlow>
    </section>
  );
}
