"use client";

import { useCallback, useMemo } from "react";
import useSWR from "swr";
import { toast } from "sonner";

import { useSignalR } from "@/hooks/useSignalR";
import { useTests } from "@/hooks/useTests";
import { reorderTests, swrFetcher } from "@/lib/api";
import {
  buildBoardData,
  getColumnBankId,
} from "@/features/programacion/lib/programacion-utils";
import type {
  ProgramacionBank,
  ProgramacionBoardData,
  ProgramacionMove,
} from "@/features/programacion/types";

export function useProgramacionBoard() {
  const { tests, mutate: mutateTests } = useTests();
  const { data: bancos } = useSWR<ProgramacionBank[]>("/api/bancos", swrFetcher);
  const { locks } = useSignalR({
    onListUpdated: () => {
      mutateTests();
    },
  });

  const boardData = useMemo<ProgramacionBoardData>(
    () => buildBoardData(bancos, tests, locks),
    [tests, bancos, locks],
  );

  const handleCardMove = useCallback(
    async (move: ProgramacionMove) => {
      const { cardId, toColumnId, position: toIndex } = move;
      const movingTestIdStr = cardId.replace("task-", "");
      const toBankId = getColumnBankId(boardData[toColumnId]);
      const bankName = boardData[toColumnId]?.title;

      if (!tests || !toBankId) {
        return;
      }

      const currentTargetBankTests = tests
        .filter(
          (t) => t.bancoId === toBankId && t.id.toString() !== movingTestIdStr,
        )
        .sort(
          (a, b) =>
            (a.orden || 0) - (b.orden || 0) ||
            a.id.toString().localeCompare(b.id.toString()),
        );

      const movingTest = tests.find((t) => t.id.toString() === movingTestIdStr);
      if (!movingTest) {
        return;
      }

      const newSequenceInBank = [...currentTargetBankTests];
      newSequenceInBank.splice(toIndex, 0, { ...movingTest, bancoId: toBankId });

      const protocolIdsInOrder = newSequenceInBank.map((t) =>
        parseInt(t.id.toString(), 10),
      );

      const optimisticTests = tests.map((t) => {
        const protocolId = parseInt(t.id.toString(), 10);
        const position = protocolIdsInOrder.indexOf(protocolId);

        if (position !== -1) {
          return {
            ...t,
            bancoId: toBankId,
            orden: position + 1,
            status:
              protocolId === parseInt(movingTestIdStr, 10)
                ? t.status === "IN_PROGRESS"
                  ? "IN_PROGRESS"
                  : "EN_BANCO"
                : t.status,
          };
        }

        return t;
      });

      try {
        mutateTests(optimisticTests, { revalidate: false });
        await reorderTests(protocolIdsInOrder, toBankId);
        mutateTests();
        toast.success(`Movido y reordenado en ${bankName}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Error al mover");
        mutateTests();
      }
    },
    [boardData, tests, mutateTests],
  );

  const stats = useMemo(() => {
    const all = tests?.filter((t) => !t.id.startsWith("pending-")) || [];
    return {
      pending: all.filter(
        (t) => t.status === "GENERATED" || t.status === "GENERADO",
      ).length,
      inProgress: all.filter((t) => t.status === "IN_PROGRESS").length,
      completed: all.filter((t) => t.status === "COMPLETED").length,
    };
  }, [tests]);

  return {
    boardData,
    handleCardMove,
    stats,
  };
}
