import { MessageSquareText } from "lucide-react";

import type { TestPdfData } from "../services/dtoMapper";

import { DetailSectionCard } from "./DetailSectionCard";
import { ResponsiveFieldGrid } from "./ResponsiveFieldGrid";

interface DetailsSectionProps {
  pdfData: TestPdfData | null | undefined;
  onDataChange: (field: string, value: string) => void;
}

export function DetailsSection({
  pdfData,
  onDataChange,
}: DetailsSectionProps) {
  return (
    <DetailSectionCard
      title="Comentarios"
      icon={<MessageSquareText className="size-5" />}
      contentClassName="space-y-0"
    >
      <ResponsiveFieldGrid minItemWidth={280} gapClassName="gap-3">
        <div className="min-w-0 space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Comentario
          </label>
          <textarea
            className="h-24 w-full resize-y rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm transition-all placeholder:text-muted-foreground/50 hover:bg-background focus:border-input focus:bg-background dark:bg-muted/15 dark:hover:bg-muted/25"
            value={pdfData?.tolerance || ""}
            onChange={(event) => onDataChange("tolerance", event.target.value)}
            placeholder="Comentario visible en protocolo..."
          />
        </div>
        <div className="min-w-0 space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Comentario Interno
          </label>
          <textarea
            className="h-24 w-full resize-y rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm transition-all placeholder:text-muted-foreground/50 hover:bg-background focus:border-input focus:bg-background dark:bg-muted/15 dark:hover:bg-muted/25"
            value={pdfData?.internalComment || ""}
            onChange={(event) =>
              onDataChange("internalComment", event.target.value)
            }
            placeholder="Notas internas (no se imprimen)..."
          />
        </div>
      </ResponsiveFieldGrid>
    </DetailSectionCard>
  );
}
