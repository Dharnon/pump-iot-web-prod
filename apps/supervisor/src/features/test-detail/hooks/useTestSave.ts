/**
 * useTestSave Hook
 * 
 * Manages test data saving with proper DTO mapping.
 * Follows SRP: Single responsibility for test persistence.
 */

import { useState, useCallback } from 'react';
import { patchTest, uploadPdf } from '@pump-iot/core/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { mapTestToSaveDTO } from '../services/dtoMapper';

export interface UseTestSaveResult {
  saving: boolean;
  saveTest: (test: any, pdfFile: File | null) => Promise<void>;
}

/**
 * Hook to manage test saving functionality
 * 
 * @returns Save state and save function
 */
export function useTestSave(): UseTestSaveResult {
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const saveTest = useCallback(async (test: any, pdfFile: File | null) => {
    if (!test) return;
    
    setSaving(true);
    
    try {
      // Use DTO mapper service to transform data to backend format
      const requestBody = mapTestToSaveDTO(test.generalInfo, test.pdfData);

      const result = await patchTest(test.id, requestBody);
      console.log("Protocol created:", result);

      // Upload PDF if file exists
      if (pdfFile) {
        const protocolIds = result?.ids || (result?.id ? [result.id] : []);
        
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
      
      toast.success("Prueba generada exitosamente");
      router.push("/supervisor");
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
