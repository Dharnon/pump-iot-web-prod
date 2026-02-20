/**
 * useTestSave Hook
 * 
 * Manages test data saving with proper DTO mapping.
 * Follows SRP: Single responsibility for test persistence.
 */

import { useState, useCallback } from 'react';
import { patchTest, uploadPdf } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { mapTestToSaveDTO } from '../services/dtoMapper';
import type { ViewMode } from '../types/viewMode';

export interface UseTestSaveResult {
  saving: boolean;
  saveTest: (test: any, pdfFile: File | null, viewMode?: ViewMode) => Promise<void>;
}

/**
 * Hook to manage test saving functionality
 * 
 * @returns Save state and save function
 */
export function useTestSave(): UseTestSaveResult {
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const saveTest = useCallback(async (test: any, pdfFile: File | null, viewMode: ViewMode = 'PENDING') => {
    if (!test) return;

    // MOCK DATA CHECK
    if (localStorage.getItem('USE_MOCK_DATA') === 'true') {
      setSaving(true);
      try {
        console.log("MOCK SAVE - Skipping API call");
        await new Promise(resolve => setTimeout(resolve, 800));
        toast.success(viewMode === 'PENDING' ? "Prueba generada exitosamente (Mock)" : "Protocolo actualizado exitosamente (Mock)");

        if (viewMode === 'PENDING') {
          router.push("/supervisor");
        }
      } finally {
        setSaving(false);
      }
      return;
    }

    setSaving(true);

    try {
      // Use DTO mapper service to transform data to backend format
      const requestBody = mapTestToSaveDTO(test.generalInfo, test.pdfData, 1, viewMode === 'PENDING');

      const result = await patchTest(test.id, requestBody);
      console.log("Protocol saved:", result);

      // Upload PDF if file exists
      // In PENDING mode: use the IDs returned by the generate endpoint
      // In GENERATED mode: use the existing test's own ID
      if (pdfFile) {
        let protocolIds: (string | number)[] = [];

        if (viewMode === 'PENDING') {
          protocolIds = result?.ids || (result?.id ? [result.id] : []);
        } else {
          // GENERATED mode: test already has an ID
          protocolIds = test.numeroProtocolo ? [test.numeroProtocolo] : [test.id];
        }

        if (protocolIds.length > 0) {
          try {
            await Promise.all(
              protocolIds.map((id: string | number) => uploadPdf(Number(id), pdfFile))
            );
            console.log("PDF saved to database for protocols:", protocolIds);
          } catch (pdfError) {
            console.error("Error saving PDF to DB:", pdfError);
            toast.error("Datos guardados, pero hubo un error al almacenar el archivo PDF");
          }
        }
      }

      const successMessage = viewMode === 'PENDING'
        ? "Prueba generada exitosamente"
        : "Protocolo actualizado exitosamente";
      toast.success(successMessage);

      // Only redirect to supervisor in PENDING mode
      if (viewMode === 'PENDING') {
        router.push("/supervisor");
      }
    } catch (error) {
      console.error("Error saving test:", error);
      toast.error("Error guardando datos");
    } finally {
      setSaving(false);
    }
  }, [router]);

  return {
    saving,
    saveTest,
  };
}

