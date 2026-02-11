/**
 * useTestDetailPage Hook
 * 
 * Facade hook that combines all test detail functionality.
 * Follows Facade Pattern: Provides a simple interface to complex subsystems.
 * Dependency Inversion: Page depends on this abstraction, not concrete implementations.
 */

import { useState, useEffect, useCallback } from 'react';
import { useTestDetail } from './useTestDetail';
import { usePdfUpload } from './usePdfUpload';
import { usePdfExtraction } from './usePdfExtraction';
import { useTestSave } from './useTestSave';
import { usePdfPanel } from './usePdfPanel';
import { useTestsToPerform } from './useTestsToPerform';
import { getTestPdf } from '@/lib/api';
import type { UseLanguageReturn } from '@/lib/language-context';

export interface UseTestDetailPageResult {
  // Test data
  test: any;
  loading: boolean;
  error: string | null;
  
  // PDF upload
  pdfFile: File | null;
  pdfUrl: string | null;
  isDragging: boolean;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  removePdf: () => void;
  
  // PDF extraction
  extracting: boolean;
  handleAnalyzePdf: () => Promise<void>;
  
  // Test save
  saving: boolean;
  handleSave: () => Promise<void>;
  
  // Panel management
  isPdfExpanded: boolean;
  pdfPanelRef: React.RefObject<any>;
  togglePdf: () => void;
  onPanelResize: (size: any) => void;
  
  // Tests to perform
  testsToPerform: any;
  toggleTest: (key: string) => void;
  
  // Data updates
  handlePdfDataChange: (field: string, value: string) => void;
  
  // Mobile detection
  isMobile: boolean;
}

/**
 * Comprehensive hook for test detail page
 */
export function useTestDetailPage(
  testId: string,
  t: UseLanguageReturn['t']
): UseTestDetailPageResult {
  const [isMobile, setIsMobile] = useState(false);
  
  // Core functionality hooks
  const { test, loading, error, updateTestData, setTest } = useTestDetail(testId);
  const { testsToPerform, toggleTest, autoSetTests } = useTestsToPerform();
  const { saving, saveTest } = useTestSave();
  const { isPdfExpanded, pdfPanelRef, togglePdf, onPanelResize } = usePdfPanel();
  
  // PDF upload hook
  const {
    pdfFile,
    pdfUrl,
    isDragging,
    handleFileUpload,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    removePdf,
    setPdfFile,
    setPdfUrl,
  } = usePdfUpload(t);
  
  // PDF extraction hook with callbacks
  const { extracting, extractPdfData } = usePdfExtraction({
    onExtracted: (specs) => {
      // Update test with extracted data
      setTest(prev => {
        if (!prev) return null;
        return { ...prev, pdfData: specs, status: "EN_PROCESO" };
      });
    },
    onAutoSetTests: autoSetTests,
  });
  
  // Mobile detection effect
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Load PDF for generated protocols
  useEffect(() => {
    if (test?.hasPdf && test?.id) {
      getTestPdf(test.id)
        .then(blob => {
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
        })
        .catch(err => console.error("Error loading PDF preview:", err));
    }
  }, [test?.hasPdf, test?.id, setPdfUrl]);
  
  /**
   * Handles PDF analysis
   */
  const handleAnalyzePdf = useCallback(async () => {
    if (!pdfFile) return;
    await extractPdfData(pdfFile);
  }, [pdfFile, extractPdfData]);
  
  /**
   * Handles test save
   */
  const handleSave = useCallback(async () => {
    if (!test) return;
    await saveTest(test, pdfFile);
  }, [test, pdfFile, saveTest]);
  
  /**
   * Handles PDF data field changes
   */
  const handlePdfDataChange = useCallback((field: string, value: string) => {
    updateTestData(field, value);
  }, [updateTestData]);
  
  return {
    // Test data
    test,
    loading,
    error,
    
    // PDF upload
    pdfFile,
    pdfUrl,
    isDragging,
    handleFileUpload,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    removePdf,
    
    // PDF extraction
    extracting,
    handleAnalyzePdf,
    
    // Test save
    saving,
    handleSave,
    
    // Panel management
    isPdfExpanded,
    pdfPanelRef,
    togglePdf,
    onPanelResize,
    
    // Tests to perform
    testsToPerform,
    toggleTest,
    
    // Data updates
    handlePdfDataChange,
    
    // Mobile
    isMobile,
  };
}
