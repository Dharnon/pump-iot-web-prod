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
import type { TestDetailFieldValue, TestDetailRecord, BankTemplate } from "../types/testDetail";
import type { ViewMode, ViewConfig } from "../types/viewMode";
import { getViewConfig } from "../types/viewMode";

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

  handlePdfDataChange: (field: string, value: TestDetailFieldValue) => void;
  handleBankChange: (bankId: number) => Promise<void>;

  setTest: React.Dispatch<React.SetStateAction<TestDetailRecord | null>>;
  isMobile: boolean;
  viewConfig: ViewConfig;
}

export function useTestDetailPage(
  testId: string,
  t: UseLanguageReturn["t"],
  viewMode: ViewMode = "PENDING",
): UseTestDetailPageResult {
  const [isMobile, setIsMobile] = useState(false);
  const viewConfig = getViewConfig(viewMode);

  const { test, loading, error, updateTestData, setTest: setTestFn } = useTestDetail(testId);
  const { testsToPerform, toggleTest, autoSetTests } = useTestsToPerform();
  const { saving, saveTest } = useTestSave();
  const { isPdfExpanded, pdfPanelRef, togglePdf, onPanelResize } = usePdfPanel();

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
    await saveTest(test, pdfFile, viewMode);
  }, [test, pdfFile, saveTest, viewMode]);

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
          pdfData: {
            ...prev.pdfData,
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
          },
        };
      });
      toast.info(t("test.motorFieldsCleared") || "Motor del pedido seleccionado. Campos de motor limpiados.");
    }
  }, [toggleTest, testsToPerform, setTestFn, t]);

  const handleBankChange = useCallback(async (bankId: number) => {
    try {
      setTestFn((prev) => (prev ? { ...prev, bancoId: bankId } : null));

      const bankData = await getBancoById(bankId);
      const typedBankData = bankData as BankTemplate;

      if (typedBankData.motorPlantilla) {
        const mp = typedBankData.motorPlantilla;
        toast.info(t("test.loadingMotorTemplate") || `Cargando plantilla de motor: ${mp.nombre || mp.marca}`);

        setTestFn((prev) => {
          if (!prev) return null;

          return {
            ...prev,
            pdfData: {
              ...prev.pdfData,
              motorMarca: mp.marca || prev.pdfData?.motorMarca,
              motorTipo: mp.tipo || prev.pdfData?.motorTipo,
              motorPotencia: mp.potencia ?? prev.pdfData?.motorPotencia,
              motorVelocidad: mp.velocidad ?? prev.pdfData?.motorVelocidad,
              motorIntensidad: mp.intensidad ?? prev.pdfData?.motorIntensidad,
              motorRendimiento25: mp.rendimiento25 ?? prev.pdfData?.motorRendimiento25,
              motorRendimiento50: mp.rendimiento50 ?? prev.pdfData?.motorRendimiento50,
              motorRendimiento75: mp.rendimiento75 ?? prev.pdfData?.motorRendimiento75,
              motorRendimiento100: mp.rendimiento100 ?? prev.pdfData?.motorRendimiento100,
              motorRendimiento125: mp.rendimiento125 ?? prev.pdfData?.motorRendimiento125,
            },
          };
        });
        toast.success(t("test.motorTemplateLoaded") || "Datos del motor actualizados");
      }
    } catch (error: unknown) {
      console.error("Error auto-filling motor data:", error);
    }
  }, [setTestFn, t]);

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
    handlePdfDataChange,
    handleBankChange,
    setTest: setTestFn,
    isMobile,
    viewConfig,
  };
}
