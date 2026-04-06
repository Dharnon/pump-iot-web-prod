/**
 * useTestSave Hook
 *
 * Manages test data saving with proper DTO mapping.
 * Follows SRP: Single responsibility for test persistence.
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { patchTest, uploadPdf } from "@/lib/api";
import type { ViewMode } from "../types/viewMode";
import { mapTestToSaveDTO } from "../services/dtoMapper";
import type { TestDetailRecord } from "../types/testDetail";

export interface UseTestSaveResult {
  saving: boolean;
  saveTest: (
    test: TestDetailRecord,
    pdfFile: File | null,
    viewMode?: ViewMode,
  ) => Promise<void>;
}

/**
 * Hook to manage test saving functionality
 *
 * @returns Save state and save function
 */
export function useTestSave(): UseTestSaveResult {
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const saveTest = useCallback(
    async (test: TestDetailRecord, pdfFile: File | null, viewMode: ViewMode = "PENDING") => {
      if (!test) return;

      if (localStorage.getItem("USE_MOCK_DATA") === "true") {
        setSaving(true);
        try {
          await new Promise((resolve) => setTimeout(resolve, 800));
          toast.success(
            viewMode === "PENDING"
              ? "Prueba generada exitosamente (Mock)"
              : "Protocolo actualizado exitosamente (Mock)",
          );

          if (viewMode === "PENDING") {
            router.push("/supervisor");
          }
        } finally {
          setSaving(false);
        }
        return;
      }

      setSaving(true);

      try {
        const requestBody = mapTestToSaveDTO(
          test.generalInfo,
          test.pdfData,
          test.bancoId ?? 0,
          test.motorPlantillaId ?? null,
          test.testsToPerform,
          viewMode === "PENDING",
        );

        const result = await patchTest(
          test.id,
          requestBody as unknown as Record<string, unknown>,
        );

        if (pdfFile) {
          let protocolIds: (string | number)[] = [];

          if (viewMode === "PENDING") {
            protocolIds = result?.ids || (result?.id ? [result.id] : []);
          } else {
            protocolIds = test.numeroProtocolo ? [test.numeroProtocolo] : [test.id];
          }

          if (protocolIds.length > 0) {
            try {
              await Promise.all(
                protocolIds.map((id: string | number) =>
                  uploadPdf(Number(id), pdfFile),
                ),
              );
            } catch (pdfError) {
              console.error("Error saving PDF to DB:", pdfError);
              toast.error(
                "Datos guardados, pero hubo un error al almacenar el archivo PDF",
              );
            }
          }
        }

        toast.success(
          viewMode === "PENDING"
            ? "Prueba generada exitosamente"
            : "Protocolo actualizado exitosamente",
        );

        if (viewMode === "PENDING") {
          router.push("/supervisor");
        }
      } catch (error: unknown) {
        console.error("Error saving test:", error);
        toast.error("Error guardando datos");
      } finally {
        setSaving(false);
      }
    },
    [router],
  );

  return {
    saving,
    saveTest,
  };
}
