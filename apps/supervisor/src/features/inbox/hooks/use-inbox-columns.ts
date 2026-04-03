"use client";

import { useMemo } from "react";

import type { Locks } from "@/hooks/useSignalR";
import { getPendingColumns } from "@/features/inbox/table/pending-columns";
import { getProtocolColumns } from "@/features/inbox/table/protocol-columns";

export function useInboxColumns({
  t,
  onDelete,
  locks,
}: {
  t: (key: string) => string;
  onDelete: (id: string) => Promise<void>;
  locks: Locks;
}) {
  const pendingColumns = useMemo(
    () => getPendingColumns(t, onDelete, locks),
    [locks, onDelete, t],
  );

  const protocolColumns = useMemo(
    () => getProtocolColumns(t, onDelete, undefined, undefined, locks),
    [locks, onDelete, t],
  );

  return {
    pendingColumns,
    protocolColumns,
  };
}
