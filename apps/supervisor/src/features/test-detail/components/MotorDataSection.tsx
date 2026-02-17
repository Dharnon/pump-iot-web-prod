/**
 * MotorDataSection Component
 *
 * Displays and manages motor technical data fields.
 * Follows SRP: Only responsible for motor data UI.
 */

import { Settings2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { CleanAutoInput } from "./CleanAutoInput";
import type { TestPdfData } from "../services/dtoMapper";

interface MotorDataSectionProps {
  pdfData: TestPdfData | null | undefined;
  onDataChange: (field: string, value: string) => void;
  allFieldsEditable?: boolean;
}

export function MotorDataSection({
  pdfData,
  onDataChange,
  allFieldsEditable = false,
}: MotorDataSectionProps) {
  return (
    <section className="space-y-4">
      <Separator className="mb-4 -mx-4 md:-mx-6 w-auto" />
      <div className="flex items-center justify-between pt-2">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Settings2 className="w-4 h-4" />
          Motor
        </h3>
      </div>
      <div className="flex flex-wrap gap-4 items-start">
        <CleanAutoInput
          label="Marca"
          value={pdfData?.motorMarca}
          onChange={(val) => onDataChange("motorMarca", val)}
          className="h-9 text-sm"
          minWidth={120}
        />
        <CleanAutoInput
          label="Tipo"
          value={pdfData?.motorTipo}
          onChange={(val) => onDataChange("motorTipo", val)}
          className="h-9 text-sm"
          minWidth={120}
        />
        <CleanAutoInput
          label="Potencia"
          value={pdfData?.motorPotencia}
          unit="kW"
          onChange={(val) => onDataChange("motorPotencia", val)}
          className="h-9 text-sm text-right font-mono"
          minWidth={80}
          type="number"
        />
        <CleanAutoInput
          label="Velocidad"
          value={pdfData?.motorVelocidad}
          unit="rpm"
          onChange={(val) => onDataChange("motorVelocidad", val)}
          className="h-9 text-sm text-right font-mono"
          minWidth={80}
          type="number"
        />
        <CleanAutoInput
          label="Intensidad"
          value={pdfData?.motorIntensidad}
          unit="A"
          onChange={(val) => onDataChange("motorIntensidad", val)}
          className="h-9 text-sm text-right font-mono"
          minWidth={80}
          type="number"
        />
      </div>
      <div className="flex flex-wrap gap-4 items-start pt-2">
        <CleanAutoInput
          label="η 25%"
          value={pdfData?.motorRendimiento25}
          unit="%"
          onChange={(val) => onDataChange("motorRendimiento25", val)}
          className="h-9 text-sm text-right font-mono"
          minWidth={80}
          type="number"
        />
        <CleanAutoInput
          label="η 50%"
          value={pdfData?.motorRendimiento50}
          unit="%"
          onChange={(val) => onDataChange("motorRendimiento50", val)}
          className="h-9 text-sm text-right font-mono"
          minWidth={80}
          type="number"
        />
        <CleanAutoInput
          label="η 75%"
          value={pdfData?.motorRendimiento75}
          unit="%"
          onChange={(val) => onDataChange("motorRendimiento75", val)}
          className="h-9 text-sm text-right font-mono"
          minWidth={80}
          type="number"
        />
        <CleanAutoInput
          label="η 100%"
          value={pdfData?.motorRendimiento100}
          unit="%"
          onChange={(val) => onDataChange("motorRendimiento100", val)}
          className="h-9 text-sm text-right font-mono"
          minWidth={80}
          type="number"
        />
        <CleanAutoInput
          label="η 125%"
          value={pdfData?.motorRendimiento125}
          unit="%"
          onChange={(val) => onDataChange("motorRendimiento125", val)}
          className="h-9 text-sm text-right font-mono"
          minWidth={80}
          type="number"
        />
      </div>
    </section>
  );
}
