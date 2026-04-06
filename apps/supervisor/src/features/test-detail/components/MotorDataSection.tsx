/**
 * MotorDataSection Component
 */

import Image from "next/image";

import { CleanAutoInput } from "./CleanAutoInput";
import { ResponsiveFieldFlow } from "./ResponsiveFieldFlow";
import type { TestPdfData } from "../services/dtoMapper";
import { DetailSectionCard } from "./DetailSectionCard";

interface MotorDataSectionProps {
  pdfData: TestPdfData | null | undefined;
  onDataChange: (field: string, value: string) => void;
  allFieldsEditable?: boolean;
}

export function MotorDataSection({
  pdfData,
  onDataChange,
}: MotorDataSectionProps) {
  return (
    <DetailSectionCard
      title="Motor"
      icon={
        <Image
          src="/icons/motor.png"
          alt="Motor"
          width={24}
          height={24}
          className="size-6 brightness-0 dark:invert"
        />
      }
      contentClassName="space-y-0"
    >
      <ResponsiveFieldFlow>
        <CleanAutoInput
          label="Marca"
          value={pdfData?.motorMarca ?? ""}
          onChange={(val) => onDataChange("motorMarca", val)}
          className="h-10 text-sm font-mono"
          minWidth={120}
        />
        <CleanAutoInput
          label="Tipo"
          value={pdfData?.motorTipo ?? ""}
          onChange={(val) => onDataChange("motorTipo", val)}
          className="h-10 text-sm font-mono"
          minWidth={140}
        />
        <CleanAutoInput
          label="Potencia"
          value={pdfData?.motorPotencia ?? ""}
          unit="kW"
          onChange={(val) => onDataChange("motorPotencia", val)}
          className="h-10 text-sm font-mono"
          minWidth={105}
          type="number"
        />
        <CleanAutoInput
          label="Velocidad"
          value={pdfData?.motorVelocidad ?? ""}
          unit="rpm"
          onChange={(val) => onDataChange("motorVelocidad", val)}
          className="h-10 text-sm font-mono"
          minWidth={110}
          type="number"
        />
        <CleanAutoInput
          label="Intensidad"
          value={pdfData?.motorIntensidad ?? ""}
          unit="A"
          onChange={(val) => onDataChange("motorIntensidad", val)}
          className="h-10 text-sm font-mono"
          minWidth={100}
          type="number"
        />
        <CleanAutoInput
          label="Eta 25%"
          value={pdfData?.motorRendimiento25 ?? ""}
          unit="%"
          onChange={(val) => onDataChange("motorRendimiento25", val)}
          className="h-10 text-sm font-mono"
          minWidth={95}
          type="number"
        />
        <CleanAutoInput
          label="Eta 50%"
          value={pdfData?.motorRendimiento50 ?? ""}
          unit="%"
          onChange={(val) => onDataChange("motorRendimiento50", val)}
          className="h-10 text-sm font-mono"
          minWidth={95}
          type="number"
        />
        <CleanAutoInput
          label="Eta 75%"
          value={pdfData?.motorRendimiento75 ?? ""}
          unit="%"
          onChange={(val) => onDataChange("motorRendimiento75", val)}
          className="h-10 text-sm font-mono"
          minWidth={95}
          type="number"
        />
        <CleanAutoInput
          label="Eta 100%"
          value={pdfData?.motorRendimiento100 ?? ""}
          unit="%"
          onChange={(val) => onDataChange("motorRendimiento100", val)}
          className="h-10 text-sm font-mono"
          minWidth={95}
          type="number"
        />
        <CleanAutoInput
          label="Eta 125%"
          value={pdfData?.motorRendimiento125 ?? ""}
          unit="%"
          onChange={(val) => onDataChange("motorRendimiento125", val)}
          className="h-10 text-sm font-mono"
          minWidth={95}
          type="number"
        />
      </ResponsiveFieldFlow>
    </DetailSectionCard>
  );
}
