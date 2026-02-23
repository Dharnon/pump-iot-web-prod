import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  getTests,
  getTestById,
  patchTest,
  type Test,
} from "@pump-iot/core/api";
import { toast } from "sonner";
import { HubConnectionState } from "@microsoft/signalr";
import { useSignalR, type Locks } from "../hooks/useSignalR";

// =============================================================================
// TYPES (Extracted from original TestingContext)
// =============================================================================

export type JobStatus = "GENERADA" | "OK" | "KO" | "EN_PROCESO";

export interface TelemetryData {
  pressure: number;
  flow: number;
  temperature: number;
  power: number;
  npsh: number;
  timestamp: number;
}

export interface TestPoint {
  id: number;
  targetFlow: number;
  captured: boolean;
  capturedData?: TelemetryData;
}

export interface TestConfig {
  bankId: "A" | "B" | "C" | "D" | "E";
  testPressure: number;
  points: TestPoint[];
}

export interface TestResults {
  capturedPoints: TelemetryData[];
  testConfig: TestConfig;
}

export interface Job {
  id: string;
  orderId: string;
  model: string;
  client: string;
  status: JobStatus;
  targetFlow: number;
  impeller: string;
  errorMessage?: string;
  completedAt?: Date;
  testResults?: TestResults;
  protocolSpec?: {
    // Generic
    customerOrder?: string;
    jobDate?: string;
    pumpQuantity?: number;
    workOrder?: string;

    // Pump Data
    itemNumber?: string;
    pumpType?: string;
    serialNumber?: string;
    suctionDiameter?: number; // mm
    dischargeDiameter?: number; // mm
    impellerDiameter?: string; // mm
    sealType?: string;
    isVertical?: boolean;

    // Motor Data
    motorBrand?: string;
    motorType?: string;
    motorPower?: number; // kW
    nominalSpeed?: number; // rpm
    current?: number; // A
    voltage?: number; // V
    frequency?: number; // Hz
    poles?: number;
    // Efficiency points (%)
    efficiency25?: number;
    efficiency50?: number;
    efficiency75?: number;
    efficiency100?: number;
    efficiency125?: number;

    // Pressures
    manometricCorrection?: number;
    atmosphericPressure?: number;

    // Temperatures & Run Time
    waterTemperature?: number; // °C
    ambientTemperature?: number; // °C
    runTime?: number; // min
    couplingTemperature?: number; // Side Coupling
    pumpTemperature?: number; // Side Pump

    // Guaranteed Point (Water)
    guaranteedFlow?: number; // m³/h
    guaranteedHead?: number; // m
    guaranteedSpeed?: number; // rpm
    guaranteedPower?: number; // kW
    guaranteedEfficiency?: number; // %
    guaranteedNpshr?: number; // m
    guaranteedQMin?: number; // m³/h
    bestEfficiencyPointFlow?: number; // m³/h

    // Guaranteed Point (Specific Fluid)
    fluidName?: string;
    fluidTemperature?: number; // °C
    fluidViscosity?: number; // cst
    fluidDensity?: number; // kg/m³
    fluidFlow?: number; // m³/h
    fluidHead?: number; // m
    fluidSpeed?: number; // rpm
    fluidPower?: number; // kW
    fluidEfficiency?: number; // %
    cq?: number; // CaudalCoeficiente
    ch?: number; // AlturaCoeficiente
    ce?: number; // RendimientoCoeficiente

    // General
    tolerance?: string;
    internalComment?: string;
  };
  createdAt: Date;
}

interface JobContextType {
  jobs: Job[];
  isLoading: boolean;
  currentJob: Job | null;
  selectJob: (job: Job) => Promise<void>;
  updateJob: (updates: Partial<Job>) => Promise<void>;
  clearJob: () => void;
  testConfig: TestConfig | null;
  setTestConfig: (config: TestConfig) => void;
  // SignalR
  connectionState: HubConnectionState;
  locks: Locks;
  lockProtocol: (id: string) => void;
  unlockProtocol: (id: string) => void;
  /** Set of protocol IDs locked by THIS device/session */
  myLockedProtocols: Set<string>;
}

// =============================================================================
// HELPERS
// =============================================================================

