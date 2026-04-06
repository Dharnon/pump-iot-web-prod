"use client";

import { useState, type ChangeEvent, type DragEvent } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Upload,
} from "lucide-react";

import { PdfViewer } from "@/components/PdfViewer";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import type { CsvImportResult } from "../hooks/useTestDetailPage";

type PreviewMode = "pdf" | "excel";

interface DetailPreviewPanelProps {
  isMobile: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewMode: PreviewMode;
  onPreviewModeChange: (mode: PreviewMode) => void;
  file: File | null;
  url: string | null;
  onUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  onDrop: (e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  isDragging: boolean;
  onAnalyze?: () => void;
  isAnalyzing?: boolean;
  showPdfUpload: boolean;
  csvImporting: boolean;
  csvImportResult: CsvImportResult | null;
  onApplyCsvImport: (file: File) => Promise<void>;
  t: (key: string) => string;
}

function ExcelImportPanel({
  csvImporting,
  csvImportResult,
  onApplyCsvImport,
}: Pick<
  DetailPreviewPanelProps,
  "csvImporting" | "csvImportResult" | "onApplyCsvImport"
>) {
  const [selectedCsv, setSelectedCsv] = useState<File | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedCsv(file);
  };

  const handleApply = async () => {
    if (!selectedCsv || csvImporting) {
      return;
    }
    await onApplyCsvImport(selectedCsv);
  };

  return (
    <div className="flex h-full min-h-[320px] flex-col gap-4 rounded-2xl border border-border/70 bg-muted/15 p-5">
      <div className="rounded-xl border border-border/60 bg-background/60 p-4">
        <div className="mb-3 flex items-start gap-3">
          <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background">
            <FileSpreadsheet className="size-5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-foreground">
              Importar CSV de plantilla
            </h4>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Mapa soportado: General B/C, Pruebas F/G, Hoja de datos I/J, bloques L/M y N/O.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            disabled={csvImporting}
            className="block w-full cursor-pointer rounded-lg border border-border/60 bg-background px-3 py-2 text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-foreground"
          />
          <div className="flex items-center justify-between gap-2">
            <p className="min-w-0 truncate text-xs text-muted-foreground">
              {selectedCsv ? selectedCsv.name : "Sin archivo seleccionado"}
            </p>
            <Button
              type="button"
              size="sm"
              onClick={handleApply}
              disabled={!selectedCsv || csvImporting}
            >
              {csvImporting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Aplicando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 size-4" />
                  Importar y aplicar
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {csvImportResult ? (
        <div className="rounded-xl border border-border/60 bg-background/60 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <CheckCircle2 className="size-3.5" />
            Resultado
          </div>
          <p className="text-sm font-medium text-foreground">{csvImportResult.fileName}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {csvImportResult.appliedFields.length} campos actualizados.
          </p>
          {csvImportResult.appliedFields.length > 0 ? (
            <ul className="mt-3 max-h-28 space-y-1 overflow-auto text-xs text-muted-foreground">
              {csvImportResult.appliedFields.map((field) => (
                <li key={field} className="rounded bg-muted/40 px-2 py-1 font-mono">
                  {field}
                </li>
              ))}
            </ul>
          ) : null}

          {csvImportResult.warnings.length > 0 ? (
            <div className="mt-3 rounded-lg border border-amber-300/40 bg-amber-500/10 p-3">
              <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-amber-200">
                <AlertTriangle className="size-3.5" />
                Warnings
              </div>
              <ul className="space-y-1 text-xs text-amber-100/90">
                {csvImportResult.warnings.map((warning) => (
                  <li key={warning}>- {warning}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function PreviewContent({
  previewMode,
  onPreviewModeChange,
  file,
  url,
  onUpload,
  onRemove,
  onDrop,
  onDragOver,
  onDragLeave,
  isDragging,
  onAnalyze,
  isAnalyzing,
  showPdfUpload,
  csvImporting,
  csvImportResult,
  onApplyCsvImport,
  t,
  className,
}: Omit<DetailPreviewPanelProps, "isMobile" | "open" | "onOpenChange"> & {
  className?: string;
}) {
  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div className="border-b border-border/60 px-4 py-3">
        <div className="mb-3">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            Document source
          </h3>
          <p className="text-xs leading-5 text-muted-foreground">
            Abre PDF o Excel solo cuando necesites contrastar el formulario.
          </p>
        </div>
        <Tabs
          value={previewMode}
          onValueChange={(value) =>
            onPreviewModeChange(value as "pdf" | "excel")
          }
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pdf">PDF</TabsTrigger>
            <TabsTrigger value="excel">Excel</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="min-h-0 flex-1 p-4">
        {previewMode === "pdf" ? (
          <PdfViewer
            file={file}
            url={url}
            onUpload={showPdfUpload ? onUpload : () => undefined}
            onRemove={onRemove}
            onDrop={showPdfUpload ? onDrop : () => undefined}
            onDragOver={showPdfUpload ? onDragOver : () => undefined}
            onDragLeave={showPdfUpload ? onDragLeave : () => undefined}
            isDragging={isDragging}
            onAnalyze={showPdfUpload ? onAnalyze : undefined}
            isAnalyzing={isAnalyzing}
            t={t}
          />
        ) : (
          <ExcelImportPanel
            csvImporting={csvImporting}
            csvImportResult={csvImportResult}
            onApplyCsvImport={onApplyCsvImport}
          />
        )}
      </div>
    </div>
  );
}

export function DetailPreviewPanel({
  isMobile,
  open,
  onOpenChange,
  ...props
}: DetailPreviewPanelProps) {
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-[92vw] max-w-xl p-0 sm:max-w-xl">
          <SheetHeader className="border-b border-border/60">
            <SheetTitle>Source preview</SheetTitle>
            <SheetDescription>
              Contrasta el formulario con el archivo de origen cuando lo
              necesites.
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1">
            <PreviewContent {...props} className="h-full" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (!open) {
    return null;
  }

  return (
    <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/35 shadow-sm">
      <PreviewContent {...props} className="h-full" />
    </aside>
  );
}
