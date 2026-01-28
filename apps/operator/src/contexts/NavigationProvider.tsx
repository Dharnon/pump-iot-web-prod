import React, { createContext, useContext, useState, useCallback } from 'react';

// =============================================================================
// TYPES
// =============================================================================

export type AppView = 'dashboard' | 'setup' | 'cockpit' | 'analytics';

interface NavigationContextType {
    currentView: AppView;
    setCurrentView: (view: AppView) => void;
    navigateTo: (view: AppView) => void;
}

// =============================================================================
// CONTEXT
// =============================================================================

const NavigationContext = createContext<NavigationContextType | null>(null);

// =============================================================================
// PROVIDER
// =============================================================================

/**
 * NavigationProvider - Gestiona SOLO la navegación entre vistas.
 * 
 * SOLID: Single Responsibility - Solo navegación, sin telemetría ni jobs.
 * Vercel: rerender-defer-reads - Este contexto solo cambia al navegar,
 *         no afecta a componentes que muestran datos en tiempo real.
 */
export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentView, setCurrentView] = useState<AppView>('dashboard');

    const navigateTo = useCallback((view: AppView) => {
        setCurrentView(view);
    }, []);

    return (
        <NavigationContext.Provider
            value={{
                currentView,
                setCurrentView,
                navigateTo,
            }}
        >
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
