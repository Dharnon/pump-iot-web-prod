"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Upload,
    Loader2,
    CheckCircle2,
    ChevronRight,
    Search,
    FileText,
    Activity,
    Zap,
    RefreshCw,
    X,
    Check,
    Droplets,
    Ruler,
    Settings2,
    Gauge
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup
} from "@/components/ui/resizable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { toast } from "sonner";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";
import { UnitConverter } from "@/components/UnitConverter";
import type { TestsToPerform } from "@/lib/schemas";
import { uploadPdf, getTestById, patchTest } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";
import { PdfViewer } from "@/components/PdfViewer";

// Test types available
const TESTS_TO_PERFORM = [
    { key: 'performanceTest', label: 'Perf. Test' },
    { key: 'npsh', label: 'NPSH' },
    { key: 'vibraciones', label: 'Vibraciones' },
    { key: 'ruido', label: 'Ruido' },
    { key: 'mrt1h', label: 'MRT 1h' },
    { key: 'mrt4h', label: 'MRT 4h' },
    { key: 'homologacion', label: 'Homolog.' },
    { key: 'presenciada', label: 'Presenciada' },
    { key: 'motorDelPedido', label: 'Motor Pedido' },
] as const;

interface TestDetail {
    id: string;
    numeroProtocolo?: number;
    bancoId?: number;
    fecha?: string;
    status: "PENDING" | "SIN_PROCESAR" | "EN_PROCESO" | "GENERADO" | "GENERATED" | "COMPLETED";
    generalInfo: {
        pedido: string;
        posicion?: string;
        cliente: string;
        modeloBomba?: string;
        ordenTrabajo?: string;
        numeroBombas: number;
        fecha?: string;
        item?: string;
        pedidoCliente?: string;
    };
    // Extended entities for generated protocols
    bomba?: {
        numeroProtocolo?: number;
        item?: string;
        tipo?: string;
        numeroSerie?: string;
        diametroAspiracion?: number;
        diametroImpulsion?: number;
        diametroRodete?: string;
        tipoCierre?: string;
        vertical?: boolean;
        ordenDeTrabajo?: string;
    };
    cliente?: {
        numeroProtocolo?: number;
        nombre?: string;
        pedido?: string;
        pedidoCliente?: string;
    };
    motor?: {
        numeroProtocolo?: number;
        marca?: string;
        tipo?: string;
        potencia?: number;
        velocidad?: number;
        intensidad?: number;
        rendimiento25?: number;
        rendimiento50?: number;
        rendimiento75?: number;
        rendimiento100?: number;
        rendimiento125?: number;
    };
    fluido?: {
        numeroProtocolo?: number;
        nombre?: string;
        temperatura?: number;
        viscosidad?: number;
        densidad?: number;
        caudal?: number;
        altura?: number;
        velocidad?: number;
        potencia?: number;
        rendimiento?: number;
        caudalCoeficiente?: number;
        alturaCoeficiente?: number;
        rendimientoCoeficiente?: number;
    };
    fluidoH2O?: {
        numeroProtocolo?: number;
        caudal?: number;
        altura?: number;
        velocidad?: number;
        potencia?: number;
        rendimiento?: number;
        npshRequerido?: number;
    };
    detalles?: {
        numeroProtocolo?: number;
        comentario?: string;
        comentarioInterno?: string;
        correccionManometrica?: number;
        presionAtmosferica?: number;
        temperaturaAgua?: number;
        temperaturaAmbiente?: number;
        temperaturaLadoAcoplamiento?: number;
        temperaturaLadoBomba?: number;
        tiempoFuncionamientoBomba?: number;
    };
    hasPdf?: boolean;
    pdfData?: any;
    testsToPerform?: TestsToPerform;
    createdAt?: string;
}

