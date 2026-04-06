/**
 * useTestDetailPage Hook
 *
 * Facade hook that combines all test detail functionality.
 * Follows Facade Pattern: Provides a simple interface to complex subsystems.
 * Dependency Inversion: Page depends on this abstraction, not concrete implementations.
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteTest as deleteApi, getBancoById, getTestPdf } from "@/lib/api";
import type { TestsToPerform } from "@/lib/schemas";
import type { UseLanguageReturn } from "@/lib/language-context";

import { usePdfExtraction } from "./usePdfExtraction";
import { usePdfPanel } from "./usePdfPanel";
import { usePdfUpload } from "./usePdfUpload";
import { useTestDetail } from "./useTestDetail";
import { useTestSave } from "./useTestSave";
import { useTestsToPerform } from "./useTestsToPerform";
import { parseCsvTemplateImportFile } from "../services/csvTemplateImport";
import type {
  TestDetailFieldValue,
  TestDetailRecord,
  BankTemplate,
  BankTemplateMotor,
} from "../types/testDetail";
import type { ViewMode, ViewConfig } from "../types/viewMode";
import { getViewConfig } from "../types/viewMode";

export interface CsvImportResult {
  fileName: string;
  appliedFields: string[];
  warnings: string[];
}

export interface UseTestDetailPageResult {
  test: TestDetailRecord | null;
  loading: boolean;
  error: string | null;

  pdfFile: File | null;
  pdfUrl: string | null;
  isDragging: boolean;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  removePdf: () => void;

  extracting: boolean;
  handleAnalyzePdf: () => Promise<void>;

  saving: boolean;
  handleSave: () => Promise<void>;

  deleting: boolean;
  handleDelete: () => Promise<void>;

  isPdfExpanded: boolean;
  pdfPanelRef: React.RefObject<HTMLDivElement | null>;
  togglePdf: () => void;
  onPanelResize: (size: number) => void;

  testsToPerform: TestsToPerform;
  toggleTest: (key: string) => void;
  csvImporting: boolean;
  csvImportResult: CsvImportResult | null;
  handleApplyCsvImport: (file: File) => Promise<void>;

  handlePdfDataChange: (field: string, value: TestDetailFieldValue) => void;
  handleBankChange: (bankId: number) => Promise<void>;
  handleMotorTemplateChange: (motorPlantillaId: number) => void;

  setTest: React.Dispatch<React.SetStateAction<TestDetailRecord | null>>;
  isMobile: boolean;
  viewConfig: ViewConfig;
}

function normalizeBankMotors(bankData: BankTemplate): BankTemplateMotor[] {
  if (Array.isArray(bankData.motores) && bankData.motores.length > 0) {
    return bankData.motores.filter(Boolean);
  }

  if (bankData.motorPlantilla) {
    return [bankData.motorPlantilla];
  }

  return [];
}

function applyMotorTemplate(
  previous: TestDetailRecord,
  template: BankTemplateMotor,
): TestDetailRecord {
  return {
    ...previous,
    motorPlantillaId: template.id ?? null,
    pdfData: {
      ...previous.pdfData,
      motorMarca: template.marca ?? "",
      motorTipo: template.tipo ?? "",
      motorPotencia: template.potencia ?? undefined,
      motorVelocidad: template.velocidad ?? undefined,
      motorIntensidad: template.intensidad ?? undefined,
      motorRendimiento25: template.rendimiento25 ?? undefined,
      motorRendimiento50: template.rendimiento50 ?? undefined,
      motorRendimiento75: template.rendimiento75 ?? undefined,
      motorRendimiento100: template.rendimiento100 ?? undefined,
      motorRendimiento125: template.rendimiento125 ?? undefined,
    },
  };
}

function clearMotorTemplate(previous: TestDetailRecord): TestDetailRecord {
  return {
    ...previous,
    motorPlantillaId: null,
    pdfData: clearMotorFields(previous),
  };
}

function clearMotorFields(previous: TestDetailRecord) {
  return {
    ...previous.pdfData,
    motorMarca: "",
    motorTipo: "",
    motorPotencia: undefined,
    motorVelocidad: undefined,
    motorIntensidad: undefined,
    motorRendimiento25: undefined,
    motorRendimiento50: undefined,
    motorRendimiento75: undefined,
    motorRendimiento100: undefined,
    motorRendimiento125: undefined,
  };
}

export function useTestDetailPage(
  testId: string,
  t: UseLanguageReturn["t"],
  viewMode: ViewMode = "PENDING",
): UseTestDetailPageResult {
  const [isMobile, setIsMobile] = useState(false);
  const viewConfig = getViewConfig(viewMode);

  const { test, loading, error, updateTestData, setTest: setTestFn } = useTestDetail(testId);
  const { testsToPerform, toggleTest, autoSetTests, applyTestsPatch } = useTestsToPerform();
  const { saving, saveTest } = useTestSave();
  const { isPdfExpanded, pdfPanelRef, togglePdf, onPanelResize } = usePdfPanel();
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvImportResult, setCsvImportResult] = useState<CsvImportResult | null>(null);

  const {
    pdfFile,
    pdfUrl,
    isDragging,
    handleFileUpload,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    removePdf,
    setPdfUrl,
  } = usePdfUpload(t);

  const { extracting, extractPdfData } = usePdfExtraction({
    onExtracted: (specs) => {
      setTestFn((prev) => {
        if (!prev) return null;
        return { ...prev, pdfData: specs, status: "EN_PROCESO" };
      });
    },
    onAutoSetTests: autoSetTests,
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (localStorage.getItem("USE_MOCK_DATA") === "true") return;

    if (test?.hasPdf && test?.id) {
      getTestPdf(test.id)
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
        })
        .catch((err: unknown) => console.error("Error loading PDF preview:", err));
    }
  }, [test?.hasPdf, test?.id, setPdfUrl]);

  const handleAnalyzePdf = useCallback(async () => {
    if (!pdfFile) return;
    await extractPdfData(pdfFile);
  }, [pdfFile, extractPdfData]);

  const handleSave = useCallback(async () => {
    if (!test) return;
    await saveTest(
      {
        ...test,
        testsToPerform,
      },
      pdfFile,
      viewMode,
    );
  }, [test, testsToPerform, pdfFile, saveTest, viewMode]);

  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = useCallback(async () => {
    if (!testId) return;

    try {
      setDeleting(true);
      await deleteApi(testId);
      toast.success(viewMode === "PENDING" ? "Registro eliminado" : "Protocolo eliminado");
      router.push("/supervisor");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al eliminar";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  }, [testId, router, viewMode]);

  const handlePdfDataChange = useCallback((field: string, value: TestDetailFieldValue) => {
    updateTestData(field, value);

    const pdfData = test?.pdfData;
    const fluidFields = [
      "fluidPower",
      "fluidEfficiency",
      "fluidRpm",
      "density",
      "ce",
      "fluidFlowRate",
      "fluidHead",
    ];

    if (fluidFields.includes(field) || field === "density" || field === "ce") {
      const density = parseFloat(String(field === "density" ? value : pdfData?.density)) || 1000;
      const fluidPower = parseFloat(String(field === "fluidPower" ? value : pdfData?.fluidPower)) || 0;
      const fluidEfficiency = parseFloat(String(field === "fluidEfficiency" ? value : pdfData?.fluidEfficiency)) || 0;
      const fluidRpm = parseFloat(String(field === "fluidRpm" ? value : pdfData?.fluidRpm)) || 0;
      const ce = parseFloat(String(field === "ce" ? value : pdfData?.ce)) || 1;
      const fluidFlowRate = parseFloat(String(field === "fluidFlowRate" ? value : pdfData?.fluidFlowRate)) || 0;
      const fluidHead = parseFloat(String(field === "fluidHead" ? value : pdfData?.fluidHead)) || 0;

      const waterPower = density > 0 ? (fluidPower * 1000 / density).toFixed(2) : "0";
      const waterEfficiency = ce > 0 ? (fluidEfficiency / ce).toFixed(2) : "0";
      const waterRpm = fluidRpm.toString();
      const flowRate = fluidFlowRate.toString();
      const head = fluidHead.toString();

      updateTestData("maxPower", waterPower);
      updateTestData("efficiency", waterEfficiency);
      updateTestData("rpm", waterRpm);
      updateTestData("flowRate", flowRate);
      updateTestData("head", head);
    }
  }, [test, updateTestData]);

  const handleToggleTest = useCallback((key: string) => {
    const isNowActive = !testsToPerform[key as keyof TestsToPerform];
    toggleTest(key);

    if (key === "motorDelPedido" && isNowActive) {
      setTestFn((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          pdfData: clearMotorFields(prev),
        };
      });
      toast.info(t("test.motorFieldsCleared") || "Motor del pedido seleccionado. Campos de motor limpiados.");
    }
  }, [toggleTest, testsToPerform, setTestFn, t]);

  const handleApplyCsvImport = useCallback(async (file: File) => {
    if (!file) {
      return;
    }

    setCsvImporting(true);

    try {
      const parsed = await parseCsvTemplateImportFile(file);

      setTestFn((previous) => {
        if (!previous) {
          return previous;
        }

        const shouldClearMotor = parsed.testsToPerform.motorDelPedido === true;

        return {
          ...previous,
          generalInfo: {
            ...previous.generalInfo,
            ...parsed.generalInfo,
          },
          pdfData: {
            ...(shouldClearMotor ? clearMotorFields(previous) : previous.pdfData),
            ...parsed.pdfData,
          },
        };
      });

      applyTestsPatch(parsed.testsToPerform);

      const appliedFields = [
        ...parsed.applied.generalInfo.map((field) => `generalInfo.${field}`),
        ...parsed.applied.pdfData.map((field) => `pdfData.${field}`),
        ...parsed.applied.testsToPerform.map((field) => `testsToPerform.${field}`),
      ];

      const warnings = [...parsed.warnings];
      if (parsed.applied.pdfData.includes("qMax")) {
        warnings.push("Qmax se importa en la UI actual pero puede no persistir si el backend no lo soporta.");
      }

      setCsvImportResult({
        fileName: file.name,
        appliedFields,
        warnings,
      });

      if (appliedFields.length > 0) {
        toast.success(`Importación aplicada: ${appliedFields.length} campos actualizados.`);
      } else {
        toast.info("El CSV no contiene valores aplicables con el formato esperado.");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "No se pudo procesar el CSV.";
      setCsvImportResult({
        fileName: file.name,
        appliedFields: [],
        warnings: [message],
      });
      toast.error(message);
    } finally {
      setCsvImporting(false);
    }
  }, [applyTestsPatch, setTestFn]);

  const handleBankChange = useCallback(async (bankId: number) => {
    if (test?.isBankChangeLocked) {
      toast.error(
        t("test.bankChangeLocked") ||
          "No se puede cambiar el banco porque el protocolo está bloqueado.",
      );
      return;
    }

    try {
      setTestFn((prev) =>
        prev
          ? {
              ...prev,
              bancoId: bankId,
              motorPlantillaId: null,
              availableBankMotors: [],
            }
          : null,
      );

      const bankData = await getBancoById(bankId);
      const typedBankData = bankData as BankTemplate;
      const bankMotors = normalizeBankMotors(typedBankData);

      setTestFn((prev) => {
        if (!prev) return null;

        const baseState: TestDetailRecord = {
          ...prev,
          availableBankMotors: bankMotors,
        };

        if (bankMotors.length === 1) {
          return applyMotorTemplate(baseState, bankMotors[0]);
        }

        if (bankMotors.length > 1) {
          const preselected =
            bankMotors.find((motor) => motor.id === prev.motorPlantillaId) ?? null;
          return preselected ? applyMotorTemplate(baseState, preselected) : clearMotorTemplate(baseState);
        }

        return clearMotorTemplate(baseState);
      });

      if (bankMotors.length === 1) {
        const mp = bankMotors[0];
        toast.info(
          t("test.loadingMotorTemplate") ||
            `Cargando plantilla de motor: ${mp.nombre || mp.marca || mp.id}`,
        );
        toast.success(t("test.motorTemplateLoaded") || "Datos del motor actualizados");
      } else if (bankMotors.length > 1) {
        toast.info(
          t("test.selectMotorTemplate") ||
            "Este banco tiene varios motores. Selecciona una plantilla de motor.",
        );
      } else {
        toast.info(
          t("test.noMotorTemplates") ||
            "Este banco no tiene motores configurados. Completa el motor manualmente.",
        );
      }
    } catch (error: unknown) {
      console.error("Error auto-filling motor data:", error);
    }
  }, [setTestFn, t, test?.isBankChangeLocked]);

  const handleMotorTemplateChange = useCallback((motorPlantillaId: number) => {
    setTestFn((prev) => {
      if (!prev) return null;
      const selectedTemplate =
        prev.availableBankMotors?.find((motor) => motor.id === motorPlantillaId) ?? null;

      if (!selectedTemplate) {
        return prev;
      }

      return applyMotorTemplate(prev, selectedTemplate);
    });
  }, [setTestFn]);

  return {
    test,
    loading,
    error,
    pdfFile,
    pdfUrl,
    isDragging,
    handleFileUpload,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    removePdf,
    extracting,
    handleAnalyzePdf,
    saving,
    handleSave,
    deleting,
    handleDelete,
    isPdfExpanded,
    pdfPanelRef,
    togglePdf,
    onPanelResize,
    testsToPerform,
    toggleTest: handleToggleTest,
    csvImporting,
    csvImportResult,
    handleApplyCsvImport,
    handlePdfDataChange,
    handleBankChange,
    handleMotorTemplateChange,
    setTest: setTestFn,
    isMobile,
    viewConfig,
  };
}
