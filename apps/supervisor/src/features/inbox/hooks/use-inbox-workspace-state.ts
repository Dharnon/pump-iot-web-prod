"use client";

import { useEffect, useState } from "react";

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

export function useInboxWorkspaceState() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<InboxStatusFilter>("PENDING");
  const [viewMode, setViewMode] = useState<InboxViewMode>("pending");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const savedViewMode = localStorage.getItem(
      STORAGE_KEYS.viewMode,
    ) as InboxViewMode | null;
    const savedStatusFilter = localStorage.getItem(
      STORAGE_KEYS.statusFilter,
    ) as InboxStatusFilter | null;

    if (savedViewMode && VALID_VIEW_MODES.includes(savedViewMode)) {
      setViewMode(savedViewMode);
    }

    if (savedStatusFilter) {
      setStatusFilter(savedStatusFilter);
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    localStorage.setItem(STORAGE_KEYS.viewMode, viewMode);
    localStorage.setItem(STORAGE_KEYS.statusFilter, statusFilter);
  }, [isReady, statusFilter, viewMode]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (
      viewMode === "pending" &&
      statusFilter !== "PENDING" &&
      statusFilter !== "all"
    ) {
      setStatusFilter("PENDING");
    }

    if (
      (viewMode === "protocols" ||
        viewMode === "en_banco" ||
        viewMode === "completed") &&
      statusFilter === "PENDING"
    ) {
      setStatusFilter("all");
    }
  }, [isReady, statusFilter, viewMode]);

  return {
    globalFilter,
    setGlobalFilter,
    statusFilter,
    setStatusFilter,
    viewMode,
    setViewMode,
  };
}
