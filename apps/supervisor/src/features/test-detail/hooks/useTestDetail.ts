/**
 * useTestDetail Hook
 * 
 * Manages test data fetching, state, and synchronization.
 * Follows SRP: Single responsibility for test data management.
 */

import { useState, useEffect, useCallback } from 'react';
import { getTestById } from '@pump-iot/core/api';
import { toast } from 'sonner';

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
  pdfData?: any;
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
      
      // If generated/completed, map entity data to pdfData for form editing
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
          
          // Detailed Data
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
