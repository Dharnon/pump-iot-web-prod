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
import type { TestPdfData } from '../services/dtoMapper';

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
  bomba?: any;
  cliente?: any;
  motor?: any;
  fluido?: any;
  fluidoH2O?: any;
  detalles?: any;
  hasPdf?: boolean;
  pdfData?: TestPdfData;
  testsToPerform?: any;
  createdAt?: string;
}

export interface UseTestDetailResult {
  test: TestDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateTestData: (field: string, value: any) => void;
  setTest: React.Dispatch<React.SetStateAction<TestDetail | null>>;
}

/**
 * Hook to manage test detail data
 * 
 * @param testId - Test identifier
 * @returns Test data, loading state, and update functions
 */
export function useTestDetail(testId: string): UseTestDetailResult {
  const [test, setTest] = useState<TestDetail | null>(null);
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
      let data;

      if (useMock) {
        // Dynamic import to avoid bundling mock data in production if not needed, 
        // though here it's fine.
        const { MOCK_TEST_DETAIL } = await import('./mockData');
        console.log("USING MOCK DATA");

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        data = { ...MOCK_TEST_DETAIL, id: testId };
      } else {
        data = await getTestById(testId);
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

        // Sync pedidoCliente from cliente entity into generalInfo (they may diverge)
        if (data.cliente?.pedidoCliente && !data.generalInfo?.pedidoCliente) {
          data.generalInfo = {
            ...data.generalInfo,
            pedidoCliente: data.cliente.pedidoCliente
          };
        }

        // Sync item from bomba entity into generalInfo (bomba.item is the canonical source)
        if (data.bomba?.item) {
          data.generalInfo = {
            ...data.generalInfo,
            item: data.bomba.item
          };
        }
      }

      setTest(data);
    } catch (err) {
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
  const updateTestData = useCallback((field: string, value: any) => {
    setTest((prev) => {
      if (!prev) return null;

      // Fields that belong to generalInfo
      const generalInfoFields = ['pedido', 'cliente', 'pedidoCliente', 'fecha', 'numeroBombas', 'modeloBomba', 'ordenTrabajo', 'item'];

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
