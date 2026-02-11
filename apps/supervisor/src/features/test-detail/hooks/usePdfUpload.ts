/**
 * usePdfUpload Hook
 * 
 * Manages PDF file upload, preview, and drag-and-drop functionality.
 * Follows SRP: Single responsibility for PDF file handling.
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { UseLanguageReturn } from '@/lib/language-context';

export interface UsePdfUploadResult {
  pdfFile: File | null;
  pdfUrl: string | null;
  isDragging: boolean;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  removePdf: () => void;
  setPdfFile: (file: File | null) => void;
  setPdfUrl: (url: string | null) => void;
}

/**
 * Hook to manage PDF upload functionality
 * 
 * @param t - Translation function from language context
 * @returns PDF upload state and handlers
 */
export function usePdfUpload(t: UseLanguageReturn['t']): UsePdfUploadResult {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setPdfUrl(URL.createObjectURL(file));
      toast.info(t("test.upload.desc"));
    } else if (file) {
      toast.error("Por favor sube un archivo PDF válido");
    }
  }, [t]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setPdfUrl(URL.createObjectURL(file));
      toast.info(t("test.upload.desc"));
    } else if (file) {
      toast.error("Por favor sube un archivo PDF válido");
    }
  }, [t]);

  const removePdf = useCallback(() => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setPdfFile(null);
    setPdfUrl(null);
  }, [pdfUrl]);

  return {
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
  };
}
