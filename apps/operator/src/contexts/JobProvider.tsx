import React, { createContext, useContext, useState, useCallback } from "react";

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

    // General
    tolerance?: string;
    internalComment?: string;
  };
  createdAt: Date;
}

interface JobContextType {
  jobs: Job[];
  currentJob: Job | null;
  selectJob: (job: Job) => void;
  updateJob: (updates: Partial<Job>) => void;
  clearJob: () => void;
  testConfig: TestConfig | null;
  setTestConfig: (config: TestConfig) => void;
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
  const [jobs] = useState<Job[]>(mockJobs);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [testConfig, setTestConfig] = useState<TestConfig | null>(null);

  const selectJob = useCallback((job: Job) => {
    setCurrentJob(job);
    setTestConfig({
      bankId: "A",
      testPressure: 6,
      points: generateDefaultPoints(job.targetFlow),
    });
  }, []);

  const clearJob = useCallback(() => {
    setCurrentJob(null);
    setTestConfig(null);
  }, []);

  return (
    <JobContext.Provider
      value={{
        jobs,
        currentJob,
        selectJob,
        updateJob: (updates: Partial<Job>) => {
          if (!currentJob) return;
          const updatedJob = { ...currentJob, ...updates };
          setCurrentJob(updatedJob);
          // Update in jobs list as well for consistency (mock)
          /* const updatedJobs = jobs.map(j => j.id === currentJob.id ? updatedJob : j);
                       setJobs(updatedJobs); */
        },
        clearJob,
        testConfig,
        setTestConfig,
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
