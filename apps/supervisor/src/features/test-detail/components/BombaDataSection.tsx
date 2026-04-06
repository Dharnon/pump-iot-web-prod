/**
 * BombaDataSection Component
 */

import { CleanAutoInput } from "./CleanAutoInput";
import { ResponsiveFieldFlow } from "./ResponsiveFieldFlow";
import type { TestPdfData } from "../services/dtoMapper";
import { DetailSectionCard } from "./DetailSectionCard";

interface BombaDataSectionProps {
  pdfData: TestPdfData | null | undefined;
  generalInfo: {
    item?: string;
    modeloBomba?: string;
    ordenTrabajo?: string;
  };
  onDataChange: (field: string, value: string) => void;
  allFieldsEditable?: boolean;
  className?: string;
}

export function BombaDataSection({
  pdfData,
  generalInfo,
  onDataChange,
  allFieldsEditable = false,
  className,
}: BombaDataSectionProps) {
  return (
    <DetailSectionCard
      title="Datos bomba"
      className={className}
      icon={
        <img
          src="/icons/water-pump.png"
          alt="Bomba"
          className="size-6 brightness-0 dark:invert"
        />
      }
      contentClassName="space-y-0"
    >
      <ResponsiveFieldFlow>
        <CleanAutoInput
          label="Item"
          value={generalInfo?.item || pdfData?.item || ""}
          onChange={(val) => onDataChange("item", val)}
          className="h-10 text-sm font-mono"
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
          className="h-10 text-sm font-mono"
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
          className="h-10 text-sm font-mono"
          minWidth={150}
        />
        <CleanAutoInput
          label="D. Aspiracion"
          value={pdfData?.suctionDiameter || ""}
          unit="mm"
          onChange={(val) => onDataChange("suctionDiameter", val)}
          className="h-10 text-sm font-mono"
          minWidth={110}
          type="number"
        />
        <CleanAutoInput
          label="D. Impulsion"
          value={pdfData?.dischargeDiameter || ""}
          unit="mm"
          onChange={(val) => onDataChange("dischargeDiameter", val)}
          className="h-10 text-sm font-mono"
          minWidth={110}
          type="number"
        />
        <CleanAutoInput
          label="D. Rodete"
          value={pdfData?.impellerDiameter || ""}
          unit="mm"
          onChange={(val) => onDataChange("impellerDiameter", val)}
          className="h-10 text-sm font-mono"
          minWidth={110}
          type="number"
        />
        <CleanAutoInput
          label="Tipo Cierre"
          value={pdfData?.sealType || ""}
          onChange={(val) => onDataChange("sealType", val)}
          className="h-10 text-sm font-mono"
          minWidth={140}
        />
        <div className="flex min-w-0 flex-col gap-2">
          <label
            htmlFor="vertical"
            className="cursor-pointer text-sm font-semibold uppercase tracking-tight text-muted-foreground"
          >
            Bomba Vertical
          </label>
          <div className="flex h-10 items-center rounded-md border border-transparent bg-muted/20 px-3 transition-all hover:bg-muted/40">
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
    </DetailSectionCard>
  );
}
