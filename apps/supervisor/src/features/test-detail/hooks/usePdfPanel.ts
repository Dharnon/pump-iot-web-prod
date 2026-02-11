/**
 * usePdfPanel Hook
 * 
 * Manages PDF panel resize/collapse state.
 * Follows SRP: Single responsibility for panel state.
 */

import { useState, useCallback, useRef } from 'react';

export interface UsePdfPanelResult {
  isPdfExpanded: boolean;
  pdfPanelRef: React.RefObject<any>;
  togglePdf: () => void;
  onPanelResize: (size: any) => void;
}

/**
 * Hook to manage PDF panel state
 */
export function usePdfPanel(): UsePdfPanelResult {
  const [isPdfExpanded, setIsPdfExpanded] = useState(true);
  const pdfPanelRef = useRef<any>(null);

  const togglePdf = useCallback(() => {
    const panel = pdfPanelRef.current;
    if (!panel) {
      console.warn("PDF Panel Ref is still null. Retrying or ignoring.");
      return;
    }
    
    const isCollapsed = panel.isCollapsed();
    console.log("Toggling PDF panel. Current state:", isCollapsed ? "collapsed" : "expanded");
    
    if (isCollapsed) {
      panel.expand(45);
      setIsPdfExpanded(true);
    } else {
      panel.collapse();
      setIsPdfExpanded(false);
    }
  }, []);

  const onPanelResize = useCallback((size: any) => {
    const percentage = typeof size === 'number' ? size : size?.asPercentage;
    if (percentage > 0 && !isPdfExpanded) setIsPdfExpanded(true);
    if (percentage === 0 && isPdfExpanded) setIsPdfExpanded(false);
  }, [isPdfExpanded]);

  return {
    isPdfExpanded,
    pdfPanelRef,
    togglePdf,
    onPanelResize,
  };
}
