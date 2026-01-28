/**
 * =============================================================================
 * IMPORT MODAL - Pump IoT Platform
 * =============================================================================
 * 
 * @fileoverview Modal wizard de 4 pasos para importar archivos Excel.
 * 
 * FLUJO DEL WIZARD:
 * 
 * ┌────────────────────────────────────────────────────────────────────────────┐
 * │  PASO 1: UPLOAD          →  El usuario arrastra o selecciona un archivo    │
 * │                              .xlsx o .xls                                   │
 * ├────────────────────────────────────────────────────────────────────────────┤
 * │  PASO 2: SELECT-SHEET    →  Si el Excel tiene múltiples hojas, se          │
 * │                              muestra lista para que el usuario elija       │
 * │                              (Si solo hay 1 hoja, se salta automáticamente)│
 * ├────────────────────────────────────────────────────────────────────────────┤
 * │  PASO 3: IMPORTING       →  Spinner mientras se procesa y envía al backend │
 * ├────────────────────────────────────────────────────────────────────────────┤
 * │  PASO 4: SUCCESS         →  Feedback con cantidad de registros importados  │
 * │                              El modal se cierra automáticamente tras 2s     │
 * └────────────────────────────────────────────────────────────────────────────┘
 * 
 * COMUNICACIÓN CON PADRE:
 * - onImportSuccess(filename, count) se llama al completar la importación
 * - El padre (Dashboard) usa este callback para refrescar la lista de tests
 * 
 * @example
 * ```tsx
 * <ImportModal 
 *     onImportSuccess={(filename, count) => {
 *         console.log(`Importados ${count} registros de ${filename}`);
 *         fetchTests(); // Refrescar tabla
 *     }} 
 * />
 * ```
 */

"use client";

// =============================================================================
// IMPORTS
// =============================================================================

import { useState, useCallback } from "react";

