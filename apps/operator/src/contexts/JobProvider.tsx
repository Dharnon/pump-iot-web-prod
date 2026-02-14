import React, { createContext, useContext, useState, useCallback } from 'react';

// =============================================================================
// TYPES (Extracted from original TestingContext)
// =============================================================================

export type JobStatus = 'GENERADA' | 'OK' | 'KO' | 'EN_PROCESO';

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
    bankId: 'A' | 'B' | 'C' | 'D' | 'E';
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
        // Motor
        motorPower: number; // kW
        nominalSpeed: number; // rpm
        efficiency: number; // %
        voltage: number; // V
        current: number; // A
        frequency: number; // Hz
        poles: number;
        motorBrand?: string;
        motorType?: string;

        // Pump
        suctionDiameter?: number;
        dischargeDiameter?: number;
        impellerDiameter?: string;
        sealType?: string;
        isVertical?: boolean;

        // Operating Point
        flowRate?: number;
        head?: number;
        npshr?: number;
        maxPower?: number;

        // Fluid
        liquidDescription?: string;
        temperature?: number;
        viscosity?: number;
        density?: number;

        // General
        tolerance?: string;
        internalComment?: string;
    };
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

const generateMockTestResults = (targetFlow: number, isOK: boolean): TestResults => {
    const points = generateDefaultPoints(targetFlow);
    const capturedPoints: TelemetryData[] = points.map((point, index) => {
        const baseFlow = point.targetFlow;
        const variation = isOK ? (Math.random() - 0.5) * 0.5 : (index === 2 ? 3.5 : (Math.random() - 0.5) * 0.8);
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
            bankId: 'A',
            testPressure: 6,
            points: points.map((p, i) => ({ ...p, captured: true, capturedData: capturedPoints[i] })),
        },
    };
};

// Mock data - TODO: Move to a service/API layer
const mockJobs: Job[] = [
    {
        id: '1',
        orderId: 'ORD-2024-001',
        model: 'BOMBA-X-500',
        client: 'Aguas Andinas',
        status: 'GENERADA',
        targetFlow: 150,
        impeller: '250mm',
        protocolSpec: {
            motorPower: 15,
            nominalSpeed: 2900,
            efficiency: 68,
            voltage: 380,
            current: 28.5,
            frequency: 50,
            poles: 2,
            motorBrand: 'WEG',
            motorType: 'W22 Premium',

            suctionDiameter: 100,
            dischargeDiameter: 80,
            impellerDiameter: '250',
            sealType: 'MECANICO',
            isVertical: false,

            flowRate: 150,
            head: 45,
            npshr: 2.5,
            maxPower: 18.5,

            liquidDescription: 'AGUA',
            temperature: 25,
            viscosity: 1,
            density: 1000,

            tolerance: 'ISO 9906 Grade 2B',
            internalComment: 'Prueba estándar de recepción.'
        }
    },
    {
        id: '2',
        orderId: 'ORD-2024-002',
        model: 'MULTISTAGE-V',
        client: 'Minera Escondida',
        status: 'EN_PROCESO',
        targetFlow: 450,
        impeller: '420mm',
        protocolSpec: {
            motorPower: 75,
            nominalSpeed: 1450,
            efficiency: 92,
            voltage: 380,
            current: 135,
            frequency: 50,
            poles: 4,
            motorBrand: 'SIEMENS',
            motorType: '1LE1',

            suctionDiameter: 200,
            dischargeDiameter: 150,
            impellerDiameter: '420',
            sealType: 'MECANICO',
            isVertical: true,

            flowRate: 450,
            head: 120,
            npshr: 4.2,
            maxPower: 85,

            liquidDescription: 'AGUA INDUSTRIAL',
            temperature: 20,
            viscosity: 1.2,
            density: 1020,

            tolerance: 'ISO 9906 Grade 1B',
            internalComment: 'Verificar vibraciones en acople.'
        }
    },
    {
        id: '3',
        orderId: 'ORD-2024-003',
        model: 'ISO-2858',
        client: 'Copec',
        status: 'OK',
        targetFlow: 25,
        impeller: '180mm',
        completedAt: new Date(Date.now() - 86400000), // Yesterday
        testResults: generateMockTestResults(25, true), // Adapted to existing TestResults interface
        protocolSpec: {
            motorPower: 5.5,
            nominalSpeed: 2900,
            efficiency: 85,
            voltage: 380,
            current: 10.5,
            frequency: 50,
            poles: 2,
            motorBrand: 'ABB',
            motorType: 'M3BP',

            suctionDiameter: 50,
            dischargeDiameter: 32,
            impellerDiameter: '180',
            sealType: 'MECANICO',
            isVertical: false,

            flowRate: 25,
            head: 35,
            npshr: 1.5,
            maxPower: 6.0,

            liquidDescription: 'DIESEL',
            temperature: 20,
            viscosity: 3.5,
            density: 850,

            tolerance: 'ISO 9906 Grade 2B',
            internalComment: 'Cliente solicita prueba con fluido real si es posible (Simulado con agua con corrección).'
        }
    },
    {
        id: '4',
        orderId: 'ORD-2024-004',
        model: 'SUB-400',
        client: 'Essbio',
        status: 'KO',
        targetFlow: 80,
        impeller: '300mm',
        errorMessage: 'Falla en prueba de presión hidrostática',
        completedAt: new Date(Date.now() - 172800000), // 2 days ago
        testResults: generateMockTestResults(80, false), // Adapted to existing TestResults interface
        protocolSpec: {
            motorPower: 22,
            nominalSpeed: 2920,
            efficiency: 75,
            voltage: 415,
            current: 39.5,
            frequency: 50,
            poles: 2,
            motorBrand: 'Grundfos',
            motorType: 'MGE',

            suctionDiameter: 150,
            dischargeDiameter: 100,
            impellerDiameter: '300',
            sealType: 'CARTUCHO',
            isVertical: true,

            flowRate: 80,
            head: 60,
            npshr: 3.0,
            maxPower: 25,

            liquidDescription: 'AGUA RESIDUAL',
            temperature: 18,
            viscosity: 1.1,
            density: 1010,

            tolerance: 'ISO 9906 Grade 2B',
            internalComment: 'Falla en prueba de presión hidrostática. Revisar sellos.'
        }
    }
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
export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [jobs] = useState<Job[]>(mockJobs);
    const [currentJob, setCurrentJob] = useState<Job | null>(null);
    const [testConfig, setTestConfig] = useState<TestConfig | null>(null);

    const selectJob = useCallback((job: Job) => {
        setCurrentJob(job);
        setTestConfig({
            bankId: 'A',
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
        throw new Error('useJob must be used within a JobProvider');
    }
    return context;
};


