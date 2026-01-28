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
}

interface JobContextType {
    jobs: Job[];
    currentJob: Job | null;
    selectJob: (job: Job) => void;
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
        orderId: '1343537',
        model: '1K1.5x1LF-82 M3 LF FPD - D4',
        client: 'Industrial Solutions S.A.',
        status: 'GENERADA',
        targetFlow: 10.7,
        impeller: '140mm',
    },
    {
        id: '2',
        orderId: '1343538',
        model: '2K2.0x1LF-95 M4 LF FPD - D5',
        client: 'AquaTech Industries',
        status: 'OK',
        targetFlow: 15.2,
        impeller: '160mm',
        completedAt: new Date('2025-01-12'),
        testResults: generateMockTestResults(15.2, true),
    },
    {
        id: '3',
        orderId: '1343539',
        model: '1K1.0x1LF-70 M2 LF FPD - D3',
        client: 'HydroPump Corp',
        status: 'KO',
        targetFlow: 8.5,
        impeller: '120mm',
        errorMessage: 'Fallo Vibración',
        testResults: generateMockTestResults(8.5, false),
    },
    {
        id: '4',
        orderId: '1343540',
        model: '3K2.5x2LF-110 M5 LF FPD - D6',
        client: 'Bombas del Norte',
        status: 'GENERADA',
        targetFlow: 22.0,
        impeller: '180mm',
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


