import { useState, useEffect, useRef, useCallback } from 'react';
import { useTelemetry } from '../contexts/TelemetryProvider';
import { useJob, TelemetryData } from '../contexts/JobProvider';
import { useNavigation } from '../contexts/NavigationProvider';

// =============================================================================
// TYPES
// =============================================================================

interface UseCaptureLogicReturn {
    isStable: boolean;
    capturePoint: () => void;
    currentPointIndex: number;
    capturedPoints: TelemetryData[];
    totalPoints: number;
    isComplete: boolean;
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * useCaptureLogic - Encapsula la lógica de negocio de captura de puntos.
 * 
 * SOLID: Single Responsibility - Solo lógica de captura, sin UI ni navegación directa.
 * Clean Code: Extrae lógica compleja del componente Cockpit a un hook reutilizable.
 * 
 * Este hook:
 * 1. Detecta estabilidad de la bomba (simula 3s de espera)
 * 2. Permite capturar el punto actual de telemetría
 * 3. Avanza al siguiente punto o navega a analytics cuando termina
 */
export const useCaptureLogic = (): UseCaptureLogicReturn => {
    const { telemetry, controls, currentPointIndex, setCurrentPointIndex, capturedPoints, setCapturedPoints } = useTelemetry();
    const { testConfig, setTestConfig } = useJob();
    const { navigateTo } = useNavigation();

    const [isStable, setIsStable] = useState(false);
    const stabilityTimerRef = useRef<NodeJS.Timeout | null>(null);

    const totalPoints = testConfig?.points.length || 0;
    const isComplete = currentPointIndex >= totalPoints && totalPoints > 0;

    // Check stability - simulates 3 seconds of running before stable
    useEffect(() => {
        if (!controls.motorOn) {
            setIsStable(false);
            if (stabilityTimerRef.current) {
                clearTimeout(stabilityTimerRef.current);
            }
            return;
        }

        stabilityTimerRef.current = setTimeout(() => {
            setIsStable(true);
        }, 3000);

        return () => {
            if (stabilityTimerRef.current) {
                clearTimeout(stabilityTimerRef.current);
            }
        };
    }, [controls.motorOn, controls.motorSpeed, controls.valveOpening]);

    // Capture current telemetry point
    const capturePoint = useCallback(() => {
        if (!isStable || !testConfig) return;

        // Add current telemetry to captured points
        setCapturedPoints(prev => [...prev, telemetry]);

        // Update test config with captured data
        if (testConfig.points[currentPointIndex]) {
            const updatedPoints = [...testConfig.points];
            updatedPoints[currentPointIndex] = {
                ...updatedPoints[currentPointIndex],
                captured: true,
                capturedData: telemetry,
            };
            setTestConfig({ ...testConfig, points: updatedPoints });
        }

        // Move to next point or finish
        if (currentPointIndex < testConfig.points.length - 1) {
            setCurrentPointIndex(prev => prev + 1);
            setIsStable(false); // Reset stability for next point
        } else {
            // All points captured, go to analytics
            navigateTo('analytics');
        }
    }, [isStable, testConfig, telemetry, currentPointIndex, setCapturedPoints, setTestConfig, setCurrentPointIndex, navigateTo]);

    return {
        isStable,
        capturePoint,
        currentPointIndex,
        capturedPoints,
        totalPoints,
        isComplete,
    };
};
