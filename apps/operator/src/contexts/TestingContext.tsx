import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

// Types
export type AppView = 'dashboard' | 'setup' | 'cockpit' | 'analytics';
export type JobStatus = 'GENERADA' | 'OK' | 'KO' | 'EN_PROCESO';

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

export interface TelemetryData {
  pressure: number;
  flow: number;
  temperature: number;
  power: number;
  npsh: number;
  timestamp: number;
}

export interface ControlState {
  motorOn: boolean;
  motorSpeed: number;
  valveOpening: number;
}

interface TestingContextType {
  // Navigation
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  
  // Jobs
  jobs: Job[];
  currentJob: Job | null;
  selectJob: (job: Job) => void;
  
  // Config
  testConfig: TestConfig | null;
  setTestConfig: (config: TestConfig) => void;
  
  // Controls
  controls: ControlState;
  setMotorOn: (on: boolean) => void;
  setMotorSpeed: (speed: number) => void;
  setValveOpening: (opening: number) => void;
  
  // Telemetry
  telemetry: TelemetryData;
  telemetryHistory: TelemetryData[];
  
  // Test execution
  currentPointIndex: number;
  isStable: boolean;
  capturePoint: () => void;
  capturedPoints: TelemetryData[];
  setCapturedPoints: React.Dispatch<React.SetStateAction<TelemetryData[]>>;
  
  // Reset
  resetTest: () => void;
}

const TestingContext = createContext<TestingContextType | null>(null);

// Generate default test points
const generateDefaultPoints = (targetFlow: number): TestPoint[] => [
  { id: 1, targetFlow: 0, captured: false },
  { id: 2, targetFlow: 5, captured: false },
  { id: 3, targetFlow: targetFlow, captured: false }, // Nominal
  { id: 4, targetFlow: targetFlow * 1.1, captured: false },
  { id: 5, targetFlow: targetFlow * 1.3, captured: false },
];

// Generate mock test results for historical jobs
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

// Mock jobs data
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

export const TestingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [jobs] = useState<Job[]>(mockJobs);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [testConfig, setTestConfig] = useState<TestConfig | null>(null);
  const [controls, setControls] = useState<ControlState>({
    motorOn: false,
    motorSpeed: 50,
    valveOpening: 50,
  });
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    pressure: 0,
    flow: 0,
    temperature: 25,
    power: 0,
    npsh: 0,
    timestamp: Date.now(),
  });
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryData[]>([]);
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const [isStable, setIsStable] = useState(false);
  const [capturedPoints, setCapturedPoints] = useState<TelemetryData[]>([]);
  
  const stabilityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const telemetryIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const selectJob = useCallback((job: Job) => {
    setCurrentJob(job);
    setTestConfig({
      bankId: 'A',
      testPressure: 6,
      points: generateDefaultPoints(job.targetFlow),
    });
  }, []);

  const setMotorOn = useCallback((on: boolean) => {
    setControls(prev => ({ ...prev, motorOn: on }));
  }, []);

  const setMotorSpeed = useCallback((speed: number) => {
    setControls(prev => ({ ...prev, motorSpeed: speed }));
  }, []);

  const setValveOpening = useCallback((opening: number) => {
    setControls(prev => ({ ...prev, valveOpening: opening }));
  }, []);

  // Simulate telemetry data
  useEffect(() => {
    if (currentView !== 'cockpit' || !controls.motorOn) {
      if (telemetryIntervalRef.current) {
        clearInterval(telemetryIntervalRef.current);
      }
      return;
    }

    telemetryIntervalRef.current = setInterval(() => {
      const targetFlow = testConfig?.points[currentPointIndex]?.targetFlow || 0;
      const speedFactor = controls.motorSpeed / 100;
      const valveFactor = controls.valveOpening / 100;

      // Simulate realistic values with some noise
      const baseFlow = targetFlow * speedFactor * valveFactor;
      const noise = () => (Math.random() - 0.5) * 0.3;

      const newTelemetry: TelemetryData = {
        pressure: Math.max(0, 4 + speedFactor * 4 + noise()),
        flow: Math.max(0, baseFlow + noise() * 0.5),
        temperature: 25 + speedFactor * 15 + noise() * 2,
        power: Math.max(0, speedFactor * 2.5 + noise() * 0.2),
        npsh: Math.max(0, 3 + valveFactor * 2 + noise() * 0.3),
        timestamp: Date.now(),
      };

      setTelemetry(newTelemetry);
      setTelemetryHistory(prev => [...prev.slice(-19), newTelemetry]);
    }, 500);

    return () => {
      if (telemetryIntervalRef.current) {
        clearInterval(telemetryIntervalRef.current);
      }
    };
  }, [currentView, controls.motorOn, controls.motorSpeed, controls.valveOpening, testConfig, currentPointIndex]);

  // Check stability
  useEffect(() => {
    if (!controls.motorOn || currentView !== 'cockpit') {
      setIsStable(false);
      return;
    }

    // Simulate stability after 3 seconds of running
    stabilityTimerRef.current = setTimeout(() => {
      setIsStable(true);
    }, 3000);

    return () => {
      if (stabilityTimerRef.current) {
        clearTimeout(stabilityTimerRef.current);
      }
    };
  }, [controls.motorOn, controls.motorSpeed, controls.valveOpening, currentView]);

  const capturePoint = useCallback(() => {
    if (!isStable || !testConfig) return;

    setCapturedPoints(prev => [...prev, telemetry]);
    
    if (testConfig.points[currentPointIndex]) {
      const updatedPoints = [...testConfig.points];
      updatedPoints[currentPointIndex] = {
        ...updatedPoints[currentPointIndex],
        captured: true,
        capturedData: telemetry,
      };
      setTestConfig({ ...testConfig, points: updatedPoints });
    }

    if (currentPointIndex < testConfig.points.length - 1) {
      setCurrentPointIndex(prev => prev + 1);
      setIsStable(false);
    } else {
      // All points captured, go to analytics
      setCurrentView('analytics');
    }
  }, [isStable, testConfig, telemetry, currentPointIndex]);

  const resetTest = useCallback(() => {
    setCurrentJob(null);
    setTestConfig(null);
    setControls({ motorOn: false, motorSpeed: 50, valveOpening: 50 });
    setTelemetry({ pressure: 0, flow: 0, temperature: 25, power: 0, npsh: 0, timestamp: Date.now() });
    setTelemetryHistory([]);
    setCurrentPointIndex(0);
    setIsStable(false);
    setCapturedPoints([]);
    setCurrentView('dashboard');
  }, []);

  return (
    <TestingContext.Provider
      value={{
        currentView,
        setCurrentView,
        jobs,
        currentJob,
        selectJob,
        testConfig,
        setTestConfig,
        controls,
        setMotorOn,
        setMotorSpeed,
        setValveOpening,
        telemetry,
        telemetryHistory,
        currentPointIndex,
        isStable,
        capturePoint,
        capturedPoints,
        setCapturedPoints,
        resetTest,
      }}
    >
      {children}
    </TestingContext.Provider>
  );
};

export const useTesting = () => {
  const context = useContext(TestingContext);
  if (!context) {
    throw new Error('useTesting must be used within a TestingProvider');
  }
  return context;
};
