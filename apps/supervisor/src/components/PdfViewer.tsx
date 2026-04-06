import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, X, FileText, Upload, Search, Expand } from "lucide-react";

interface PdfViewerProps {
  file: File | null;
  url: string | null;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  isDragging: boolean;
  onAnalyze?: () => void;
  isAnalyzing?: boolean;
  t: (key: string) => string;
}

export function PdfViewer({
  file,
  url,
  onUpload,
  onRemove,
  onDrop,
  onDragOver,
  onDragLeave,
  isDragging,
  onAnalyze,
  isAnalyzing = false,
  t,
}: PdfViewerProps) {
  const pdfSrc = url
    ? `${url}${url.includes("#") ? "&" : "#"}toolbar=0&navpanes=0&scrollbar=1&view=FitH`
    : null;
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const isLoading = Boolean(pdfSrc && loadedSrc !== pdfSrc);

  if (url) {
    return (
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/45">
        <div className="shrink-0 border-b border-border/60 bg-background/70 px-4 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/30">
              <FileText className="size-4 text-red-500 dark:text-red-400" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.18em] leading-none text-muted-foreground">
                {t("test.viewing")}
              </span>
              <span
                className="line-clamp-2 text-sm font-semibold leading-5 text-foreground"
                title={file?.name}
              >
                {file?.name}
              </span>
            </div>
            {url ? (
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-muted-foreground hover:bg-muted"
                title="Abrir en grande"
              >
                <a href={url} target="_blank" rel="noreferrer">
                  <Expand className="size-4" />
                </a>
              </Button>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {onAnalyze ? (
              <Button
                size="sm"
                variant="outline"
                className="h-8 rounded-lg border-primary/25 px-3 text-[11px] font-semibold text-primary hover:bg-primary/10"
                onClick={onAnalyze}
                disabled={!file || isAnalyzing}
              >
                {isAnalyzing ? (
                  <Loader2 className="mr-2 size-3.5 animate-spin" />
                ) : (
                  <Search className="mr-2 size-3.5" />
                )}
                {isAnalyzing ? "Analizando..." : "Analizar PDF"}
              </Button>
            ) : null}
            <Button
              size="sm"
              variant="ghost"
              className="h-8 rounded-lg px-3 text-[11px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => document.getElementById("pdf-upload")?.click()}
            >
              <RefreshCw className="mr-2 size-3.5" />
              {t("test.changePdf")}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              onClick={onRemove}
              title="Cerrar archivo"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        <div className="relative min-h-0 flex-1 bg-[#121212]">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
              <div className="flex flex-col items-center">
                <Loader2 className="mb-2 size-8 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground">
                  Cargando visualizador...
                </p>
              </div>
            </div>
          )}
          <iframe
            src={pdfSrc ?? undefined}
            className="h-full min-h-[28rem] w-full border-none bg-white"
            title="PDF Preview"
            onLoad={() => setLoadedSrc(pdfSrc)}
          />
        </div>
        <input
          type="file"
          id="pdf-upload"
          className="hidden"
          accept=".pdf"
          onChange={onUpload}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col p-4 sm:p-8">
      <div
        className={`
                    flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all duration-200 select-none min-h-[300px]
                    ${isDragging ? "border-red-500 bg-red-500/5" : "border-border bg-muted/30 hover:border-red-500/30 hover:bg-muted/50"}
                `}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4 sm:mb-6">
          <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3 px-4 text-center">
          {t("test.upload.title")}
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground max-w-sm text-center mb-6 sm:mb-8 leading-relaxed px-6">
          {t("test.upload.desc")}
        </p>
        <Button
          className="bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-4 sm:py-5 h-auto text-sm sm:text-base rounded-lg shadow-md hover:shadow-lg transition-all font-semibold"
          onClick={() => document.getElementById("pdf-upload")?.click()}
        >
          <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          {t("test.upload.btn")}
        </Button>
      </div>
      <input
        type="file"
        id="pdf-upload"
        className="hidden"
        accept=".pdf"
        onChange={onUpload}
      />
    </div>
  );
}
