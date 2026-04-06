/**
 * usePdfExtraction Hook
 *
 * Manages PDF data extraction using OCR/parsing services.
 * Follows SRP: Single responsibility for PDF analysis.
 */

import { useState, useCallback } from "react";
import { toast } from "sonner";

import type { PdfExtractionSpecs } from "../types/testDetail";

export interface UsePdfExtractionResult {
  extracting: boolean;
  extractPdfData: (file: File) => Promise<PdfExtractionSpecs>;
}

export interface PdfExtractionCallbacks {
  onExtracted?: (specs: PdfExtractionSpecs) => void;
  onAutoSetTests?: (specs: PdfExtractionSpecs) => void;
}

/**
 * Hook to manage PDF extraction functionality
 *
 * @param callbacks - Optional callbacks for extraction events
 * @returns Extraction state and extract function
 */
export function usePdfExtraction(
  callbacks?: PdfExtractionCallbacks,
): UsePdfExtractionResult {
  const [extracting, setExtracting] = useState(false);

  const extractPdfData = useCallback(
    async (file: File): Promise<PdfExtractionSpecs> => {
      setExtracting(true);

      try {
        const { extractSpecsFromPdf } = await import("@/lib/pdfExtractionService");
        const specs = await extractSpecsFromPdf(file);

        if (callbacks?.onExtracted) {
          callbacks.onExtracted(specs);
        }

        if (callbacks?.onAutoSetTests) {
          callbacks.onAutoSetTests(specs);
        }

        toast.success("Datos extraídos correctamente");
        return specs;
      } catch (error: unknown) {
        console.error("PDF extraction error:", error);
        toast.error("Error analyzing PDF. Make sure it contains selectable text.");
        throw error;
      } finally {
        setExtracting(false);
      }
    },
    [callbacks],
  );

  return {
    extracting,
    extractPdfData,
  };
}
