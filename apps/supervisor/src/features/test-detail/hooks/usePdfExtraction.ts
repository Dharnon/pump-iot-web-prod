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

/**
 * Hook to manage PDF extraction functionality
 * 
 * @param onExtracted - Callback when extraction completes successfully
 * @returns Extraction state and extract function
 */
export function usePdfExtraction(
  onExtracted?: (specs: any) => void
): UsePdfExtractionResult {
  const [extracting, setExtracting] = useState(false);

  const extractPdfData = useCallback(async (file: File) => {
    setExtracting(true);
    
    try {
      // Dynamically import the extraction service to avoid bundle bloat
      const { extractSpecsFromPdf } = await import("@/lib/pdfExtractionService");
      const specs = await extractSpecsFromPdf(file);
      
      console.log("Specs extraídas:", specs);
      
      if (onExtracted) {
        onExtracted(specs);
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
  }, [onExtracted]);

  return {
    extracting,
    extractPdfData,
  };
}
