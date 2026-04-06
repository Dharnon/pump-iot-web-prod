/**
 * useTestsToPerform Hook
 *
 * Manages tests to perform state and logic.
 * Follows SRP: Single responsibility for managing test selection.
 */

import { useState, useCallback } from "react";

import type { TestsToPerform } from "@/lib/schemas";
import type { PdfExtractionSpecs } from "../types/testDetail";

export interface UseTestsToPerformResult {
  testsToPerform: TestsToPerform;
  toggleTest: (key: string) => void;
  applyTestsPatch: (patch: Partial<TestsToPerform>) => void;
  setTestsToPerform: React.Dispatch<React.SetStateAction<TestsToPerform>>;
  autoSetTests: (specs: PdfExtractionSpecs) => void;
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
    setTestsToPerform((prev) => ({
      ...prev,
      [key]: !prev[key as keyof TestsToPerform],
    }));
  }, []);

  /**
   * Applies a partial patch to tests without toggle semantics.
   */
  const applyTestsPatch = useCallback((patch: Partial<TestsToPerform>) => {
    const sanitizedPatch = Object.fromEntries(
      Object.entries(patch).filter(([, value]) => value !== undefined),
    ) as Partial<TestsToPerform>;

    if (Object.keys(sanitizedPatch).length === 0) {
      return;
    }

    setTestsToPerform((prev) => ({
      ...prev,
      ...sanitizedPatch,
    }));
  }, []);

  /**
   * Auto-sets tests based on extracted PDF specs
   */
  const autoSetTests = useCallback((specs: PdfExtractionSpecs) => {
    setTestsToPerform((prev) => ({
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
    applyTestsPatch,
    setTestsToPerform,
    autoSetTests,
  };
}