// Componentes UI (Shadcn)
import {
    Dialog,               // Modal container
    DialogContent,        // Contenido del modal
    DialogDescription,    // Subtítulo
    DialogHeader,         // Header del modal
    DialogTitle,          // Título
    DialogTrigger         // Elemento que dispara el modal
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Iconos
import {
    Upload,               // Icono del botón trigger
    FileSpreadsheet,      // Icono de Excel
    Loader2,              // Spinner animado
    AlertCircle,          // Icono de error
    CheckCircle2,         // Icono de éxito
    ChevronRight          // Flecha para lista de hojas
} from "lucide-react";

import { getExcelSheets, importExcel } from "@/lib/api";

// =============================================================================
// TIPOS
// =============================================================================

/**
 * Props del componente ImportModal.
 */
interface ImportModalProps {
    /** Callback ejecutado al completar la importación exitosamente */
    onImportSuccess: (filename: string, count: number) => void;
}

/**
 * Estados posibles del wizard.
 * La máquina de estados es lineal: upload → select-sheet → importing → success
 */
type Step = "upload" | "select-sheet" | "importing" | "success";

// =============================================================================
// COMPONENTE
// =============================================================================

/**
 * Modal para importar archivos Excel con detección automática de hojas.
 * 
 * El componente maneja toda la lógica de:
 * - Drag & drop y selección de archivos
 * - Detección de hojas del Excel (API call)
 * - Selección de hoja si hay múltiples
 * - Importación al backend
 * - Feedback de éxito/error
 * 
 * @param onImportSuccess - Callback con (filename, count) al terminar
 */
export function ImportModal({ onImportSuccess }: ImportModalProps) {
    // =========================================================================
    // ESTADO
    // =========================================================================

    /** Control de apertura del Dialog */
    const [open, setOpen] = useState(false);

    /** Paso actual del wizard */
    const [step, setStep] = useState<Step>("upload");

    /** Flag visual para drag over */
    const [isDragging, setIsDragging] = useState(false);

    /** Flag de operación en progreso */
    const [isLoading, setIsLoading] = useState(false);

    /** Mensaje de error (null = sin error) */
    const [error, setError] = useState<string | null>(null);

    /** Archivo seleccionado por el usuario */
    const [file, setFile] = useState<File | null>(null);

    /** Lista de nombres de hojas detectadas en el Excel */
    const [sheets, setSheets] = useState<string[]>([]);

    /** Hoja seleccionada para importar */
    const [selectedSheet, setSelectedSheet] = useState<string | null>(null);

    /** Resultado de la importación (para mostrar en paso success) */
    const [result, setResult] = useState<{ filename: string; count: number } | null>(null);

    // =========================================================================
    // FUNCIONES AUXILIARES
    // =========================================================================

    /**
     * Resetea todo el estado al cerrar el modal.
     * Vuelve al paso 1 y limpia todos los valores.
     */
    const resetState = () => {
        setStep("upload");
        setFile(null);
        setSheets([]);
        setSelectedSheet(null);
        setError(null);
        setResult(null);
        setIsLoading(false);
    };

    /**
     * Handler para cambio de estado open del Dialog.
     * Al cerrar, resetea el estado.
     */
    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) resetState();
    };

    // =========================================================================
    // HANDLERS DE ARCHIVO
    // =========================================================================

    /**
     * Handler para drop de archivo (drag & drop).
     * Previene el comportamiento por defecto y procesa el archivo.
     */
    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) await detectSheets(droppedFile);
    }, []);

    /**
     * Handler para selección de archivo via input file.
     * Resetea el input después para permitir re-seleccionar el mismo archivo.
     */
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) await detectSheets(selectedFile);
        e.target.value = ""; // Reset para permitir re-seleccionar
    };

    // =========================================================================
    // PASO 1: DETECCIÓN DE HOJAS
    // =========================================================================

    /**
     * Detecta las hojas disponibles en el archivo Excel.
     * 
     * Proceso:
     * 1. Valida extensión del archivo (.xlsx, .xls)
     * 2. Envía el archivo al backend para análisis
     * 3. Si solo hay 1 hoja → importa directamente
     * 4. Si hay múltiples hojas → muestra selector (paso 2)
     * 
     * @param selectedFile - Archivo Excel a analizar
     */
    const detectSheets = async (selectedFile: File) => {
        // Validar extensión
        const validTypes = [".xlsx", ".xls"];
        const isValid = validTypes.some((ext) => selectedFile.name.toLowerCase().endsWith(ext));

        if (!isValid) {
            setError("Formato inválido. Solo .xlsx, .xls");
            return;
        }

        setIsLoading(true);
        setError(null);
        setFile(selectedFile);

        try {
            const data = await getExcelSheets(selectedFile);
            setSheets(data.sheets);

            if (data.sheets.length === 1) {
                setSelectedSheet(data.sheets[0]);
                await importWithSheet(selectedFile, data.sheets[0]);
            } else {
                setStep("select-sheet");
            }
        } catch (err) {
            setError("Error al leer el archivo Excel.");
        } finally {
            setIsLoading(false);
        }
    };

    // =========================================================================
    // PASO 2/3: IMPORTACIÓN
    // =========================================================================

    /**
     * Importa los datos de la hoja seleccionada.
     * 
     * @param fileToImport - Archivo Excel
     * @param sheet - Nombre de la hoja a importar
     */
    const importWithSheet = async (fileToImport: File, sheet: string) => {
        setStep("importing");
        setIsLoading(true);
        setError(null);

        try {
            const data = await importExcel(fileToImport, sheet);

            // Guardar resultado para mostrar en paso success
            setResult({ filename: fileToImport.name, count: data.count });
            setStep("success");

            // Notificar al padre (para que refresque datos)
            onImportSuccess(fileToImport.name, data.count);

            // Auto-cerrar modal después de 2 segundos
            setTimeout(() => {
                handleOpenChange(false);
            }, 2000);

        } catch (err) {
            setError("Error al importar el archivo.");
            setStep("select-sheet"); // Volver a selección para reintentar
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handler para click en una hoja de la lista.
     * Inicia la importación con esa hoja.
     */
    const handleSheetSelect = (sheet: string) => {
        setSelectedSheet(sheet);
        if (file) {
            importWithSheet(file, sheet);
        }
    };

    // =========================================================================
    // RENDER
    // =========================================================================

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            {/* Botón que abre el modal */}
            <DialogTrigger asChild>
                <Button>
                    <Upload className="w-4 h-4 mr-2" />
                    Importar Excel
                </Button>
            </DialogTrigger>

            {/* Contenido del modal */}
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    {/* Título dinámico según paso */}
                    <DialogTitle>
                        {step === "upload" && "Importar Excel"}
                        {step === "select-sheet" && "Seleccionar Hoja"}
                        {step === "importing" && "Importando..."}
                        {step === "success" && "¡Importación Exitosa!"}
                    </DialogTitle>
                    {/* Descripción dinámica según paso */}
                    <DialogDescription>
                        {step === "upload" && "Arrastra un archivo Excel o haz clic para seleccionar"}
                        {step === "select-sheet" && `${file?.name} - Selecciona la hoja a importar`}
                        {step === "importing" && `Procesando ${selectedSheet}...`}
                        {step === "success" && `${result?.count} registros importados`}
                    </DialogDescription>
                </DialogHeader>

                {/* ============================================================
                    PASO 1: UPLOAD (Drag & Drop Zone)
                    ============================================================ */}
                {step === "upload" && (
                    <div
                        className={`
                            border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
                            ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
                            ${isLoading ? "opacity-50 pointer-events-none" : ""}
                        `}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById("import-file-input")?.click()}
                    >
                        {/* Input oculto para selección de archivo */}
                        <input
                            id="import-file-input"
                            type="file"
                            accept=".xlsx,.xls"
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={isLoading}
                        />

                        {isLoading ? (
                            // Estado: Cargando archivo
                            <>
                                <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin mb-3" />
                                <p className="text-sm text-muted-foreground">Leyendo archivo...</p>
                            </>
                        ) : (
                            // Estado: Esperando archivo
                            <>
                                <FileSpreadsheet className={`w-10 h-10 mx-auto mb-3 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                                <p className={`text-sm font-medium ${isDragging ? "text-primary" : "text-muted-foreground"}`}>
                                    {isDragging ? "Suelta el archivo aquí" : "Arrastra o haz clic para importar"}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">.xlsx, .xls</p>
                            </>
                        )}
                    </div>
                )}

                {/* ============================================================
                    PASO 2: SELECT-SHEET (Lista de hojas)
                    ============================================================ */}
                {step === "select-sheet" && (
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground mb-3">
                            {sheets.length} hojas encontradas:
                        </p>
                        {sheets.map((sheet) => (
                            <button
                                key={sheet}
                                onClick={() => handleSheetSelect(sheet)}
                                className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-accent hover:border-primary transition-colors text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <FileSpreadsheet className="w-5 h-5 text-muted-foreground" />
                                    <span className="font-medium">{sheet}</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </button>
                        ))}
                    </div>
                )}

                {/* ============================================================
                    PASO 3: IMPORTING (Spinner)
                    ============================================================ */}
                {step === "importing" && (
                    <div className="text-center py-8">
                        <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin mb-3" />
                        <p className="text-sm text-muted-foreground">Importando datos de "{selectedSheet}"...</p>
                    </div>
                )}

                {/* ============================================================
                    PASO 4: SUCCESS (Confirmación)
                    ============================================================ */}
                {step === "success" && result && (
                    <div className="text-center py-8">
                        <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-3" />
                        <p className="text-lg font-medium text-green-600">
                            ¡{result.count} registros importados!
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">{result.filename}</p>
                    </div>
                )}

                {/* ============================================================
                    MENSAJE DE ERROR (Condicional)
                    ============================================================ */}
                {error && (
                    <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-md">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
