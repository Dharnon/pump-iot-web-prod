/**
 * =============================================================================
 * NAVIGATION CONTEXT - Pump IoT Operator
 * =============================================================================
 * 
 * Single Responsibility: Gestiona SOLO la navegación entre vistas de la app.
 * 
 * Siguiendo SOLID - SRP: Este contexto no sabe nada de Jobs, Telemetría o 
 * configuración de tests. Solo maneja en qué pantalla está el usuario.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

// =============================================================================
// TYPES
// =============================================================================

export type AppView = 'dashboard' | 'setup' | 'cockpit' | 'analytics';

interface NavigationContextType {
    currentView: AppView;
    navigateTo: (view: AppView) => void;
    goBack: () => void;
}

// =============================================================================
// CONTEXT
// =============================================================================

const NavigationContext = createContext<NavigationContextType | null>(null);

// =============================================================================
// PROVIDER
// =============================================================================

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentView, setCurrentView] = useState<AppView>('dashboard');
    const [history, setHistory] = useState<AppView[]>(['dashboard']);

    const navigateTo = useCallback((view: AppView) => {
        setCurrentView(view);
        setHistory(prev => [...prev, view]);
    }, []);

    const goBack = useCallback(() => {
        if (history.length > 1) {
            const newHistory = history.slice(0, -1);
            setHistory(newHistory);
            setCurrentView(newHistory[newHistory.length - 1]);
        }
    }, [history]);

    return (
        <NavigationContext.Provider value={{ currentView, navigateTo, goBack }}>
            {children}
        </NavigationContext.Provider>
    );
};

// =============================================================================
// HOOK
// =============================================================================

export const useNavigation = () => {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
};
