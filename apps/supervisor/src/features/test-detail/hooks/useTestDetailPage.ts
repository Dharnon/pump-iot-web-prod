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
import { getTestPdf, deleteTest as deleteApi } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { UseLanguageReturn } from '@/lib/language-context';
import type { ViewMode, ViewConfig } from '../types/viewMode';
import { getViewConfig } from '../types/viewMode';

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
  
  // Deletion
  deleting: boolean;
  handleDelete: () => Promise<void>;

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

  // View configuration
  viewConfig: ViewConfig;
}

/**
 * Comprehensive hook for test detail page
 * 
 * @param testId - Test/Protocol ID
 * @param t - Translation function
 * @param viewMode - View mode (PENDING or GENERATED)
 */
export function useTestDetailPage(
  testId: string,
  t: UseLanguageReturn['t'],
  viewMode: ViewMode = 'PENDING'
): UseTestDetailPageResult {
  const [isMobile, setIsMobile] = useState(false);
  const viewConfig = getViewConfig(viewMode);

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
    // Skip PDF loading in mock mode
    if (localStorage.getItem('USE_MOCK_DATA') === 'true') return;

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
    await saveTest(test, pdfFile, viewMode);
  }, [test, pdfFile, saveTest, viewMode]);

  /**
   * Handles deletion
   */
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = useCallback(async () => {
    if (!testId) return;
    
    try {
      setDeleting(true);
      await deleteApi(testId);
      toast.success(viewMode === 'PENDING' ? "Registro eliminado" : "Protocolo eliminado");
      router.push('/supervisor');
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar");
    } finally {
      setDeleting(false);
    }
  }, [testId, router, viewMode]);

  /**
   * Handles PDF data field changes with auto-calculation for water values
   */
  const handlePdfDataChange = useCallback((field: string, value: string) => {
    // First update the field
    updateTestData(field, value);
    
    // Get current pdfData from test
    const pdfData = test?.pdfData || {};
    
    // Auto-calculate water values when fluid values change
    const fluidFields = ['fluidPower', 'fluidEfficiency', 'fluidRpm', 'density', 'ce', 'fluidFlowRate', 'fluidHead'];
    if (fluidFields.includes(field) || field === 'density' || field === 'ce') {
      const density = parseFloat(field === 'density' ? value : pdfData.density) || 1000;
      const fluidPower = parseFloat(field === 'fluidPower' ? value : pdfData.fluidPower) || 0;
      const fluidEfficiency = parseFloat(field === 'fluidEfficiency' ? value : pdfData.fluidEfficiency) || 0;
      const fluidRpm = parseFloat(field === 'fluidRpm' ? value : pdfData.fluidRpm) || 0;
      const ce = parseFloat(field === 'ce' ? value : pdfData.ce) || 1;
      const fluidFlowRate = parseFloat(field === 'fluidFlowRate' ? value : pdfData.fluidFlowRate) || 0;
      const fluidHead = parseFloat(field === 'fluidHead' ? value : pdfData.fluidHead) || 0;
      
      // Calculate water values
      // Potencia agua = Potencia fluido / (densidad / 1000)
      const waterPower = density > 0 ? (fluidPower * 1000 / density).toFixed(2) : '0';
      
      // Eficiencia agua = Eficiencia fluido / CE
      const waterEfficiency = ce > 0 ? (fluidEfficiency / ce).toFixed(2) : '0';
      
      // Velocidad agua = Velocidad fluido
      const waterRpm = fluidRpm.toString();
      
      // Caudal = del fluido
      const flowRate = fluidFlowRate.toString();
      
      // Altura = del fluido
      const head = fluidHead.toString();
      
      // Update water values (only if they haven't been manually edited)
      updateTestData('maxPower', waterPower);
      updateTestData('efficiency', waterEfficiency);
      updateTestData('rpm', waterRpm);
      updateTestData('flowRate', flowRate);
      updateTestData('head', head);
    }
  }, [updateTestData, test]);

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

    // Deletion
    deleting,
    handleDelete,

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

    // View configuration
    viewConfig,
  };
}