export default function TestDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [test, setTest] = useState<TestDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [extracting, setExtracting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [testsToPerform, setTestsToPerform] = useState<TestsToPerform>({});
    const { t } = useLanguage();

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type === "application/pdf") {
            setPdfFile(file);
            setPdfUrl(URL.createObjectURL(file));
            toast.info(t("test.upload.desc"));
        } else if (file) {
            toast.error("Por favor sube un archivo PDF válido");
        }
    };

    const fetchTest = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getTestById(params.id as string);
            
            // If generated/completed, fill pdfData from entities for display/edit
            if (data.status !== "PENDING") {
                data.pdfData = {
                    // Bomba
                    item: data.bomba?.item,
                    modeloBomba: data.bomba?.tipo,
                    suctionDiameter: data.bomba?.diametroAspiracion,
                    dischargeDiameter: data.bomba?.diametroImpulsion,
                    impellerDiameter: data.bomba?.diametroRodete,
                    sealType: data.bomba?.tipoCierre,
                    vertical: data.bomba?.vertical,
                    
                    // H2O Point
                    flowRate: data.fluidoH2O?.caudal,
                    head: data.fluidoH2O?.altura,
                    rpm: data.fluidoH2O?.velocidad,
                    maxPower: data.fluidoH2O?.potencia,
                    efficiency: data.fluidoH2O?.rendimiento,
                    npshr: data.fluidoH2O?.npshRequerido,

                    // Fluid Point
                    liquidDescription: data.fluido?.nombre,
                    temperature: data.fluido?.temperatura,
                    viscosity: data.fluido?.viscosidad,
                    density: data.fluido?.densidad,
                    fluidFlowRate: data.fluido?.caudal,
                    fluidHead: data.fluido?.altura,
                    fluidRpm: data.fluido?.velocidad,
                    fluidPower: data.fluido?.potencia,
                    fluidEfficiency: data.fluido?.rendimiento,
                    cq: data.fluido?.caudalCoeficiente,
                    ch: data.fluido?.alturaCoeficiente,
                    ce: data.fluido?.rendimientoCoeficiente,

                    // Comments / Details
                    tolerance: data.detalles?.comentario,
                    internalComment: data.detalles?.comentarioInterno,
                    
                    // Detailed Data (camelCase for DTO mapping)
                    detallesCorreccionManometrica: data.detalles?.correccionManometrica,
                    detallesPresionAtmosferica: data.detalles?.presionAtmosferica,
                    detallesTemperaturaAgua: data.detalles?.temperaturaAgua,
                    detallesTemperaturaAmbiente: data.detalles?.temperaturaAmbiente,
                    detallesTemperaturaLadoAcoplamiento: data.detalles?.temperaturaLadoAcoplamiento,
                    detallesTemperaturaLadoBomba: data.detalles?.temperaturaLadoBomba,
                    detallesTiempoFuncionamientoBomba: data.detalles?.tiempoFuncionamientoBomba,

                    // Motor Data
                    motorMarca: data.motor?.marca,
                    motorTipo: data.motor?.tipo,
                    motorPotencia: data.motor?.potencia,
                    motorVelocidad: data.motor?.velocidad,
                    motorIntensidad: data.motor?.intensidad,
                    motorRendimiento25: data.motor?.rendimiento25,
                    motorRendimiento50: data.motor?.rendimiento50,
                    motorRendimiento75: data.motor?.rendimiento75,
                    motorRendimiento100: data.motor?.rendimiento100,
                    motorRendimiento125: data.motor?.rendimiento125
                };
            }
            
            setTest(data);
        } catch (error) {
            console.error("Error fetching test:", error);
            toast.error("No se pudo cargar la prueba");
        } finally {
            setLoading(false);
        }
    }, [params.id]);

    useEffect(() => {
        if (params.id) {
            fetchTest();
        }
    }, [params.id, fetchTest]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === "application/pdf") {
            setPdfFile(file);
            setPdfUrl(URL.createObjectURL(file));
            toast.info(t("test.upload.desc"));
        }
    };

    const handleAnalyze = async () => {
        if (!pdfFile) return;
        setExtracting(true);
        try {
            // Use local PDF extraction service
            const { extractSpecsFromPdf } = await import("@/lib/pdfExtractionService");
            const specs = await extractSpecsFromPdf(pdfFile);
            console.log("Specs extraídas:", specs);

            setTest(prev => {
                if (!prev) return null;
                return { ...prev, pdfData: specs, status: "EN_PROCESO" };
            });

            // Auto-set some tests based on extracted data
            setTestsToPerform(prev => ({
                ...prev,
                performanceTest: true,
                vibraciones: true,
                npsh: !!specs.npshr,
                mrt1h: specs.rpm ? specs.rpm > 2000 : false,
            }));

            toast.success("Datos extraídos correctamente");
        } catch (error) {
            console.error(error);
            toast.error("Error analyzing PDF. Make sure it contains selectable text.");
        } finally {
            setExtracting(false);
        }
    };

    const toggleTest = (key: string) => {
        setTestsToPerform(prev => ({
            ...prev,
            [key]: !prev[key as keyof TestsToPerform]
        }));
    };

    const handleSave = async () => {
        if (!test) return;
        setSaving(true);
        try {
            // Build the request body with all the data
            const requestBody = {
                status: "GENERADO",
                bancoId: 1, // Default to Banco 1
                generalInfo: {
                    pedido: test.generalInfo.pedido,
                    cliente: test.generalInfo.cliente,
                    modeloBomba: test.generalInfo.modeloBomba,
                    ordenTrabajo: test.generalInfo.ordenTrabajo,
                    numeroBombas: test.generalInfo.numeroBombas,
                    fecha: test.generalInfo.fecha,
                    item: test.generalInfo.item,
                    pedidoCliente: test.generalInfo.pedidoCliente,
                    posicion: test.generalInfo.posicion
                },
                pdfData: test.pdfData ? {
                    ...test.pdfData
                } : null
            };

            const result = await patchTest(test.id, requestBody);
            console.log("Protocol created:", result);

            // Upload PDF to Database if file exists and we have a numeric protocol ID
            // Upload PDF to Database for all generated protocols
            if (pdfFile) {
                const protocolIds = result?.ids || (result?.id ? [result.id] : []);
                
                if (protocolIds.length > 0) {
                    try {
                        await Promise.all(protocolIds.map((id: string | number) => uploadPdf(Number(id), pdfFile)));
                        console.log("PDF guardado en base de datos correctamente para protocolos:", protocolIds);
                    } catch (pdfError) {
                        console.error("Error saving PDF to DB:", pdfError);
                        toast.error("Datos guardados, pero hubo un error al almacenar el archivo PDF");
                    }
                }
            }
            toast.success("Prueba generada exitosamente");
            router.push("/supervisor");
        } catch (error) {
            console.error(error);
            toast.error("Error guardando datos");
        } finally {
            setSaving(false);
        }
    };

    const handlePdfDataChange = (field: string, value: string) => {
        setTest((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                pdfData: {
                    ...prev.pdfData,
                    [field]: value
                }
            };
        });
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!test) {
        return (
            <div className="h-full flex items-center justify-center p-6">
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon"><FileText /></EmptyMedia>
                        <EmptyTitle>{t("test.notFound.title")}</EmptyTitle>
                        <EmptyDescription>{t("test.notFound.desc")}</EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button onClick={() => router.push("/supervisor")}>{t("test.back")}</Button>
                    </EmptyContent>
                </Empty>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col overflow-hidden bg-background">
            {/* Minimal Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-4 py-2 border-b bg-background/50 backdrop-blur-sm shrink-0 gap-2">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <SidebarTrigger />
                    <Separator orientation="vertical" className="h-4" />
                    <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2 text-muted-foreground hover:text-foreground shrink-0" onClick={() => router.push("/supervisor")}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center gap-3 min-w-0 overflow-hidden">
                        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium shrink-0">
                            <span>{t("test.tests")}</span>
                            <ChevronRight className="w-3 h-3" />
                            <span>{test.generalInfo.pedido}</span>
                        </div>
                        <span className="text-muted-foreground/30 text-lg sm:text-xl font-light">/</span>
                        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate" title={test.generalInfo.cliente}>
                            {test.generalInfo.cliente}
                        </h1>
                    </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                    <StatusBadge status={test.status} />
                    <Button
                        onClick={handleSave}
                        disabled={saving || test.status === "SIN_PROCESAR"}
                        size="sm"
                        className={test.status === "GENERADO" ? "hidden" : "bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-95 transition-all text-xs font-semibold px-4 h-9"}
                    >
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                        {t("test.finalize")}
                    </Button>
                </div>
            </header>

            {/* Resizable Content Split */}
            <div className="flex-1 min-h-0 bg-muted/20">
                <ResizablePanelGroup direction={isMobile ? "vertical" : "horizontal"} key={isMobile ? "v" : "h"}>

                    {/* PDF Area - Minimalist & Resizable */}
                    <ResizablePanel defaultSize={45} minSize={30} className="relative flex flex-col bg-background transition-colors">
                        <PdfViewer
                            file={pdfFile}
                            url={pdfUrl}
                            onUpload={handleFileUpload}
                            onRemove={() => {
                                setPdfFile(null);
                                setPdfUrl(null);
                            }}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            isDragging={isDragging}
                            t={t}
                        />
                    </ResizablePanel>

                    <ResizableHandle withHandle className="bg-border focus-visible:ring-0 focus-visible:ring-offset-0" />

                    {/* Right Panel - Clean Data View with Tabs */}
                    <ResizablePanel defaultSize={55} minSize={30} className="bg-background/50 backdrop-blur-sm">
                        <Tabs defaultValue="info" className="h-full flex flex-col">
                            <div className="px-6 md:px-8 border-b bg-background/50 backdrop-blur-sm shrink-0">
                                <TabsList variant="line" className="h-12 w-full justify-start gap-8">
                                    <TabsTrigger value="info" className="px-0 py-3 text-xs uppercase tracking-widest">
                                        Información
                                    </TabsTrigger>
                                    <TabsTrigger value="specs" className="px-0 py-3 text-xs uppercase tracking-widest">
                                        Especificaciones
                                    </TabsTrigger>
                                    {test.status !== "PENDING" && (
                                        <TabsTrigger value="results" className="px-0 py-3 text-xs uppercase tracking-widest">
                                            Resultados
                                        </TabsTrigger>
                                    )}
                                </TabsList>
                            </div>

                            <ScrollArea className="flex-1">
                                <div className="p-6 md:p-8 space-y-12">
                                    
                                    <TabsContent value="info" className="space-y-12 mt-0">
                                        {/* Section 1: Datos Cliente */}
                                        <section className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                    <FileText className="w-4 h-4" />
                                                    {t("test.generalInfo")}
                                                </h3>
                                                <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded border">CSV</span>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8">
                                                <InfoField label={t("field.order")} value={test.generalInfo.pedido} highlight />
                                                <InfoField label={t("field.client")} value={test.generalInfo.cliente} />
                                                <InfoField label={t("field.clientOrder")} value={test.generalInfo.pedidoCliente || "-"} />
                                                <InfoField label={t("field.date")} value={test.generalInfo.fecha || new Date().toLocaleDateString('es-ES')} className="text-muted-foreground" />
                                                <InfoField label={t("field.qty")} value={String(test.generalInfo.numeroBombas)} className="text-muted-foreground" />
                                            </div>
                                        </section>

                                        {/* Section 2: Tests (Chips) */}
                                        <section className="space-y-6">
                                            <Separator className="-mx-6 md:-mx-8 w-auto" />
                                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2 pt-2">
                                                <Activity className="w-4 h-4" />
                                                {t("test.testsToPerform")}
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {TESTS_TO_PERFORM.map(({ key, label }) => (
                                                    <div
                                                        key={key}
                                                        onClick={() => toggleTest(key)}
                                                        className={`flex items-center justify-between px-3 py-2 rounded-md border cursor-pointer transition-all ${testsToPerform[key as keyof TestsToPerform]
                                                            ? 'bg-primary/10 border-primary/30 text-primary shadow-sm'
                                                            : 'bg-muted/30 border-border text-muted-foreground hover:border-primary/20'
                                                            }`}
                                                    >
                                                        <span className="text-[10px] sm:text-xs font-semibold leading-tight mr-3">
                                                            {label}
                                                        </span>
                                                        <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-colors ${testsToPerform[key as keyof TestsToPerform]
                                                            ? 'bg-primary border-primary'
                                                            : 'border-muted-foreground/30 bg-background'
                                                            }`}>
                                                            {testsToPerform[key as keyof TestsToPerform] && (
                                                                <Check className="w-2.5 h-2.5 text-white" />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    </TabsContent>

                                    <TabsContent value="specs" className="space-y-12 mt-0">
                                        <section className="space-y-10">
                                            <div className="flex items-center justify-end">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 text-[10px] px-4 border-primary/30 text-primary hover:bg-primary/10 shadow-sm"
                                                    onClick={handleAnalyze}
                                                    disabled={!pdfFile || extracting}
                                                >
                                                    {extracting ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Search className="w-3 h-3 mr-2" />}
                                                    {extracting ? t("test.analyzing") : t("test.analyze")}
                                                </Button>
                                            </div>

                                            {/* Datos Bomba */}
                                            <div className="space-y-6">
                                                <Separator className="-mx-6 md:-mx-8 w-auto" />
                                                <div className="px-0">
                                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                        <Settings2 className="w-3.5 h-3.5 text-primary" /> Datos Bomba
                                                    </span>
                                                </div>
                                                <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
                                                    <CleanInput label="Item" value={test.pdfData?.item || test.generalInfo?.item} onChange={(val) => handlePdfDataChange("item", val)} />
                                                    <CleanInput label="Tipo Bomba" value={test.generalInfo?.modeloBomba || test.pdfData?.modeloBomba} />
                                                    <CleanInput label="Orden Trabajo" value={test.generalInfo?.ordenTrabajo} />
                                                    <CleanInput label="D. Aspiración" value={test.pdfData?.suctionDiameter} unit="mm" onChange={(val) => handlePdfDataChange("suctionDiameter", val)} />
                                                    <CleanInput label="D. Impulsión" value={test.pdfData?.dischargeDiameter} unit="mm" onChange={(val) => handlePdfDataChange("dischargeDiameter", val)} />
                                                    <CleanInput label="D. Rodete" value={test.pdfData?.impellerDiameter} unit="mm" onChange={(val) => handlePdfDataChange("impellerDiameter", val)} />
                                                    <CleanInput label="Tipo Cierre" value={test.pdfData?.sealType} onChange={(val) => handlePdfDataChange("sealType", val)} />
                                                    <div className="flex items-center gap-3 pt-6 min-w-[130px]">
                                                        <div className="relative flex items-center">
                                                            <input 
                                                                type="checkbox" 
                                                                id="vertical"
                                                                checked={test.pdfData?.vertical === true || test.pdfData?.vertical === "true"}
                                                                onChange={(e) => handlePdfDataChange("vertical", e.target.checked ? "true" : "false")}
                                                                className="h-4.5 w-4.5 rounded border-gray-300 text-primary focus:ring-primary transition-all cursor-pointer"
                                                            />
                                                        </div>
                                                        <label htmlFor="vertical" className="text-xs font-medium text-muted-foreground cursor-pointer">Bomba Vertical</label>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Punto Garantizado H2O */}
                                            <div className="space-y-6">
                                                <Separator className="-mx-6 md:-mx-8 w-auto" />
                                                <div className="px-0">
                                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                        <Droplets className="w-3.5 h-3.5 text-blue-500" /> Punto Garantizado en Agua (H₂O)
                                                    </span>
                                                </div>
                                                <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))' }}>
                                                    <CleanInput label="Caudal" value={test.pdfData?.flowRate} unit="m³/h" onChange={(val) => handlePdfDataChange("flowRate", val)} />
                                                    <CleanInput label="Altura" value={test.pdfData?.head} unit="m" onChange={(val) => handlePdfDataChange("head", val)} />
                                                    <CleanInput label="Velocidad" value={test.pdfData?.rpm} unit="rpm" onChange={(val) => handlePdfDataChange("rpm", val)} />
                                                    <CleanInput label="Potencia" value={test.pdfData?.maxPower} unit="kW" onChange={(val) => handlePdfDataChange("maxPower", val)} />
                                                    <CleanInput label="Rendimiento" value={test.pdfData?.efficiency} unit="%" onChange={(val) => handlePdfDataChange("efficiency", val)} />
                                                    <CleanInput label="NPSHr" value={test.pdfData?.npshr} unit="m" onChange={(val) => handlePdfDataChange("npshr", val)} />
                                                </div>
                                            </div>

                                            {/* Punto Garantizado en Fluido */}
                                            <div className="space-y-6">
                                                <Separator className="-mx-6 md:-mx-8 w-auto" />
                                                <div className="px-0">
                                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                        <Droplets className="w-3.5 h-3.5 text-orange-500" /> Punto Garantizado en Fluido
                                                    </span>
                                                </div>
                                                <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))' }}>
                                                    <CleanInput label="Fluido" value={test.pdfData?.liquidDescription} onChange={(val) => handlePdfDataChange("liquidDescription", val)} />
                                                    <CleanInput label="Temperatura" value={test.pdfData?.temperature} unit="°C" onChange={(val) => handlePdfDataChange("temperature", val)} />
                                                    <CleanInput label="Viscosidad" value={test.pdfData?.viscosity} unit="cSt" onChange={(val) => handlePdfDataChange("viscosity", val)} />
                                                    <CleanInput label="Densidad" value={test.pdfData?.density} unit="kg/m³" onChange={(val) => handlePdfDataChange("density", val)} />
                                                    <CleanInput label="Caudal" value={test.pdfData?.fluidFlowRate} unit="m³/h" onChange={(val) => handlePdfDataChange("fluidFlowRate", val)} />
                                                    <CleanInput label="Altura" value={test.pdfData?.fluidHead} unit="m" onChange={(val) => handlePdfDataChange("fluidHead", val)} />
                                                    <CleanInput label="Velocidad" value={test.pdfData?.fluidRpm} unit="rpm" onChange={(val) => handlePdfDataChange("fluidRpm", val)} />
                                                    <CleanInput label="Potencia" value={test.pdfData?.fluidPower} unit="kW" onChange={(val) => handlePdfDataChange("fluidPower", val)} />
                                                    <CleanInput label="Rendimiento" value={test.pdfData?.fluidEfficiency} unit="%" onChange={(val) => handlePdfDataChange("fluidEfficiency", val)} />
                                                </div>
                                                <div className="grid gap-4 grid-cols-3 max-w-sm">
                                                    <CleanInput label="CQ" value={test.pdfData?.cq} onChange={(val) => handlePdfDataChange("cq", val)} />
                                                    <CleanInput label="CH" value={test.pdfData?.ch} onChange={(val) => handlePdfDataChange("ch", val)} />
                                                    <CleanInput label="CE" value={test.pdfData?.ce} onChange={(val) => handlePdfDataChange("ce", val)} />
                                                </div>
                                            </div>

                                            {/* Comentarios */}
                                            <div className="space-y-6">
                                                <Separator className="-mx-6 md:-mx-8 w-auto" />
                                                <div className="px-0">
                                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                        <FileText className="w-3.5 h-3.5 text-primary" /> Comentarios
                                                    </span>
                                                </div>
                                                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Comentario (Tolerancia)</label>
                                                        <textarea 
                                                            className="w-full h-24 px-4 py-3 text-sm bg-muted/30 border border-transparent hover:bg-muted/50 focus:bg-background focus:border-primary/30 rounded-lg resize-none transition-all placeholder:text-muted-foreground/50"
                                                            value={test.pdfData?.tolerance || ""}
                                                            onChange={(e) => handlePdfDataChange("tolerance", e.target.value)}
                                                            placeholder="Ej: ISO 9906..."
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Comentario Interno</label>
                                                        <textarea 
                                                            className="w-full h-24 px-4 py-3 text-sm bg-muted/30 border border-transparent hover:bg-muted/50 focus:bg-background focus:border-primary/30 rounded-lg resize-none transition-all placeholder:text-muted-foreground/50"
                                                            value={test.pdfData?.internalComment || ""}
                                                            onChange={(e) => handlePdfDataChange("internalComment", e.target.value)}
                                                            placeholder="Notas internas..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    </TabsContent>

                                    {test.status !== "PENDING" && (
                                        <TabsContent value="results" className="space-y-12 mt-0">
                                            {/* Motor Section */}
                                            <section className="space-y-6">
                                                <Separator className="-mx-6 md:-mx-8 w-auto" />
                                                <div className="flex items-center justify-between pt-2">
                                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                        <Settings2 className="w-4 h-4" />
                                                        Motor
                                                    </h3>
                                                    <Badge variant="outline" className="text-[10px] bg-blue-50/50 text-blue-600 border-blue-200 uppercase tracking-widest font-bold">Operario</Badge>
                                                </div>
                                                <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))' }}>
                                                    <CleanInput label="Marca" value={test.motor?.marca} onChange={(val) => handlePdfDataChange("motor_marca", val)} />
                                                    <CleanInput label="Tipo" value={test.motor?.tipo} onChange={(val) => handlePdfDataChange("motor_tipo", val)} />
                                                    <CleanInput label="Potencia" value={test.motor?.potencia} unit="kW" onChange={(val) => handlePdfDataChange("motor_potencia", val)} />
                                                    <CleanInput label="Velocidad" value={test.motor?.velocidad} unit="rpm" onChange={(val) => handlePdfDataChange("motor_velocidad", val)} />
                                                    <CleanInput label="Intensidad" value={test.motor?.intensidad} unit="A" onChange={(val) => handlePdfDataChange("motor_intensidad", val)} />
                                                </div>
                                                <div className="grid gap-4 grid-cols-5">
                                                    <CleanInput label="η 25%" value={test.motor?.rendimiento25} unit="%" onChange={(val) => handlePdfDataChange("motor_rendimiento25", val)} />
                                                    <CleanInput label="η 50%" value={test.motor?.rendimiento50} unit="%" onChange={(val) => handlePdfDataChange("motor_rendimiento50", val)} />
                                                    <CleanInput label="η 75%" value={test.motor?.rendimiento75} unit="%" onChange={(val) => handlePdfDataChange("motor_rendimiento75", val)} />
                                                    <CleanInput label="η 100%" value={test.motor?.rendimiento100} unit="%" onChange={(val) => handlePdfDataChange("motor_rendimiento100", val)} />
                                                    <CleanInput label="η 125%" value={test.motor?.rendimiento125} unit="%" onChange={(val) => handlePdfDataChange("motor_rendimiento125", val)} />
                                                </div>
                                            </section>

                                            {/* FluidoH2O (Calculated) */}
                                            {test.fluidoH2O && (
                                                <section className="space-y-6">
                                                    <Separator className="-mx-6 md:-mx-8 w-auto" />
                                                    <div className="flex items-center justify-between pt-2">
                                                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                            <Droplets className="w-4 h-4" />
                                                            Punto Garantizado en Agua (Calculado)
                                                        </h3>
                                                        <Badge variant="outline" className="text-[10px] bg-gray-50 text-muted-foreground border-border uppercase tracking-widest font-bold">Calculado</Badge>
                                                    </div>
                                                    <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))' }}>
                                                        <CleanInput label="Caudal" value={test.fluidoH2O?.caudal} unit="m³/h" />
                                                        <CleanInput label="Altura" value={test.fluidoH2O?.altura} unit="m" />
                                                        <CleanInput label="Velocidad" value={test.fluidoH2O?.velocidad} unit="rpm" />
                                                        <CleanInput label="Potencia" value={test.fluidoH2O?.potencia} unit="kW" />
                                                        <CleanInput label="Rendimiento" value={test.fluidoH2O?.rendimiento} unit="%" />
                                                        <CleanInput label="NPSHr" value={test.fluidoH2O?.npshRequerido} unit="m" />
                                                    </div>
                                                </section>
                                            )}

                                            {/* Detalles y Presiones */}
                                            <section className="space-y-6">
                                                <Separator className="-mx-6 md:-mx-8 w-auto" />
                                                <div className="flex items-center justify-between pt-2">
                                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                        <Gauge className="w-4 h-4" />
                                                        Detalles y Presiones
                                                    </h3>
                                                    <Badge variant="outline" className="text-[10px] bg-blue-50/50 text-blue-600 border-blue-200 uppercase tracking-widest font-bold">Operario</Badge>
                                                </div>
                                                <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
                                                    <CleanInput label="Corrección Manom." value={test.detalles?.correccionManometrica} unit="m" onChange={(val) => handlePdfDataChange("detalles_correccionManometrica", val)} />
                                                    <CleanInput label="Presión Atmosf." value={test.detalles?.presionAtmosferica} unit="mbar" onChange={(val) => handlePdfDataChange("detalles_presionAtmosferica", val)} />
                                                    <CleanInput label="Temp. Agua" value={test.detalles?.temperaturaAgua} unit="°C" onChange={(val) => handlePdfDataChange("detalles_temperaturaAgua", val)} />
                                                    <CleanInput label="Temp. Ambiente" value={test.detalles?.temperaturaAmbiente} unit="°C" onChange={(val) => handlePdfDataChange("detalles_temperaturaAmbiente", val)} />
                                                    <CleanInput label="Temp. Lado Acopl." value={test.detalles?.temperaturaLadoAcoplamiento} unit="°C" onChange={(val) => handlePdfDataChange("detalles_temperaturaLadoAcoplamiento", val)} />
                                                    <CleanInput label="Temp. Lado Bomba" value={test.detalles?.temperaturaLadoBomba} unit="°C" onChange={(val) => handlePdfDataChange("detalles_temperaturaLadoBomba", val)} />
                                                    <CleanInput label="Tiempo Func." value={test.detalles?.tiempoFuncionamientoBomba} unit="min" onChange={(val) => handlePdfDataChange("detalles_tiempoFuncionamientoBomba", val)} />
                                                </div>
                                                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Comentario</label>
                                                        <textarea 
                                                            className="w-full h-24 px-4 py-3 text-sm bg-muted/30 border-transparent hover:bg-muted/50 focus:bg-background focus:border-primary/30 rounded-lg resize-none transition-all placeholder:text-muted-foreground/50"
                                                            value={test.detalles?.comentario || ""}
                                                            onChange={(e) => handlePdfDataChange("detalles_comentario", e.target.value)}
                                                            placeholder="Comentario visible en protocolo..."
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Comentario Interno</label>
                                                        <textarea 
                                                            className="w-full h-24 px-4 py-3 text-sm bg-muted/30 border-transparent hover:bg-muted/50 focus:bg-background focus:border-primary/30 rounded-lg resize-none transition-all placeholder:text-muted-foreground/50"
                                                            value={test.detalles?.comentarioInterno || ""}
                                                            onChange={(e) => handlePdfDataChange("detalles_comentarioInterno", e.target.value)}
                                                            placeholder="Notas internas (no se imprimen)..."
                                                        />
                                                    </div>
                                                </div>
                                            </section>
                                        </TabsContent>
                                    )}

                                    {/* Unit Converter */}
                                    <section className="mt-12">
                                        <Separator className="-mx-6 md:-mx-8 w-auto" />
                                        <div className="pt-8">
                                            <UnitConverter />
                                        </div>
                                    </section>
                                </div>
                            </ScrollArea>
                        </Tabs>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
}

// Minimal Components

function StatusBadge({ status }: { status: string }) {
    const styles = {
        SIN_PROCESAR: "bg-slate-100 text-slate-500 hover:bg-slate-100 border-slate-200",
        EN_PROCESO: "bg-blue-50 text-blue-600 hover:bg-blue-50 border-blue-200",
        GENERADO: "bg-green-50 text-green-600 hover:bg-green-50 border-green-200",
    };
    return (
        <Badge variant="outline" className={`${styles[status as keyof typeof styles]} border px-3 py-1 font-normal`}>
            {status.replace("_", " ")}
        </Badge>
    );
}

function InfoField({ label, value, highlight, className = "" }: { label: string, value: string | number, highlight?: boolean, className?: string }) {
    return (
        <div className={className}>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
            <p className={`text-sm font-medium ${highlight ? 'text-primary font-mono' : 'text-foreground'} break-words`}>{value}</p>
        </div>
    );
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType, title: string }) {
    return (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-1">
            <Icon className="w-3 h-3 text-primary" />
            <span>{title}</span>
        </div>
    );
}

function CleanInput({ label, value, unit, onChange }: { label: string, value: any, unit?: string, onChange?: (val: string) => void }) {
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between">
                <label className="text-xs text-muted-foreground">{label}</label>
            </div>
            <div className="relative">
                <Input
                    disabled={!onChange}
                    value={value ?? ""}
                    onChange={(e) => onChange && onChange(e.target.value)}
                    placeholder="-"
                    className="h-9 bg-muted/40 border-transparent hover:bg-muted/60 focus:bg-background focus:border-input transition-all pr-12 font-medium"
                />
                {unit && (
                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-medium pointer-events-none">
                        {unit}
                    </span>
                )}
            </div>
        </div>
    );
}
