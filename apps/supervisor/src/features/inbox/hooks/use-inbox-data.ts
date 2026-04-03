"use client";

import { useMemo } from "react";

import { useSignalR } from "@/hooks/useSignalR";
import { useTests } from "@/hooks/useTests";
import {
  filterInboxTests,
  getGeneratedTests,
  getGeneratedTestsOnly,
  getInProgressTests,
  getPendingTests,
  type InboxStatusFilter,
  type InboxViewMode,
} from "@/features/inbox/lib/inbox-selectors";

export function useInboxData(
  viewMode: InboxViewMode,
  statusFilter: InboxStatusFilter,
) {
  const { tests, isLoading, isValidating, mutate } = useTests();
  const { locks, connectionState, isConnected } = useSignalR({
    onListUpdated: () => {
      void mutate();
    },
  });

  const pendingTests = useMemo(() => getPendingTests(tests), [tests]);
  const generatedTests = useMemo(() => getGeneratedTests(tests), [tests]);
  const generatedTestsOnly = useMemo(
    () => getGeneratedTestsOnly(generatedTests, locks),
    [generatedTests, locks],
  );
  const inProgressTests = useMemo(
    () => getInProgressTests(generatedTests, locks),
    [generatedTests, locks],
  );
  const enBancoCount = useMemo(
    () => generatedTests.filter((test) => test.status === "EN_BANCO").length,
    [generatedTests],
  );
  const completedCount = useMemo(
    () => generatedTests.filter((test) => test.status === "COMPLETED").length,
    [generatedTests],
  );
  const filteredData = useMemo(
    () =>
      filterInboxTests({
        viewMode,
        statusFilter,
        pendingTests,
        generatedTests,
        locks,
      }),
    [generatedTests, locks, pendingTests, statusFilter, viewMode],
  );

  return {
    tests,
    isLoading,
    isValidating,
    mutate,
    locks,
    connectionState,
    isConnected,
    pendingTests,
    generatedTests,
    generatedTestsOnly,
    inProgressTests,
    enBancoCount,
    completedCount,
    filteredData,
  };
}
