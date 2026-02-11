/**
 * useTestsToPerform Hook
 * 
 * Manages tests to perform state and logic.
 * Follows SRP: Single responsibility for managing test selection.
 */

import { useState, useCallback } from 'react';
import type { TestsToPerform } from '@/lib/schemas';

export interface UseTestsToPerformResult {
  testsToPerform: TestsToPerform;
  toggleTest: (key: string) => void;
  setTestsToPerform: React.Dispatch<React.SetStateAction<TestsToPerform>>;
  autoSetTests: (specs: any) => void;
}

/**
 * Hook to manage tests to perform selection
 * 
 * @returns Tests state and manipulation functions
 */
export function useTestsToPerform(): UseTestsToPerformResult {
  const [testsToPerform, setTestsToPerform] = useState<TestsToPerform>({});

  /**
   * Toggles a specific test on/off
   */
  const toggleTest = useCallback((key: string) => {
    setTestsToPerform(prev => ({
      ...prev,
      [key]: !prev[key as keyof TestsToPerform]
    }));
  }, []);

  /**
   * Auto-sets tests based on extracted PDF specs
   */
  const autoSetTests = useCallback((specs: any) => {
    setTestsToPerform(prev => ({
      ...prev,
      performanceTest: true,
      vibraciones: true,
      npsh: !!specs.npshr,
      mrt1h: specs.rpm ? specs.rpm > 2000 : false,
    }));
  }, []);

  return {
    testsToPerform,
    toggleTest,
    setTestsToPerform,
    autoSetTests,
  };
}
