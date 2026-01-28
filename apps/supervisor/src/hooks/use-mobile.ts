/**
 * =============================================================================
 * HOOK: useIsMobile - Pump IoT Platform
 * =============================================================================
 * 
 * @fileoverview Hook para detectar si el viewport es de tamaño móvil.
 * 
 * FUNCIONAMIENTO:
 * 1. Al montar, verifica el ancho de la ventana
 * 2. Escucha cambios de tamaño via matchMedia
 * 3. Retorna true si ancho < 768px (breakpoint mobile)
 * 
 * USOS COMUNES:
 * - Sidebar: Cambia a Sheet en mobile
 * - Tablas: Ajusta columnas visibles
 * - Layouts: Cambia de horizontal a vertical
 * 
 * COMPARACIÓN CON .NET:
 * - Similar a usar Window.Current.Bounds en UWP
 * - O MediaQuery en Xamarin.Forms
 * - En React, usamos hooks + matchMedia API del browser
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *     const isMobile = useIsMobile();
 *     
 *     return (
 *         <div className={isMobile ? "flex-col" : "flex-row"}>
 *             {isMobile ? <MobileLayout /> : <DesktopLayout />}
 *         </div>
 *     );
 * }
 * ```
 */

import * as React from "react"

// =============================================================================
// CONSTANTES
// =============================================================================

/**
 * Breakpoint para considerar un viewport como "mobile".
 * 768px es el estándar de Tailwind CSS para md: breakpoint.
 * 
 * Viewport < 768px = mobile
 * Viewport >= 768px = desktop/tablet
 */
const MOBILE_BREAKPOINT = 768

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook que retorna true si el viewport actual es de tamaño móvil.
 * 
 * NOTA: Durante SSR/inicial render, retorna false (undefined se convierte a false).
 * Esto evita hydration mismatch entre server y client.
 * 
 * @returns boolean - true si viewport < 768px, false en otro caso
 */
export function useIsMobile() {
  // Estado: undefined inicialmente (SSR-safe), luego boolean
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // =====================================================================
    // SETUP: Media Query
    // =====================================================================
    // matchMedia es la API del browser para CSS media queries en JavaScript.
    // Creamos una query que detecta ancho máximo de 767px (mobile).
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    /**
     * Handler que se ejecuta cuando cambia el resultado de la media query.
     * Actualiza el estado con el valor actual del ancho de ventana.
     */
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // =====================================================================
    // SUBSCRIBE: Escuchar cambios de tamaño
    // =====================================================================
    // Usamos addEventListener en lugar de addListener (deprecated).
    mql.addEventListener("change", onChange)

    // Establecer valor inicial
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

    // =====================================================================
    // CLEANUP: Remover listener al desmontar
    // =====================================================================
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Convertir undefined a false (!! convierte undefined → false)
  return !!isMobile
}