const generateDefaultPoints = (targetFlow: number): TestPoint[] => [
  { id: 1, targetFlow: 0, captured: false },
  { id: 2, targetFlow: 5, captured: false },
  { id: 3, targetFlow: targetFlow, captured: false },
  { id: 4, targetFlow: targetFlow * 1.1, captured: false },
  { id: 5, targetFlow: targetFlow * 1.3, captured: false },
];

const generateMockTestResults = (
  targetFlow: number,
  isOK: boolean,
): TestResults => {
  const points = generateDefaultPoints(targetFlow);
  const capturedPoints: TelemetryData[] = points.map((point, index) => {
    const baseFlow = point.targetFlow;
    const variation = isOK
      ? (Math.random() - 0.5) * 0.5
      : index === 2
        ? 3.5
        : (Math.random() - 0.5) * 0.8;
    return {
      pressure: 4 + Math.random() * 4,
      flow: baseFlow + variation,
      temperature: 25 + Math.random() * 15,
      power: 1 + Math.random() * 2,
      npsh: 3 + Math.random() * 2,
      timestamp: Date.now() - (5 - index) * 60000,
    };
  });

  return {
    capturedPoints,
    testConfig: {
      bankId: "A",
      testPressure: 6,
      points: points.map((p, i) => ({
        ...p,
        captured: true,
        capturedData: capturedPoints[i],
      })),
    },
  };
};

