"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Download, Loader2, File, CheckCircle2 } from "lucide-react";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";

/**
 * PDF Extractor Page - View and extract content from PDF reports
 * Includes Empty state and consistent UI
 */
export default function PdfExtractorPage() {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [extracting, setExtracting] = useState(false);
    const [extractedData, setExtractedData] = useState<any>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === "application/pdf") {
            setPdfFile(file);
            setPdfUrl(URL.createObjectURL(file));
            setExtractedData(null);
        }
    };

    const handleExtract = async () => {
        if (!pdfFile) return;

        setExtracting(true);
        // TODO: Migrate extraction logic

        // Simulating extraction delay
        setTimeout(() => {
            setExtractedData({
                success: true,
                metadata: {
                    filename: pdfFile.name,
                    size: `${(pdfFile.size / 1024).toFixed(2)} KB`,
                    pages: 3
                },
                content: {
                    title: "INFORME TÉCNICO DE BOMBA",
                    client: "Flowserve Corporation",
                    date: new Date().toLocaleDateString(),
                    description: "Extracción simulada de datos..."
                }
            });
            setExtracting(false);
        }, 1500);
    };

    const triggerFileInput = () => {
        document.getElementById("pdf-input")?.click();
    };

    return (
        <div className="h-full flex flex-col gap-6 p-6 overflow-auto">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Extractor PDF</h1>
                    <p className="text-muted-foreground">
                        Visualiza y extrae contenido de reportes PDF
                    </p>
                </div>
                {pdfFile && (
                    <Button variant="outline" onClick={() => { setPdfFile(null); setPdfUrl(null); setExtractedData(null); }}>
                        Limpiar todo
                    </Button>
                )}
            </div>

            {/* Main Content Area - Responsive Grid */}
            <div className={`grid gap-6 flex-1 min-h-0 ${pdfFile ? 'lg:grid-cols-2' : ''}`}>

                {/* Left Column: Upload or Preview */}
                <Card className="flex flex-col min-h-0 overflow-hidden">
                    <CardHeader className="shrink-0">
                        <CardTitle className="flex items-center gap-2">
                            <File className="w-5 h-5" />
                            Documento
                        </CardTitle>
                        <CardDescription>Vista previa del archivo cargado</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0 p-0 overflow-hidden flex flex-col">
                        {pdfUrl ? (
                            <div className="flex-1 w-full bg-muted/20 relative">
                                <iframe
                                    src={pdfUrl}
                                    className="w-full h-full absolute inset-0 border-t"
                                    title="PDF Preview"
                                />
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center p-6 bg-muted/10 h-[500px]">
                                <Empty className="border-2 border-dashed rounded-lg bg-background p-10">
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon" className="bg-primary/10 text-primary">
                                            <Upload className="w-8 h-8" />
                                        </EmptyMedia>
                                        <EmptyTitle>Sube un documento PDF</EmptyTitle>
                                        <EmptyDescription>
                                            Selecciona un reporte en formato PDF para visualizarlo y extraer sus datos automáticamente.
                                        </EmptyDescription>
                                    </EmptyHeader>
                                    <EmptyContent>
                                        <Button onClick={triggerFileInput}>
                                            <Upload className="w-4 h-4 mr-2" />
                                            Seleccionar PDF
                                        </Button>
                                    </EmptyContent>
                                </Empty>
                            </div>
                        )}
                        <input
                            id="pdf-input"
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                    </CardContent>
                </Card>

                {/* Right Column: Actions & Results (Only visible if file selected) */}
                {pdfFile && (
                    <div className="flex flex-col gap-6 min-h-0">
                        {/* Actions Card */}
                        <Card className="shrink-0">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Detalles del Archivo
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 bg-muted rounded-md border">
                                        <div className="p-2 bg-background rounded-md border shadow-sm">
                                            <FileText className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{pdfFile.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {(pdfFile.size / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        className="w-full"
                                        size="lg"
                                        onClick={handleExtract}
                                        disabled={extracting}
                                    >
                                        {extracting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Procesando documento...
                                            </>
                                        ) : (
                                            <>
                                                <Download className="w-4 h-4 mr-2" />
                                                Extraer Información
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Results Card */}
                        <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
                            <CardHeader className="shrink-0">
                                <CardTitle className="flex items-center gap-2">
                                    {extractedData ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <FileText className="w-4 h-4 text-muted-foreground" />
                                    )}
                                    Datos Extraídos
                                </CardTitle>
                                <CardDescription>Texto estructurado obtenido del PDF</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 min-h-0 overflow-auto bg-muted/30 p-0 text-sm font-mono">
                                {extractedData ? (
                                    <pre className="p-4">
                                        {JSON.stringify(extractedData, null, 2)}
                                    </pre>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
                                        <p className="opacity-50">Los datos extraídos aparecerán aquí</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
