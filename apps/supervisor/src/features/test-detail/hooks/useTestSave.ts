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
      // Build request body with PascalCase for backend DTOs
      const requestBody = {
        Status: "GENERADO",
        BancoId: 1,
        GeneralInfo: {
          Pedido: test.generalInfo.pedido,
          Cliente: test.generalInfo.cliente,
          ModeloBomba: test.generalInfo.modeloBomba,
          OrdenTrabajo: test.generalInfo.ordenTrabajo,
          NumeroBombas: test.generalInfo.numeroBombas,
          Fecha: test.generalInfo.fecha,
          Item: test.generalInfo.item,
          PedidoCliente: test.generalInfo.pedidoCliente,
          Posicion: test.generalInfo.posicion
        },
        PdfData: test.pdfData ? {
          // Bomba fields
          Item: test.pdfData.item,
          ModeloBomba: test.pdfData.modeloBomba,
          SuctionDiameter: test.pdfData.suctionDiameter,
          DischargeDiameter: test.pdfData.dischargeDiameter,
          ImpellerDiameter: test.pdfData.impellerDiameter,
          SealType: test.pdfData.sealType,
          Vertical: test.pdfData.vertical,
          
          // H2O Point
          FlowRate: test.pdfData.flowRate,
          Head: test.pdfData.head,
          Rpm: test.pdfData.rpm,
          MaxPower: test.pdfData.maxPower,
          Efficiency: test.pdfData.efficiency,
          Npshr: test.pdfData.npshr,

          // Fluid Point
          LiquidDescription: test.pdfData.liquidDescription,
          Temperature: test.pdfData.temperature,
          Viscosity: test.pdfData.viscosity,
          Density: test.pdfData.density,
          FluidFlowRate: test.pdfData.fluidFlowRate,
          FluidHead: test.pdfData.fluidHead,
          FluidRpm: test.pdfData.fluidRpm,
          FluidPower: test.pdfData.fluidPower,
          FluidEfficiency: test.pdfData.fluidEfficiency,
          Cq: test.pdfData.cq,
          Ch: test.pdfData.ch,
          Ce: test.pdfData.ce,

          // Comments
          Tolerance: test.pdfData.tolerance,
          InternalComment: test.pdfData.internalComment,
          
          // Detailed Data
          DetallesCorreccionManometrica: test.pdfData.detallesCorreccionManometrica,
          DetallesPresionAtmosferica: test.pdfData.detallesPresionAtmosferica,
          DetallesTemperaturaAgua: test.pdfData.detallesTemperaturaAgua,
          DetallesTemperaturaAmbiente: test.pdfData.detallesTemperaturaAmbiente,
          DetallesTemperaturaLadoAcoplamiento: test.pdfData.detallesTemperaturaLadoAcoplamiento,
          DetallesTemperaturaLadoBomba: test.pdfData.detallesTemperaturaLadoBomba,
          DetallesTiempoFuncionamientoBomba: test.pdfData.detallesTiempoFuncionamientoBomba,

          // Motor Data
          MotorMarca: test.pdfData.motorMarca,
          MotorTipo: test.pdfData.motorTipo,
          MotorPotencia: test.pdfData.motorPotencia,
          MotorVelocidad: test.pdfData.motorVelocidad,
          MotorIntensidad: test.pdfData.motorIntensidad,
          MotorRendimiento25: test.pdfData.motorRendimiento25,
          MotorRendimiento50: test.pdfData.motorRendimiento50,
          MotorRendimiento75: test.pdfData.motorRendimiento75,
          MotorRendimiento100: test.pdfData.motorRendimiento100,
          MotorRendimiento125: test.pdfData.motorRendimiento125
        } : null
      };

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