// Mock data - TODO: Move to a service/API layer
const mockJobs: Job[] = [
  {
    id: "1",
    orderId: "ORD-2024-001",
    model: "BOMBA-X-500",
    client: "Aguas Andinas",
    status: "GENERADA",
    targetFlow: 150,
    impeller: "250mm",
    createdAt: new Date("2024-01-15T08:30:00"),
    protocolSpec: {
      // Pump
      itemNumber: "P-101",
      pumpType: "Centrífuga",
      serialNumber: "SN-2024-001",
      impellerDiameter: "250",
      suctionDiameter: 100,
      dischargeDiameter: 80,
      sealType: "MECANICO",
      isVertical: false,

      // Motor
      motorBrand: "WEG",
      motorType: "W22 Premium",
      motorPower: 75,
      nominalSpeed: 2900,
      current: 125,
      voltage: 380,
      frequency: 50,
      poles: 2,
      efficiency100: 94.5,

      // Pressures
      manometricCorrection: 0.5,
      atmosphericPressure: 1013,

      // Temperatures
      waterTemperature: 20,
      ambientTemperature: 25,
      runTime: 30,

      // Guaranteed Point (Water)
      guaranteedFlow: 150,
      guaranteedHead: 45,
      guaranteedSpeed: 2900,
      guaranteedPower: 65,
      guaranteedEfficiency: 82,
      guaranteedNpshr: 1.5,

      internalComment: "Prueba estándar de recepción.",
    },
  },
  {
    id: "2",
    orderId: "ORD-2024-002",
    model: "BOMBA-Y-750",
    client: "Minera Escondida",
    status: "EN_PROCESO",
    targetFlow: 300,
    impeller: "320mm",
    createdAt: new Date("2024-01-16T10:15:00"),
    protocolSpec: {
      // Pump
      itemNumber: "P-202",
      pumpType: "Centrífuga",
      serialNumber: "SN-2024-002",
      impellerDiameter: "320",
      suctionDiameter: 150,
      dischargeDiameter: 100,
      isVertical: true,

      // Motor
      motorBrand: "Siemens",
      motorType: "IE3",
      motorPower: 110,
      nominalSpeed: 1450,
      current: 180,
      voltage: 380,
      frequency: 50,
      poles: 4,
      efficiency100: 95.2,

      // Guaranteed Point (Water)
      guaranteedFlow: 300,
      guaranteedHead: 60,
      guaranteedSpeed: 1450,
      guaranteedPower: 95,
      guaranteedEfficiency: 85,
      guaranteedNpshr: 2.1,
    },
  },
  {
    id: "3",
    orderId: "ORD-2024-003",
    model: "BOMBA-Z-100",
    client: "Copec",
    status: "OK",
    targetFlow: 50,
    impeller: "180mm",
    completedAt: new Date("2024-01-14T17:30:00"),
    createdAt: new Date("2024-01-14T15:45:00"),
    testResults: generateMockTestResults(50, true), // Adapted to existing TestResults interface
    protocolSpec: {
      // Pump
      itemNumber: "P-303",
      pumpType: "Centrífuga",
      serialNumber: "SN-2024-003",
      impellerDiameter: "180",
      suctionDiameter: 80,
      dischargeDiameter: 50,
      sealType: "MECANICO",
      isVertical: false,

      // Motor
      motorBrand: "ABB",
      motorType: "M3BP",
      motorPower: 30,
      nominalSpeed: 2950,
      current: 55,
      voltage: 380,
      frequency: 50,
      poles: 2,
      efficiency100: 93.8,

      // Guaranteed Point (Water)
      guaranteedFlow: 50,
      guaranteedHead: 35,
      guaranteedSpeed: 2950,
      guaranteedPower: 25,
      guaranteedEfficiency: 78,
      guaranteedNpshr: 1.2,

      // Guaranteed Point (Specific Fluid)
      fluidName: "DIESEL",
      fluidTemperature: 20,
      fluidViscosity: 3.5,
      fluidDensity: 850,
      fluidFlow: 25,
      fluidHead: 35,
      fluidSpeed: 2950,
      fluidPower: 25,
      fluidEfficiency: 78,

      tolerance: "ISO 9906 Grade 2B",
      internalComment:
        "Cliente solicita prueba con fluido real si es posible (Simulado con agua con corrección).",
    },
  },
  {
    id: "4",
    orderId: "ORD-2024-004",
    model: "SUB-400",
    client: "Essbio",
    status: "KO",
    targetFlow: 80,
    impeller: "300mm",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    errorMessage: "Falla en prueba de presión hidrostática",
    completedAt: new Date(Date.now() - 172800000), // 2 days ago
    testResults: generateMockTestResults(80, false), // Adapted to existing TestResults interface
    protocolSpec: {
      // Pump
      itemNumber: "P-404",
      pumpType: "Centrífuga",
      serialNumber: "SN-2024-004",
      impellerDiameter: "300",
      suctionDiameter: 150,
      dischargeDiameter: 100,
      isVertical: true,
      sealType: "CARTUCHO",

      // Motor
      motorBrand: "Grundfos",
      motorType: "MGE",
      motorPower: 22,
      nominalSpeed: 2920,
      current: 39.5,
      voltage: 415,
      frequency: 50,
      poles: 2,
      efficiency100: 93.0,

      // Guaranteed Point (Water)
      guaranteedFlow: 80,
      guaranteedHead: 60,
      guaranteedSpeed: 2920,
      guaranteedPower: 25,
      guaranteedEfficiency: 75,
      guaranteedNpshr: 3.0,

      // Fluid
      fluidName: "AGUA RESIDUAL",
      fluidTemperature: 18,
      fluidViscosity: 1.1,
      fluidDensity: 1010,

      tolerance: "ISO 9906 Grade 2B",
      internalComment:
        "Falla en prueba de presión hidrostática. Revisar sellos.",
    },
  },
];

// =============================================================================
// CONTEXT
// =============================================================================

const JobContext = createContext<JobContextType | null>(null);

// =============================================================================
// PROVIDER
// =============================================================================

/**
 * JobProvider - Gestiona SOLO los datos de trabajos y configuración de test.
 *
 * SOLID: Single Responsibility - Solo jobs y configuración, sin navegación ni telemetría.
 * Vercel: rerender-defer-reads - Este contexto cambia solo al seleccionar un trabajo,
 *         no afecta a componentes de telemetría en tiempo real.
 */
