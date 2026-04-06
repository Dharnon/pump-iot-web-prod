"use client";

import { useCallback, useEffect, useState } from "react";

import type {
  InboxStatusFilter,
  InboxViewMode,
} from "@/features/inbox/lib/inbox-selectors";

const VALID_VIEW_MODES: InboxViewMode[] = [
  "pending",
  "protocols",
  "en_banco",
  "completed",
];

const STORAGE_KEYS = {
  viewMode: "dashboardViewMode",
  statusFilter: "dashboardStatusFilter",
} as const;

function normalizeStatusFilter(
  nextViewMode: InboxViewMode,
  currentStatus: InboxStatusFilter,
): InboxStatusFilter {
  if (
    nextViewMode === "pending" &&
    currentStatus !== "PENDING" &&
    currentStatus !== "all"
  ) {
    return "PENDING";
  }

  if (
    (nextViewMode === "protocols" ||
      nextViewMode === "en_banco" ||
      nextViewMode === "completed") &&
    currentStatus === "PENDING"
  ) {
    return "all";
  }

  return currentStatus;
}

export function useInboxWorkspaceState() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [viewMode, setViewModeState] = useState<InboxViewMode>(() => {
    if (typeof window === "undefined") {
      return "pending";
    }
    const savedViewMode = localStorage.getItem(
      STORAGE_KEYS.viewMode,
    ) as InboxViewMode | null;
    return savedViewMode && VALID_VIEW_MODES.includes(savedViewMode)
      ? savedViewMode
      : "pending";
  });
  const [statusFilter, setStatusFilterState] = useState<InboxStatusFilter>(() => {
    if (typeof window === "undefined") {
      return "PENDING";
    }
    const savedStatusFilter = localStorage.getItem(
      STORAGE_KEYS.statusFilter,
    ) as InboxStatusFilter | null;
    const initialStatus = savedStatusFilter ?? "PENDING";
    const savedViewMode = localStorage.getItem(
      STORAGE_KEYS.viewMode,
    ) as InboxViewMode | null;
    const initialViewMode =
      savedViewMode && VALID_VIEW_MODES.includes(savedViewMode)
        ? savedViewMode
        : "pending";
    return normalizeStatusFilter(initialViewMode, initialStatus);
  });

  const setViewMode = useCallback((nextViewMode: InboxViewMode) => {
    setViewModeState(nextViewMode);
    setStatusFilterState((current) =>
      normalizeStatusFilter(nextViewMode, current),
    );
  }, []);

  const setStatusFilter = useCallback((nextStatus: InboxStatusFilter) => {
    setStatusFilterState(normalizeStatusFilter(viewMode, nextStatus));
  }, [viewMode]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem(STORAGE_KEYS.viewMode, viewMode);
    localStorage.setItem(STORAGE_KEYS.statusFilter, statusFilter);
  }, [statusFilter, viewMode]);

  return {
    globalFilter,
    setGlobalFilter,
    statusFilter,
    setStatusFilter,
    viewMode,
    setViewMode,
  };
}
