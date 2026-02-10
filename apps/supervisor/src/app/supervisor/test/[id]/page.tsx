"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Upload,
    Loader2,
    CheckCircle2,
    ChevronRight,
    ChevronDown,
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
import { PdfViewer } from "@/components/PdfViewer";
import type { TestsToPerform } from "@/lib/schemas";
import { uploadPdf, getTestById, patchTest, getTestPdf } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";

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
    const [isPdfOpen, setIsPdfOpen] = useState(false);
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

    // Effect to load PDF if test has one (for generated protocols)
    useEffect(() => {
        if (test?.hasPdf && test?.id) {
            getTestPdf(test.id)
                .then(blob => {
                    const url = URL.createObjectURL(blob);
                    setPdfUrl(url);
                })
                .catch(err => console.error("Error loading PDF preview:", err));
        }
    }, [test?.hasPdf, test?.id]);

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
            // Build the request body with all the data - using PascalCase for backend DTOs
            const requestBody = {
                Status: "GENERADO",
                BancoId: 1, // Default to Banco 1
                GeneralInfo: {
                    Pedido: test.generalInfo.pedido,
                    Cliente: test.generalInfo.cliente,
                    ModeloBomba: test.generalInfo.modeloBomba,
                    OrdenTrabajo: test.generalInfo.ordenTrabajo,
                    NumeroBombas: test.generalInfo.numeroBombas,
                    Fecha: test.generalInfo.fecha,
                    Item: test.generalInfo.item,
                    PedidoCliente: test.generalInfo.pedidoCliente,
                    Posicion: test.generalInfo.posicion
                },
                PdfData: test.pdfData ? {
                    // Bomba fields
                    Item: test.pdfData.item,
                    ModeloBomba: test.pdfData.modeloBomba,
                    SuctionDiameter: test.pdfData.suctionDiameter,
                    DischargeDiameter: test.pdfData.dischargeDiameter,
                    ImpellerDiameter: test.pdfData.impellerDiameter,
                    SealType: test.pdfData.sealType,
                    Vertical: test.pdfData.vertical,
                    
                    // H2O Point
                    FlowRate: test.pdfData.flowRate,
                    Head: test.pdfData.head,
                    Rpm: test.pdfData.rpm,
                    MaxPower: test.pdfData.maxPower,
                    Efficiency: test.pdfData.efficiency,
                    Npshr: test.pdfData.npshr,

                    // Fluid Point
                    LiquidDescription: test.pdfData.liquidDescription,
                    Temperature: test.pdfData.temperature,
                    Viscosity: test.pdfData.viscosity,
                    Density: test.pdfData.density,
                    FluidFlowRate: test.pdfData.fluidFlowRate,
                    FluidHead: test.pdfData.fluidHead,
                    FluidRpm: test.pdfData.fluidRpm,
                    FluidPower: test.pdfData.fluidPower,
                    FluidEfficiency: test.pdfData.fluidEfficiency,
                    Cq: test.pdfData.cq,
                    Ch: test.pdfData.ch,
                    Ce: test.pdfData.ce,

                    // Comments
                    Tolerance: test.pdfData.tolerance,
                    InternalComment: test.pdfData.internalComment,
                    
                    // Detailed Data
                    DetallesCorreccionManometrica: test.pdfData.detallesCorreccionManometrica,
                    DetallesPresionAtmosferica: test.pdfData.detallesPresionAtmosferica,
                    DetallesTemperaturaAgua: test.pdfData.detallesTemperaturaAgua,
                    DetallesTemperaturaAmbiente: test.pdfData.detallesTemperaturaAmbiente,
                    DetallesTemperaturaLadoAcoplamiento: test.pdfData.detallesTemperaturaLadoAcoplamiento,
                    DetallesTemperaturaLadoBomba: test.pdfData.detallesTemperaturaLadoBomba,
                    DetallesTiempoFuncionamientoBomba: test.pdfData.detallesTiempoFuncionamientoBomba,

                    // Motor Data
                    MotorMarca: test.pdfData.motorMarca,
                    MotorTipo: test.pdfData.motorTipo,
                    MotorPotencia: test.pdfData.motorPotencia,
                    MotorVelocidad: test.pdfData.motorVelocidad,
                    MotorIntensidad: test.pdfData.motorIntensidad,
                    MotorRendimiento25: test.pdfData.motorRendimiento25,
                    MotorRendimiento50: test.pdfData.motorRendimiento50,
                    MotorRendimiento75: test.pdfData.motorRendimiento75,
                    MotorRendimiento100: test.pdfData.motorRendimiento100,
                    MotorRendimiento125: test.pdfData.motorRendimiento125
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
                            onAnalyze={handleAnalyze}
                            isAnalyzing={extracting}
                            t={t}
                        />
                    </ResizablePanel>

                    <ResizableHandle withHandle className="bg-border focus-visible:ring-0 focus-visible:ring-offset-0" />

                    {/* Right Panel - Clean Data View with Tabs */}
                    <ResizablePanel defaultSize={55} minSize={30} className="bg-background/50 backdrop-blur-sm">
                        <Tabs defaultValue="data" className="h-full flex flex-col">
                            <div className="px-6 md:px-8 border-b bg-background/50 backdrop-blur-sm shrink-0">
                                <TabsList variant="line" className="h-12 w-full justify-start gap-8">
                                    <TabsTrigger value="data" className="px-0 py-3 text-xs uppercase tracking-widest">
                                        Datos
                                    </TabsTrigger>

                                </TabsList>
                            </div>

                            <ScrollArea className="flex-1">
                                <div className="p-4 md:p-6 space-y-8">
                                    
                                    <TabsContent value="data" className="space-y-8 mt-0">
                                        {/* Header Actions - Show analyze button here as fallback or shortcut */}



                                        {/* Section 1: Datos Cliente & General */}
                                        <section className="space-y-4">
                                            <div>
                                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                    <FileText className="w-4 h-4" />
                                                    {t("test.generalInfo")}
                                                </h3>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                                <InfoField label={t("field.order")} value={test.generalInfo.pedido} highlight />
                                                <InfoField label={t("field.client")} value={test.generalInfo.cliente} />
                                                <InfoField label={t("field.clientOrder")} value={test.generalInfo.pedidoCliente || "-"} />
                                                <InfoField label={t("field.date")} value={test.generalInfo.fecha || new Date().toLocaleDateString('es-ES')} className="text-muted-foreground" />
                                                <InfoField label={t("field.qty")} value={String(test.generalInfo.numeroBombas)} className="text-muted-foreground" />
                                                <div className="flex items-center gap-2">
                                                     <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded border">CSV</span>
                                                </div>
                                            </div>
                                        </section>

                                        {/* Section 2: Tests (Chips) */}
                                        <section className="space-y-2">
                                            <Separator className="mb-4" />
                                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                <Activity className="w-3.5 h-3.5" />
                                                {t("test.testsToPerform")}
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {TESTS_TO_PERFORM.map(({ key, label }) => (
                                                    <div
                                                        key={key}
                                                        onClick={() => toggleTest(key)}
                                                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-md border cursor-pointer transition-all ${testsToPerform[key as keyof TestsToPerform]
                                                            ? 'bg-primary/10 border-primary/30 text-primary shadow-sm'
                                                            : 'bg-muted/30 border-border text-muted-foreground hover:border-primary/20'
                                                            }`}
                                                    >
                                                        <span className="text-[10px] font-semibold leading-tight mr-2">
                                                            {label}
                                                        </span>
                                                        <div className={`w-3 h-3 rounded-sm border flex items-center justify-center transition-colors ${testsToPerform[key as keyof TestsToPerform]
                                                            ? 'bg-primary border-primary'
                                                            : 'border-muted-foreground/30 bg-background'
                                                            }`}>
                                                            {testsToPerform[key as keyof TestsToPerform] && (
                                                                <Check className="w-2 h-2 text-white" />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>

                                        {/* Datos Bomba */}
                                        <section className="space-y-4">
                                            <Separator className="mb-4" />
                                            <div>
                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                    <Settings2 className="w-3.5 h-3.5 text-primary" /> Datos Bomba
                                                </span>
                                            </div>
                                            <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
                                                <CleanInput label="Item" value={test.pdfData?.item || test.generalInfo?.item} onChange={(val) => handlePdfDataChange("item", val)} className="h-8 text-xs" />
                                                <CleanInput label="Tipo Bomba" value={test.generalInfo?.modeloBomba || test.pdfData?.modeloBomba} className="h-8 text-xs" />
                                                <CleanInput label="Orden Trabajo" value={test.generalInfo?.ordenTrabajo} className="h-8 text-xs" />
                                                <CleanInput label="D. Aspiración" value={test.pdfData?.suctionDiameter} unit="mm" onChange={(val) => handlePdfDataChange("suctionDiameter", val)} className="h-8 text-xs" />
                                                <CleanInput label="D. Impulsión" value={test.pdfData?.dischargeDiameter} unit="mm" onChange={(val) => handlePdfDataChange("dischargeDiameter", val)} className="h-8 text-xs" />
                                                <CleanInput label="D. Rodete" value={test.pdfData?.impellerDiameter} unit="mm" onChange={(val) => handlePdfDataChange("impellerDiameter", val)} className="h-8 text-xs" />
                                                <CleanInput label="Tipo Cierre" value={test.pdfData?.sealType} onChange={(val) => handlePdfDataChange("sealType", val)} className="h-8 text-xs" />
                                                <div className="flex items-center gap-2 pt-4 col-span-1">
                                                    <div className="relative flex items-center">
                                                        <input 
                                                            type="checkbox" 
                                                            id="vertical"
                                                            checked={test.pdfData?.vertical === true || test.pdfData?.vertical === "true"}
                                                            onChange={(e) => handlePdfDataChange("vertical", e.target.checked ? "true" : "false")}
                                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary transition-all cursor-pointer"
                                                        />
                                                    </div>
                                                    <label htmlFor="vertical" className="text-[10px] font-medium text-muted-foreground cursor-pointer">Bomba Vertical</label>
                                                </div>
                                            </div>
                                        </section>

                                        {/* Punto Garantizado H2O */}
                                        <section className="space-y-4">
                                            <Separator className="mb-4" />
                                            <div>
                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                    <Droplets className="w-3.5 h-3.5 text-blue-500" /> Punto Garantizado en Agua (H₂O)
                                                </span>
                                            </div>
                                            <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                                                <CleanInput label="Caudal" value={test.pdfData?.flowRate} unit="m³/h" onChange={(val) => handlePdfDataChange("flowRate", val)} className="h-8 text-xs" />
                                                <CleanInput label="Altura" value={test.pdfData?.head} unit="m" onChange={(val) => handlePdfDataChange("head", val)} className="h-8 text-xs" />
                                                <CleanInput label="Velocidad" value={test.pdfData?.rpm} unit="rpm" onChange={(val) => handlePdfDataChange("rpm", val)} className="h-8 text-xs" />
                                                <CleanInput label="Potencia" value={test.pdfData?.maxPower} unit="kW" onChange={(val) => handlePdfDataChange("maxPower", val)} className="h-8 text-xs" />
                                                <CleanInput label="Rendimiento" value={test.pdfData?.efficiency} unit="%" onChange={(val) => handlePdfDataChange("efficiency", val)} className="h-8 text-xs" />
                                                <CleanInput label="NPSHr" value={test.pdfData?.npshr} unit="m" onChange={(val) => handlePdfDataChange("npshr", val)} className="h-8 text-xs" />
                                            </div>
                                        </section>

                                        {/* Punto Garantizado en Fluido */}
                                        <section className="space-y-4">
                                            <Separator className="mb-4" />
                                            <div>
                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                    <Droplets className="w-3.5 h-3.5 text-orange-500" /> Punto Garantizado en Fluido
                                                </span>
                                            </div>
                                            <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                                                <CleanInput label="Fluido" value={test.pdfData?.liquidDescription} onChange={(val) => handlePdfDataChange("liquidDescription", val)} className="col-span-2 md:col-span-1 h-8 text-xs" />
                                                <CleanInput label="Temperatura" value={test.pdfData?.temperature} unit="°C" onChange={(val) => handlePdfDataChange("temperature", val)} className="h-8 text-xs" />
                                                <CleanInput label="Viscosidad" value={test.pdfData?.viscosity} unit="cSt" onChange={(val) => handlePdfDataChange("viscosity", val)} className="h-8 text-xs" />
                                                <CleanInput label="Densidad" value={test.pdfData?.density} unit="kg/m³" onChange={(val) => handlePdfDataChange("density", val)} className="h-8 text-xs" />
                                                <div className="hidden lg:block lg:col-span-1"></div>

                                                <CleanInput label="Caudal" value={test.pdfData?.fluidFlowRate} unit="m³/h" onChange={(val) => handlePdfDataChange("fluidFlowRate", val)} className="h-8 text-xs" />
                                                <CleanInput label="Altura" value={test.pdfData?.fluidHead} unit="m" onChange={(val) => handlePdfDataChange("fluidHead", val)} className="h-8 text-xs" />
                                                <CleanInput label="Velocidad" value={test.pdfData?.fluidRpm} unit="rpm" onChange={(val) => handlePdfDataChange("fluidRpm", val)} className="h-8 text-xs" />
                                                <CleanInput label="Potencia" value={test.pdfData?.fluidPower} unit="kW" onChange={(val) => handlePdfDataChange("fluidPower", val)} className="h-8 text-xs" />
                                                <CleanInput label="Rendimiento" value={test.pdfData?.fluidEfficiency} unit="%" onChange={(val) => handlePdfDataChange("fluidEfficiency", val)} className="h-8 text-xs" />
                                            </div>
                                            <div className="grid gap-3 grid-cols-3 max-w-sm pt-2">
                                                <CleanInput label="CQ" value={test.pdfData?.cq} onChange={(val) => handlePdfDataChange("cq", val)} className="h-8 text-xs" />
                                                <CleanInput label="CH" value={test.pdfData?.ch} onChange={(val) => handlePdfDataChange("ch", val)} className="h-8 text-xs" />
                                                <CleanInput label="CE" value={test.pdfData?.ce} onChange={(val) => handlePdfDataChange("ce", val)} className="h-8 text-xs" />
                                            </div>
                                        </section>

                                        {/* Comentarios */}
                                            {/* Comentarios & Motor - Only show if not pending or if generated */}
                                            {test.status !== "PENDING" && (
                                                <section className="space-y-4">
                                                    <Separator className="mb-4" />
                                                    <div className="flex items-center justify-between pt-2">
                                                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                            <Settings2 className="w-4 h-4" />
                                                            Motor
                                                        </h3>
                                                    </div>
                                                    <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                                                        <CleanInput label="Marca" value={test.pdfData?.motorMarca} onChange={(val) => handlePdfDataChange("motorMarca", val)} className="h-8 text-xs" />
                                                        <CleanInput label="Tipo" value={test.pdfData?.motorTipo} onChange={(val) => handlePdfDataChange("motorTipo", val)} className="h-8 text-xs" />
                                                        <CleanInput label="Potencia" value={test.pdfData?.motorPotencia} unit="kW" onChange={(val) => handlePdfDataChange("motorPotencia", val)} className="h-8 text-xs" />
                                                        <CleanInput label="Velocidad" value={test.pdfData?.motorVelocidad} unit="rpm" onChange={(val) => handlePdfDataChange("motorVelocidad", val)} className="h-8 text-xs" />
                                                        <CleanInput label="Intensidad" value={test.pdfData?.motorIntensidad} unit="A" onChange={(val) => handlePdfDataChange("motorIntensidad", val)} className="h-8 text-xs" />
                                                    </div>
                                                    <div className="grid gap-3 grid-cols-2 lg:grid-cols-5 pt-2">
                                                        <CleanInput label="η 25%" value={test.pdfData?.motorRendimiento25} unit="%" onChange={(val) => handlePdfDataChange("motorRendimiento25", val)} className="h-8 text-xs" />
                                                        <CleanInput label="η 50%" value={test.pdfData?.motorRendimiento50} unit="%" onChange={(val) => handlePdfDataChange("motorRendimiento50", val)} className="h-8 text-xs" />
                                                        <CleanInput label="η 75%" value={test.pdfData?.motorRendimiento75} unit="%" onChange={(val) => handlePdfDataChange("motorRendimiento75", val)} className="h-8 text-xs" />
                                                        <CleanInput label="η 100%" value={test.pdfData?.motorRendimiento100} unit="%" onChange={(val) => handlePdfDataChange("motorRendimiento100", val)} className="h-8 text-xs" />
                                                        <CleanInput label="η 125%" value={test.pdfData?.motorRendimiento125} unit="%" onChange={(val) => handlePdfDataChange("motorRendimiento125", val)} className="h-8 text-xs" />
                                                    </div>
                                                </section>
                                            )}


                                            {/* Detalles y Presiones */}
                                            {/* Detalles y Presiones - Only show if not pending */}
                                            {test.status !== "PENDING" && (
                                                <section className="space-y-4">
                                                    <Separator className="mb-4" />
                                                    <div className="flex items-center justify-between pt-2">
                                                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                            <Gauge className="w-4 h-4" />
                                                            Detalles y Presiones
                                                        </h3>
                                                    </div>
                                                    <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                                        <CleanInput label="Corrección Manom." value={test.pdfData?.detallesCorreccionManometrica} unit="m" onChange={(val) => handlePdfDataChange("detallesCorreccionManometrica", val)} className="h-8 text-xs" />
                                                        <CleanInput label="Presión Atmosf." value={test.pdfData?.detallesPresionAtmosferica} unit="mbar" onChange={(val) => handlePdfDataChange("detallesPresionAtmosferica", val)} className="h-8 text-xs" />
                                                        <CleanInput label="Temp. Agua" value={test.pdfData?.detallesTemperaturaAgua} unit="°C" onChange={(val) => handlePdfDataChange("detallesTemperaturaAgua", val)} className="h-8 text-xs" />
                                                        <CleanInput label="Temp. Ambiente" value={test.pdfData?.detallesTemperaturaAmbiente} unit="°C" onChange={(val) => handlePdfDataChange("detallesTemperaturaAmbiente", val)} className="h-8 text-xs" />
                                                        <CleanInput label="Temp. Lado Acopl." value={test.pdfData?.detallesTemperaturaLadoAcoplamiento} unit="°C" onChange={(val) => handlePdfDataChange("detallesTemperaturaLadoAcoplamiento", val)} className="h-8 text-xs" />
                                                        <CleanInput label="Temp. Lado Bomba" value={test.pdfData?.detallesTemperaturaLadoBomba} unit="°C" onChange={(val) => handlePdfDataChange("detallesTemperaturaLadoBomba", val)} className="h-8 text-xs" />
                                                        <CleanInput label="Tiempo Func." value={test.pdfData?.detallesTiempoFuncionamientoBomba} unit="min" onChange={(val) => handlePdfDataChange("detallesTiempoFuncionamientoBomba", val)} className="h-8 text-xs" />
                                                    </div>
                                                    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 pt-2">
                                                        <div className="space-y-1.5">
                                                            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Comentario</label>
                                                            <textarea 
                                                                className="w-full h-20 px-3 py-2 text-xs bg-muted/30 border-transparent hover:bg-muted/50 focus:bg-background focus:border-primary/30 rounded-md resize-none transition-all placeholder:text-muted-foreground/50"
                                                                value={test.pdfData?.tolerance || ""}
                                                                onChange={(e) => handlePdfDataChange("tolerance", e.target.value)}
                                                                placeholder="Comentario visible en protocolo..."
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Comentario Interno</label>
                                                            <textarea 
                                                                className="w-full h-20 px-3 py-2 text-xs bg-muted/30 border-transparent hover:bg-muted/50 focus:bg-background focus:border-primary/30 rounded-md resize-none transition-all placeholder:text-muted-foreground/50"
                                                                value={test.pdfData?.internalComment || ""}
                                                                onChange={(e) => handlePdfDataChange("internalComment", e.target.value)}
                                                                placeholder="Notas internas (no se imprimen)..."
                                                            />
                                                        </div>
                                                    </div>
                                                </section>
                                            )}

                                    </TabsContent>


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
    const styles: Record<string, string> = {
        PENDING: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
        SIN_PROCESAR: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
        EN_PROCESO: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
        GENERADO: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
        GENERATED: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
        COMPLETED: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
    };

    const statusStyle = styles[status] || styles["PENDING"];

    return (
        <Badge variant="outline" className={`${statusStyle} border px-3 py-1 font-medium capitalize`}>
            {status.replace(/_/g, " ").toLowerCase()}
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

function CleanInput({ label, value, unit, onChange, className }: { label: string, value: any, unit?: string, onChange?: (val: string) => void, className?: string }) {
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
                    className={`h-9 bg-muted/40 border-transparent hover:bg-muted/60 focus:bg-background focus:border-input transition-all pr-12 font-medium ${className || ""}`}
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