export const JobProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [testConfig, setTestConfig] = useState<TestConfig | null>(null);
  // Tracks which protocol IDs THIS session has locked (not other devices)
  const [myLockedProtocols, setMyLockedProtocols] = useState<Set<string>>(
    new Set(),
  );

  const fetchJobsRef = useRef<() => Promise<void>>();

  const { connectionState, locks, lockProtocol, unlockProtocol, isConnected } =
    useSignalR({
      onListUpdated: () => {
        // Re-fetch jobs when supervisor generates a new protocol
        fetchJobsRef.current?.();
      },
    });

  // Keep a ref to the current job id so cleanup functions always see the latest
  const currentJobIdRef = useRef<string | null>(null);
  currentJobIdRef.current = currentJob?.id ?? null;

  // Effect 1: Lock when a job is selected, unlock when deselected or job changes
  useEffect(() => {
    if (!currentJob?.id) return;

    // Only lock if we're connected. If not, Effect 2 will handle it on reconnect.
    if (isConnected) {
      console.log(`[JobProvider] Locking protocol ${currentJob.id}`);
      lockProtocol(currentJob.id);
      setMyLockedProtocols((prev) => new Set(prev).add(currentJob.id));
    }

    return () => {
      // Cleanup: unlock the job that was locked by THIS effect run
      const jobId = currentJob.id; // captured at effect creation time
      if (jobId) {
        console.log(`[JobProvider] Unlocking protocol ${jobId}`);
        unlockProtocol(jobId);
        setMyLockedProtocols((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
      }
    };
    // Only re-run when the job actually changes — NOT when isConnected flips
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentJob?.id, lockProtocol, unlockProtocol]);

  // Effect 2: Re-lock on reconnect (without triggering an unlock on cleanup)
  useEffect(() => {
    if (!isConnected) return;
    if (!currentJobIdRef.current) return;

    console.log(
      `[JobProvider] Re-locking protocol ${currentJobIdRef.current} after reconnect`,
    );
    lockProtocol(currentJobIdRef.current);
    setMyLockedProtocols((prev) => new Set(prev).add(currentJobIdRef.current!));
    // No unlock in cleanup — Effect 1 owns the unlock lifecycle
  }, [isConnected, lockProtocol]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const data = await getTests();
        console.log("Raw API Response:", data);

        // Filtrar protocolos generados (admitiendo variantes de status)
        const mappedJobs: Job[] = data
          .filter(
            (t) =>
              (t.status === "GENERATED" ||
                t.status === "GENERADO" ||
                t.status === "PROCESADO") &&
              !String(t.id).startsWith("pending-"),
          )
          .map((t) => {
            const info = t.generalInfo as any;
            return {
              id: t.id.toString(),
              orderId: info.pedidoCliente || info.pedido || `JOB-${t.id}`,
              model: info.modeloBomba || "Desconocido",
              client: info.cliente || "Desconocido",
              status: "GENERADA",
              targetFlow: 0,
              impeller: info.item || "",
              createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
              protocolSpec: {
                customerOrder: info.pedidoCliente || info.pedido,
                workOrder: info.ordenTrabajo,
                itemNumber: info.item,
                jobDate: info.fecha,
                pumpType: info.tipoDeBomba || info.modeloBomba, // Fallback to model if type is missing
                serialNumber: t.numeroSerie,
              },
            };
          });

        console.log("Mapped Jobs:", mappedJobs);
        setJobs(mappedJobs);
      } catch (error) {
        console.error("Error fetching jobs from API:", error);
        // Fallback to mock data on error for development if needed,
        // but better to show empty state or error in production.
        // setJobs(mockJobs);
      } finally {
        setLoading(false);
      }
    };

    fetchJobsRef.current = fetchJobs;
    fetchJobs();
  }, []);

  const selectJob = useCallback(async (job: Job) => {
    // 1. Set basic job info first (optimistic)
    setCurrentJob(job);
    setTestConfig({
      bankId: "A",
      testPressure: 6,
      points: generateDefaultPoints(job.targetFlow),
    });

    try {
      // 2. Fetch full details from backend
      const fullTest = await getTestById(job.id);
      console.log("Full Test Details:", fullTest);

      // 3. Map full details to Job structure
      const info = fullTest.generalInfo as any;

      const updatedJob: Job = {
        ...job,
        // Update orderId logic for Detail View
        orderId: info.pedidoCliente || info.pedido || job.orderId,
        protocolSpec: {
          ...job.protocolSpec,
          // Generic
          customerOrder: info.pedidoCliente,
          jobDate: info.fecha,
          pumpQuantity: info.numeroBombas,
          workOrder: info.ordenTrabajo,

          // Pump
          itemNumber: fullTest.bomba?.item,
          pumpType: fullTest.bomba?.tipo,
          suctionDiameter: fullTest.bomba?.diametroAspiracion,
          dischargeDiameter: fullTest.bomba?.diametroImpulsion,
          impellerDiameter: fullTest.bomba?.diametroRodete,
          sealType: fullTest.bomba?.tipoCierre,
          isVertical: fullTest.bomba?.vertical,

          // Motor
          motorBrand: fullTest.motor?.marca,
          motorType: fullTest.motor?.tipo,
          motorPower: fullTest.motor?.potencia,
          nominalSpeed: fullTest.motor?.velocidad,
          current: fullTest.motor?.intensidad,
          // efficiencies...
          efficiency25: fullTest.motor?.rendimiento25,
          efficiency50: fullTest.motor?.rendimiento50,
          efficiency75: fullTest.motor?.rendimiento75,
          efficiency100: fullTest.motor?.rendimiento100,
          efficiency125: fullTest.motor?.rendimiento125,

          // Pressures
          manometricCorrection: fullTest.detalles?.correccionManometrica,
          atmosphericPressure: fullTest.detalles?.presionAtmosferica,

          // Temperatures
          waterTemperature: fullTest.detalles?.temperaturaAgua,
          ambientTemperature: fullTest.detalles?.temperaturaAmbiente,
          runTime: fullTest.detalles?.tiempoFuncionamientoBomba,
          couplingTemperature: fullTest.detalles?.temperaturaLadoAcoplamiento,
          pumpTemperature: fullTest.detalles?.temperaturaLadoBomba,

          // Guaranteed Point (Water) - from FluidoH2O
          guaranteedFlow: fullTest.fluidoH2O?.caudal,
          guaranteedHead: fullTest.fluidoH2O?.altura,
          guaranteedSpeed: fullTest.fluidoH2O?.velocidad,
          guaranteedPower: fullTest.fluidoH2O?.potencia,
          guaranteedEfficiency: fullTest.fluidoH2O?.rendimiento,
          guaranteedNpshr: fullTest.fluidoH2O?.npshRequerido,
          guaranteedQMin: fullTest.fluidoH2O?.qMin,
          bestEfficiencyPointFlow: fullTest.fluidoH2O?.bep,

          // Guaranteed Point (Specific Fluid) - from Fluido
          fluidName: fullTest.fluido?.nombre,
          fluidTemperature: fullTest.fluido?.temperatura,
          fluidViscosity: fullTest.fluido?.viscosidad,
          fluidDensity: fullTest.fluido?.densidad,
          fluidFlow: fullTest.fluido?.caudal,
          fluidHead: fullTest.fluido?.altura,
          fluidSpeed: fullTest.fluido?.velocidad,
          fluidPower: fullTest.fluido?.potencia,
          fluidEfficiency: fullTest.fluido?.rendimiento,
          cq: fullTest.fluido?.caudalCoeficiente,
          ch: fullTest.fluido?.alturaCoeficiente,
          ce: fullTest.fluido?.rendimientoCoeficiente,

          // General
          tolerance: fullTest.detalles?.comentario,
          internalComment: fullTest.detalles?.comentarioInterno,
        },
      };

      setCurrentJob(updatedJob);

      // Update TestConfig based on guaranteed points if available
      if (updatedJob.protocolSpec?.guaranteedFlow) {
        setTestConfig({
          bankId: "A",
          testPressure: 6,
          points: generateDefaultPoints(updatedJob.protocolSpec.guaranteedFlow),
        });
      }
    } catch (error) {
      console.error("Error fetching full job details:", error);
      toast.error("Error al cargar los detalles del protocolo");
    }
  }, []);

  const updateJob = useCallback(
    async (updates: Partial<Job>) => {
      if (!currentJob) return;

      try {
        // 1. Optimistic update
        let updatedJob = { ...currentJob, ...updates };

        // Update orderId if customerOrder changed (since it's now the main ID)
        if (updates.protocolSpec?.customerOrder) {
          updatedJob = {
            ...updatedJob,
            orderId: updates.protocolSpec.customerOrder,
          };
        }

        setCurrentJob(updatedJob);

        // 2. Map updates to Backend DTO structure (PdfDataDto)
        // We only map fields that are present in `updates.protocolSpec`
        const spec = updates.protocolSpec || {};

        const pdfDataDto = {
          // Pump
          Item: spec.itemNumber,
          ModeloBomba: spec.pumpType,
          NumeroSerie: spec.serialNumber,
          SuctionDiameter: spec.suctionDiameter?.toString(),
          DischargeDiameter: spec.dischargeDiameter?.toString(),
          ImpellerDiameter: spec.impellerDiameter,
          SealType: spec.sealType,
          Vertical: spec.isVertical?.toString(),

          // Motor
          MotorMarca: spec.motorBrand,
          MotorTipo: spec.motorType,
          MotorPotencia: spec.motorPower?.toString(),
          MotorVelocidad: spec.nominalSpeed?.toString(),
          MotorIntensidad: spec.current?.toString(),
          MotorRendimiento25: spec.efficiency25?.toString(),
          MotorRendimiento50: spec.efficiency50?.toString(),
          MotorRendimiento75: spec.efficiency75?.toString(),
          MotorRendimiento100: spec.efficiency100?.toString(),
          MotorRendimiento125: spec.efficiency125?.toString(),

          // Pressures & Temps
          DetallesCorreccionManometrica: spec.manometricCorrection?.toString(),
          DetallesPresionAtmosferica: spec.atmosphericPressure?.toString(),
          DetallesTemperaturaAgua: spec.waterTemperature?.toString(),
          DetallesTemperaturaAmbiente: spec.ambientTemperature?.toString(),
          DetallesTemperaturaLadoAcoplamiento:
            spec.couplingTemperature?.toString(),
          DetallesTemperaturaLadoBomba: spec.pumpTemperature?.toString(),
          DetallesTiempoFuncionamientoBomba: spec.runTime?.toString(),

          // Guaranteed Point (Water)
          FlowRate: spec.guaranteedFlow?.toString(),
          Head: spec.guaranteedHead?.toString(),
          Rpm: spec.guaranteedSpeed?.toString(),
          MaxPower: spec.guaranteedPower?.toString(),
          Efficiency: spec.guaranteedEfficiency?.toString(),
          Npshr: spec.guaranteedNpshr?.toString(),
          QMin: spec.guaranteedQMin?.toString(),
          BepFlow: spec.bestEfficiencyPointFlow?.toString(),

          // Guaranteed Point (Fluid)
          LiquidDescription: spec.fluidName,
          Temperature: spec.fluidTemperature?.toString(),
          Viscosity: spec.fluidViscosity?.toString(),
          Density: spec.fluidDensity?.toString(),
          FluidFlowRate: spec.fluidFlow?.toString(),
          FluidHead: spec.fluidHead?.toString(),
          FluidRpm: spec.fluidSpeed?.toString(),
          FluidPower: spec.fluidPower?.toString(),
          FluidEfficiency: spec.fluidEfficiency?.toString(),
          CaudalCoeficiente: spec.cq?.toString(),
          AlturaCoeficiente: spec.ch?.toString(),
          RendimientoCoeficiente: spec.ce?.toString(),

          // General
          Tolerance: spec.tolerance,
          InternalComment: spec.internalComment,
        };

        // 3. Call API
        await patchTest(currentJob.id, {
          pdfData: pdfDataDto,
          numeroSerie: spec.serialNumber,
          generalInfo: {
            item: spec.itemNumber,
            modeloBomba: spec.pumpType,
            pedidoCliente: spec.customerOrder,
            fecha: spec.jobDate,
            numeroBombas: spec.pumpQuantity,
            ordenTrabajo: spec.workOrder,
          } as any, // Cast to any to avoid deep partial issues if strict, but mainly to allow partial generalInfo if needed
        });

        toast.success("Cambios guardados correctamente");
      } catch (error) {
        console.error("Error updating job:", error);
        toast.error("Error al guardar los cambios");
      }
    },
    [currentJob],
  );

  const clearJob = useCallback(() => {
    setCurrentJob(null);
    setTestConfig(null);
  }, []);

  return (
    <JobContext.Provider
      value={{
        jobs,
        isLoading: loading,
        currentJob,
        selectJob,
        updateJob,
        clearJob,
        testConfig,
        setTestConfig,
        // SignalR
        connectionState,
        locks,
        lockProtocol,
        unlockProtocol,
        myLockedProtocols,
      }}
    >
      {children}
    </JobContext.Provider>
  );
};

// =============================================================================
// HOOK
// =============================================================================

export const useJob = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error("useJob must be used within a JobProvider");
  }
  return context;
};
