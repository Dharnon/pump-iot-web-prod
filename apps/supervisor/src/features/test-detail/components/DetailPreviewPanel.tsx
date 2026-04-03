"use client";

import type { ChangeEvent, DragEvent } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";

import { PdfViewer } from "@/components/PdfViewer";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

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
  t: (key: string) => string;
}

function ExcelPreviewPlaceholder() {
  return (
    <div className="flex h-full min-h-[320px] flex-col justify-between rounded-2xl border border-dashed border-border/70 bg-muted/20 p-5">
      <div>
        <div className="mb-3 flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-background/70">
          <FileSpreadsheet className="size-5 text-muted-foreground" />
        </div>
        <h4 className="text-sm font-semibold text-foreground">
          Vista previa de Excel
        </h4>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Este panel queda preparado para contrastar la importación Excel contra
          los datos del formulario. La integración de renderizado del archivo se
          puede conectar después sin cambiar el layout.
        </p>
      </div>
      <div className="rounded-xl border border-border/60 bg-background/60 p-4">
        <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <FileText className="size-3.5" />
          Validation aid
        </div>
        <p className="text-sm text-muted-foreground">
          Úsalo como apoyo opcional durante validación, no como superficie
          principal de trabajo.
        </p>
      </div>
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
  t,
  className,
}: Omit<DetailPreviewPanelProps, "isMobile" | "open" | "onOpenChange"> & {
  className?: string;
}) {
  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div className="border-b border-border/60 px-4 py-3">
        <div className="mb-2">
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

      <div className="min-h-0 flex-1 p-3">
        {previewMode === "pdf" ? (
          <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/50">
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
          </div>
        ) : (
          <ExcelPreviewPlaceholder />
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
    <aside className="min-h-0 overflow-hidden rounded-2xl border border-border/60 bg-card/45 shadow-sm">
      <ScrollArea className="h-full">
        <PreviewContent {...props} />
      </ScrollArea>
    </aside>
  );
}
