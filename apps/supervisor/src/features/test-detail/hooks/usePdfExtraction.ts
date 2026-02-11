/**
 * usePdfExtraction Hook
 * 
 * Manages PDF data extraction using OCR/parsing services.
 * Follows SRP: Single responsibility for PDF analysis.
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface UsePdfExtractionResult {
  extracting: boolean;
  extractPdfData: (file: File) => Promise<any>;
}

export interface PdfExtractionCallbacks {
  onExtracted?: (specs: any) => void;
  onAutoSetTests?: (specs: any) => void;
}

/**
 * Hook to manage PDF extraction functionality
 * 
 * @param callbacks - Optional callbacks for extraction events
 * @returns Extraction state and extract function
 */
export function usePdfExtraction(
  callbacks?: PdfExtractionCallbacks
): UsePdfExtractionResult {
  const [extracting, setExtracting] = useState(false);

  const extractPdfData = useCallback(async (file: File) => {
    setExtracting(true);
    
    try {
      // Dynamically import the extraction service to avoid bundle bloat
      const { extractSpecsFromPdf } = await import("@/lib/pdfExtractionService");
      const specs = await extractSpecsFromPdf(file);
      
      console.log("Specs extraídas:", specs);
      
      // Call extraction callback
      if (callbacks?.onExtracted) {
        callbacks.onExtracted(specs);
      }
      
      // Call auto-set tests callback
      if (callbacks?.onAutoSetTests) {
        callbacks.onAutoSetTests(specs);
      }
      
      toast.success("Datos extraídos correctamente");
      return specs;
    } catch (error) {
      console.error("PDF extraction error:", error);
      toast.error("Error analyzing PDF. Make sure it contains selectable text.");
      throw error;
    } finally {
      setExtracting(false);
    }
  }, [callbacks]);

  return {
    extracting,
    extractPdfData,
  };
}

