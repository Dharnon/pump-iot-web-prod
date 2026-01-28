import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { TelemetryData, TestConfig, TestPoint } from './JobProvider';

// =============================================================================
// TYPES
// =============================================================================

export interface ControlState {
    motorOn: boolean;
    motorSpeed: number;
    valveOpening: number;
}

interface TelemetryContextType {
    // Real-time data
    telemetry: TelemetryData;
    telemetryHistory: TelemetryData[];

    // Controls
    controls: ControlState;
    setMotorOn: (on: boolean) => void;
    setMotorSpeed: (speed: number) => void;
    setValveOpening: (opening: number) => void;

    // Capture state
    currentPointIndex: number;
    setCurrentPointIndex: React.Dispatch<React.SetStateAction<number>>;
    capturedPoints: TelemetryData[];
    setCapturedPoints: React.Dispatch<React.SetStateAction<TelemetryData[]>>;

    // Reset
    resetTelemetry: () => void;
}

// =============================================================================
// CONTEXT
// =============================================================================

const TelemetryContext = createContext<TelemetryContextType | null>(null);

// =============================================================================
// PROVIDER
// =============================================================================

/**
 * TelemetryProvider - Gestiona SOLO datos de telemetría en tiempo real.
 * 
 * SOLID: Single Responsibility - Solo telemetría y controles de hardware.
 * Vercel: rerender-memo - Solo los componentes que MUESTRAN telemetría
 *         se suscriben a este contexto. El Dashboard no se re-renderiza.
 * 
 * IMPORTANTE: Este provider actualiza cada 500ms. Está aislado para evitar
 * que toda la aplicación se re-renderice con cada tick de telemetría.
 */
export const TelemetryProvider: React.FC<{
    children: React.ReactNode;
    isActive: boolean;  // Solo simula telemetría cuando está activo (cockpit view)
    testConfig: TestConfig | null;
}> = ({ children, isActive, testConfig }) => {
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
    const [capturedPoints, setCapturedPoints] = useState<TelemetryData[]>([]);

    const telemetryIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Control setters
    const setMotorOn = useCallback((on: boolean) => {
        setControls(prev => ({ ...prev, motorOn: on }));
    }, []);

    const setMotorSpeed = useCallback((speed: number) => {
        setControls(prev => ({ ...prev, motorSpeed: speed }));
    }, []);

    const setValveOpening = useCallback((opening: number) => {
        setControls(prev => ({ ...prev, valveOpening: opening }));
    }, []);

    // Reset function
    const resetTelemetry = useCallback(() => {
        setControls({ motorOn: false, motorSpeed: 50, valveOpening: 50 });
        setTelemetry({ pressure: 0, flow: 0, temperature: 25, power: 0, npsh: 0, timestamp: Date.now() });
        setTelemetryHistory([]);
        setCurrentPointIndex(0);
        setCapturedPoints([]);
    }, []);

    // Simulate telemetry data (only when active and motor is on)
    useEffect(() => {
        if (!isActive || !controls.motorOn) {
            if (telemetryIntervalRef.current) {
                clearInterval(telemetryIntervalRef.current);
                telemetryIntervalRef.current = null;
            }
            return;
        }

        telemetryIntervalRef.current = setInterval(() => {
            const targetFlow = testConfig?.points[currentPointIndex]?.targetFlow || 0;
            const speedFactor = controls.motorSpeed / 100;
            const valveFactor = controls.valveOpening / 100;

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
    }, [isActive, controls.motorOn, controls.motorSpeed, controls.valveOpening, testConfig, currentPointIndex]);

    return (
        <TelemetryContext.Provider
            value={{
                telemetry,
                telemetryHistory,
                controls,
                setMotorOn,
                setMotorSpeed,
                setValveOpening,
                currentPointIndex,
                setCurrentPointIndex,
                capturedPoints,
                setCapturedPoints,
                resetTelemetry,
            }}
        >
            {children}
        </TelemetryContext.Provider>
    );
};

// =============================================================================
// HOOK
// =============================================================================

export const useTelemetry = () => {
    const context = useContext(TelemetryContext);
    if (!context) {
        throw new Error('useTelemetry must be used within a TelemetryProvider');
    }
    return context;
};
