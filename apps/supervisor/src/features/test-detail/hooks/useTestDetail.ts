/**
 * useTestDetail Hook
 * 
 * Manages test data fetching, state, and synchronization.
 * Follows SRP: Single responsibility for test data management.
 */

import { useState, useEffect, useCallback } from 'react';
import { getTestById } from '@/lib/api';
import { toast } from 'sonner';
import { mapEntitiesToPdfData } from '../services/entityMapper';
import type { TestDetailFieldValue, TestDetailRecord } from "../types/testDetail";

export interface UseTestDetailResult {
  test: TestDetailRecord | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateTestData: (field: string, value: TestDetailFieldValue) => void;
  setTest: React.Dispatch<React.SetStateAction<TestDetailRecord | null>>;
}

/**
 * Hook to manage test detail data
 * 
 * @param testId - Test identifier
 * @returns Test data, loading state, and update functions
 */
export function useTestDetail(testId: string): UseTestDetailResult {
  const [test, setTest] = useState<TestDetailRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches test data and maps generated protocol data to pdfData format
   */
  const fetchTest = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Check for mock mode
    const useMock = localStorage.getItem('USE_MOCK_DATA') === 'true';

    try {
      let data: TestDetailRecord;

      if (useMock) {
        // Dynamic import to avoid bundling mock data in production if not needed, 
        // though here it's fine.
        const { MOCK_TEST_DETAIL } = await import('./mockData');
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        data = { ...MOCK_TEST_DETAIL, id: testId };
      } else {
        data = await getTestById(testId) as TestDetailRecord;
      }

      // If generated/completed, map entity data to pdfData for form editing using service layer
      if (data.status !== "PENDING" && !useMock) {
        data.pdfData = mapEntitiesToPdfData({
          bomba: data.bomba,
          fluidoH2O: data.fluidoH2O,
          fluido: data.fluido,
          detalles: data.detalles,
          motor: data.motor
        });

        // Sync item from bomba entity into generalInfo (bomba.item is the canonical source)
        if (data.bomba?.item) {
          data.generalInfo = {
            ...data.generalInfo,
            item: data.bomba.item
          };
        }
      }

      setTest(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load test";
      setError(message);
      toast.error("No se pudo cargar la prueba");
      console.error("Error fetching test:", err);
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    fetchTest();
  }, [fetchTest]);

  /**
   * Updates a specific field in the test's pdfData or generalInfo
   */
  const updateTestData = useCallback((field: string, value: TestDetailFieldValue) => {
    setTest((prev) => {
      if (!prev) return null;

      // Fields that belong to generalInfo
      const generalInfoFields = ['pedido', 'cliente', 'fecha', 'numeroBombas', 'modeloBomba', 'ordenTrabajo', 'item'];

      if (generalInfoFields.includes(field)) {
        return {
          ...prev,
          generalInfo: {
            ...prev.generalInfo,
            [field]: value
          },
          // If updating 'item', ensure we remove it from pdfData so it doesn't mask the new generalInfo value
          // if pdfData logic prioritizes its own field (though we swapped priority in view, it's safer to be clean)
          pdfData: {
             ...prev.pdfData,
             ...(field === 'item' ? { item: undefined } : {})
          }
        };
      }

      // Default: update pdfData
      return {
        ...prev,
        pdfData: {
          ...prev.pdfData,
          [field]: value
        }
      };
    });
  }, []);

  return {
    test,
    loading,
    error,
    refetch: fetchTest,
    updateTestData,
    setTest,
  };
}
