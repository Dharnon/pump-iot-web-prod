import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, X, FileText, Upload, Search } from 'lucide-react';

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
    t
}: PdfViewerProps) {
    const [isLoading, setIsLoading] = useState(false);

    // Reset loading when URL changes to a valid URL
    useEffect(() => {
        if (url) {
            setIsLoading(true);
        }
    }, [url]);

    const handleIframeLoad = () => {
        setIsLoading(false);
    };

    if (url) {
        return (
            <div className="flex-1 flex flex-col min-h-0 relative">
                {/* PDF Header - Full Width */}
                <div className="flex flex-row items-center justify-between px-2 py-2 bg-background border-b shrink-0 gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded bg-red-50 dark:bg-red-950/30 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-red-500 dark:text-red-400" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider leading-none mb-1">{t("test.viewing")}</span>
                            <span className="text-xs sm:text-sm font-semibold text-foreground truncate max-w-[200px] sm:max-w-[300px]" title={file?.name}>
                                {file?.name}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 py-0 px-3 text-[11px] font-semibold border-primary/30 text-primary hover:bg-primary/10 shadow-sm whitespace-nowrap"
                            onClick={onAnalyze}
                            disabled={!file || isAnalyzing}
                        >
                            {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Search className="w-3.5 h-3.5 mr-2" />}
                            {isAnalyzing ? "Analizando..." : "Analizar PDF"}
                        </Button>
                        <div className="h-6 w-px bg-border/50" />
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 py-0 px-3 text-[11px] font-semibold border-border/50 hover:bg-muted hover:text-foreground transition-colors shadow-sm whitespace-nowrap"
                            onClick={() => document.getElementById('pdf-upload')?.click()}
                        >
                            <RefreshCw className="w-3.5 h-3.5 mr-2" />
                            {t("test.changePdf")}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={onRemove}
                            title="Cerrar archivo"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* PDF Content - Full Width */}
                <div className="flex-1 w-full relative bg-muted/20">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10 backdrop-blur-sm">
                            <div className="flex flex-col items-center">
                                <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                                <p className="text-sm font-medium text-muted-foreground">Cargando visualizador...</p>
                            </div>
                        </div>
                    )}
                    <iframe
                        src={url}
                        className="w-full h-full border-none"
                        title="PDF Preview"
                        onLoad={handleIframeLoad}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col p-4 sm:p-8">
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
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3 px-4 text-center">{t("test.upload.title")}</h3>
                <p className="text-sm sm:text-base text-muted-foreground max-w-sm text-center mb-6 sm:mb-8 leading-relaxed px-6">
                    {t("test.upload.desc")}
                </p>
                <Button
                    className="bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-4 sm:py-5 h-auto text-sm sm:text-base rounded-lg shadow-md hover:shadow-lg transition-all font-semibold"
                    onClick={() => document.getElementById('pdf-upload')?.click()}
                >
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    {t("test.upload.btn")}
                </Button>
            </div>
            <input type="file" id="pdf-upload" className="hidden" accept=".pdf" onChange={onUpload} />
        </div>
    );
}
