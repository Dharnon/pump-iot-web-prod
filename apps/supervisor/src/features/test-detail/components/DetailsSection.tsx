/**
 * DetailsSection Component
 *
 * Displays and manages detailed test measurements and comments.
 * Follows SRP: Only responsible for details/pressures data UI.
 */

import { Gauge } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { CleanInput } from "./CleanInput";
import { ResponsiveFieldGrid } from "./ResponsiveFieldGrid";
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
    <section className="space-y-2">
      {showExtendedSections && (
        <>
          <Separator className="mb-2 -mx-4 md:-mx-6 w-auto" />
          <div className="flex items-center justify-between pt-2">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              Detalles y Presiones
            </h3>
          </div>

          <ResponsiveFieldGrid minItemWidth={145}>
            <CleanInput
              label="Correccion Manom."
              value={pdfData?.detallesCorreccionManometrica}
              unit="m"
              onChange={(val) =>
                onDataChange("detallesCorreccionManometrica", val)
              }
              className="h-8 text-xs"
              containerClassName="min-w-0"
            />
            <CleanInput
              label="Presion Atmosf."
              value={pdfData?.detallesPresionAtmosferica}
              unit="mbar"
              onChange={(val) =>
                onDataChange("detallesPresionAtmosferica", val)
              }
              className="h-8 text-xs"
              containerClassName="min-w-0"
            />
            <CleanInput
              label="Temp. Agua"
              value={pdfData?.detallesTemperaturaAgua}
              unit="C"
              onChange={(val) => onDataChange("detallesTemperaturaAgua", val)}
              className="h-8 text-xs"
              containerClassName="min-w-0"
            />
            <CleanInput
              label="Temp. Ambiente"
              value={pdfData?.detallesTemperaturaAmbiente}
              unit="C"
              onChange={(val) =>
                onDataChange("detallesTemperaturaAmbiente", val)
              }
              className="h-8 text-xs"
              containerClassName="min-w-0"
            />
            <CleanInput
              label="Temp. Lado Acopl."
              value={pdfData?.detallesTemperaturaLadoAcoplamiento}
              unit="C"
              onChange={(val) =>
                onDataChange("detallesTemperaturaLadoAcoplamiento", val)
              }
              className="h-8 text-xs"
              containerClassName="min-w-0"
            />
            <CleanInput
              label="Temp. Lado Bomba"
              value={pdfData?.detallesTemperaturaLadoBomba}
              unit="C"
              onChange={(val) =>
                onDataChange("detallesTemperaturaLadoBomba", val)
              }
              className="h-8 text-xs"
              containerClassName="min-w-0"
            />
            <CleanInput
              label="Tiempo Func."
              value={pdfData?.detallesTiempoFuncionamientoBomba}
              unit="min"
              onChange={(val) =>
                onDataChange("detallesTiempoFuncionamientoBomba", val)
              }
              className="h-8 text-xs"
              containerClassName="min-w-0"
            />
          </ResponsiveFieldGrid>
        </>
      )}

      <ResponsiveFieldGrid minItemWidth={280} className="pt-1">
        <div className="space-y-1.5">
          <label className="text-sm max-[2048px]:text-xs max-[1600px]:text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
            Comentario
          </label>
          <textarea
            className="w-full h-20 px-3 py-2 text-xs bg-muted/30 border-transparent hover:bg-muted/50 focus:bg-background focus:border-primary/30 rounded-md resize-y transition-all placeholder:text-muted-foreground/50"
            value={pdfData?.tolerance || ""}
            onChange={(e) => onDataChange("tolerance", e.target.value)}
            placeholder="Comentario visible en protocolo..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm max-[2048px]:text-xs max-[1600px]:text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
            Comentario Interno
          </label>
          <textarea
            className="w-full h-20 px-3 py-2 text-xs bg-muted/30 border-transparent hover:bg-muted/50 focus:bg-background focus:border-primary/30 rounded-md resize-y transition-all placeholder:text-muted-foreground/50"
            value={pdfData?.internalComment || ""}
            onChange={(e) => onDataChange("internalComment", e.target.value)}
            placeholder="Notas internas (no se imprimen)..."
          />
        </div>
      </ResponsiveFieldGrid>
    </section>
  );
}
