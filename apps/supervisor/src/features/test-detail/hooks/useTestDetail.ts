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
    
    try {
      const data = await getTestById(testId);
      
      // If generated/completed, map entity data to pdfData for form editing using service layer
      if (data.status !== "PENDING") {
        data.pdfData = mapEntitiesToPdfData({
          bomba: data.bomba,
          fluidoH2O: data.fluidoH2O,
          fluido: data.fluido,
          detalles: data.detalles,
          motor: data.motor
        });
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
   * Updates a specific field in the test's pdfData
   */
  const updateTestData = useCallback((field: string, value: any) => {
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
