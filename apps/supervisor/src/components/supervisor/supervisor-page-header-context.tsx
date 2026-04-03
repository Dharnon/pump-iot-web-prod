"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";

export type SupervisorPageHeaderDensity = "compact" | "relaxed";

export type SupervisorPageHeaderSlots = {
  /** Contenido a la derecha del sidebar trigger y el separador */
  center: ReactNode;
  end?: ReactNode;
  density?: SupervisorPageHeaderDensity;
};

const SupervisorPageHeaderStateContext =
  createContext<SupervisorPageHeaderSlots | null>(null);

const SupervisorPageHeaderDispatchContext = createContext<
  ((next: SupervisorPageHeaderSlots | null) => void) | null
>(null);

export function SupervisorPageHeaderProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [slots, setSlotsState] = useState<SupervisorPageHeaderSlots | null>(
    null,
  );

  const setSlots = useCallback((next: SupervisorPageHeaderSlots | null) => {
    setSlotsState(next);
  }, []);

  return (
    <SupervisorPageHeaderDispatchContext.Provider value={setSlots}>
      <SupervisorPageHeaderStateContext.Provider value={slots}>
        {children}
      </SupervisorPageHeaderStateContext.Provider>
    </SupervisorPageHeaderDispatchContext.Provider>
  );
}

export function useSupervisorPageHeaderContext() {
  const slots = useContext(SupervisorPageHeaderStateContext);
  if (slots === null) {
    return null;
  }

  return slots;
}

function useSupervisorPageHeaderDispatch() {
  const setSlots = useContext(SupervisorPageHeaderDispatchContext);
  if (!setSlots) {
    throw new Error(
      "useSupervisorPageHeaderContext must be used within SupervisorPageHeaderProvider",
    );
  }
  return setSlots;
}

/**
 * Registra el contenido del header global del supervisor. El shell (trigger,
 * separador, borde) vive en el layout y no se desmonta al navegar.
 * Pasa `null` para no mostrar barra (p. ej. vista de carga o vacía).
 */
export function useSupervisorPageHeader(
  slots: SupervisorPageHeaderSlots | null,
) {
  const setSlots = useSupervisorPageHeaderDispatch();

  useLayoutEffect(() => {
    setSlots(slots);
    return () => setSlots(null);
  }, [setSlots, slots]);
}
