/**
 * DetailsSection Component
 *
 * Displays and manages detailed test measurements and comments.
 * Follows SRP: Only responsible for details/pressures data UI.
 */

import { Gauge } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { CleanInput } from "./CleanInput";
import type { TestPdfData } from "../services/dtoMapper";

interface DetailsSectionProps {
  pdfData: TestPdfData | null | undefined;
  onDataChange: (field: string, value: string) => void;
  allFieldsEditable?: boolean;
  showExtendedSections?: boolean;
}

export function DetailsSection({
  pdfData,
  onDataChange,
  allFieldsEditable = false,
  showExtendedSections = true,
}: DetailsSectionProps) {
  return (
    <section className="space-y-4">
      {showExtendedSections && (
        <>
          <Separator className="mb-4 -mx-4 md:-mx-6 w-auto" />
          <div className="flex items-center justify-between pt-2">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              Detalles y Presiones
            </h3>
          </div>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <CleanInput
              label="Corrección Manom."
              value={pdfData?.detallesCorreccionManometrica}
              unit="m"
              onChange={(val) =>
                onDataChange("detallesCorreccionManometrica", val)
              }
              className="h-8 text-xs"
            />
            <CleanInput
              label="Presión Atmosf."
              value={pdfData?.detallesPresionAtmosferica}
              unit="mbar"
              onChange={(val) =>
                onDataChange("detallesPresionAtmosferica", val)
              }
              className="h-8 text-xs"
            />
            <CleanInput
              label="Temp. Agua"
              value={pdfData?.detallesTemperaturaAgua}
              unit="°C"
              onChange={(val) => onDataChange("detallesTemperaturaAgua", val)}
              className="h-8 text-xs"
            />
            <CleanInput
              label="Temp. Ambiente"
              value={pdfData?.detallesTemperaturaAmbiente}
              unit="°C"
              onChange={(val) =>
                onDataChange("detallesTemperaturaAmbiente", val)
              }
              className="h-8 text-xs"
            />
            <CleanInput
              label="Temp. Lado Acopl."
              value={pdfData?.detallesTemperaturaLadoAcoplamiento}
              unit="°C"
              onChange={(val) =>
                onDataChange("detallesTemperaturaLadoAcoplamiento", val)
              }
              className="h-8 text-xs"
            />
            <CleanInput
              label="Temp. Lado Bomba"
              value={pdfData?.detallesTemperaturaLadoBomba}
              unit="°C"
              onChange={(val) =>
                onDataChange("detallesTemperaturaLadoBomba", val)
              }
              className="h-8 text-xs"
            />
            <CleanInput
              label="Tiempo Func."
              value={pdfData?.detallesTiempoFuncionamientoBomba}
              unit="min"
              onChange={(val) =>
                onDataChange("detallesTiempoFuncionamientoBomba", val)
              }
              className="h-8 text-xs"
            />
          </div>
        </>
      )}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 pt-2">
        <div className="space-y-1.5">
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Comentario
          </label>
          <textarea
            className="w-full h-20 px-3 py-2 text-xs bg-muted/30 border-transparent hover:bg-muted/50 focus:bg-background focus:border-primary/30 rounded-md resize-none transition-all placeholder:text-muted-foreground/50"
            value={pdfData?.tolerance || ""}
            onChange={(e) => onDataChange("tolerance", e.target.value)}
            placeholder="Comentario visible en protocolo..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Comentario Interno
          </label>
          <textarea
            className="w-full h-20 px-3 py-2 text-xs bg-muted/30 border-transparent hover:bg-muted/50 focus:bg-background focus:border-primary/30 rounded-md resize-none transition-all placeholder:text-muted-foreground/50"
            value={pdfData?.internalComment || ""}
            onChange={(e) => onDataChange("internalComment", e.target.value)}
            placeholder="Notas internas (no se imprimen)..."
          />
        </div>
      </div>
    </section>
  );
}
