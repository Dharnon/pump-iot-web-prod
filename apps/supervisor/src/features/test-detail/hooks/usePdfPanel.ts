/**
 * usePdfPanel Hook
 *
 * Manages the optional source preview panel state.
 */

import { useState, useCallback, useRef } from "react";

type PanelResizeArg = number | { asPercentage?: number };

export interface UsePdfPanelResult {
  isPdfExpanded: boolean;
  pdfPanelRef: React.RefObject<null>;
  togglePdf: () => void;
  onPanelResize: (_size: PanelResizeArg) => void;
}

export function usePdfPanel(): UsePdfPanelResult {
  const [isPdfExpanded, setIsPdfExpanded] = useState(false);
  const pdfPanelRef = useRef<null>(null);

  const togglePdf = useCallback(() => {
    setIsPdfExpanded((current) => !current);
  }, []);

  const onPanelResize = useCallback((size: PanelResizeArg) => {
    void size;
    return;
  }, []);

  return {
    isPdfExpanded,
    pdfPanelRef,
    togglePdf,
    onPanelResize,
  };
}
