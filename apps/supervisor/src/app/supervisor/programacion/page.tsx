"use client";

import { useMemo, useCallback } from "react";
import { Kanban } from "react-kanban-kit";
import { toast } from "sonner";
import useSWR from "swr";
import { useTests } from "@/hooks/useTests";
import { getBancos, patchTest, reorderTests, swrFetcher } from "@/lib/api";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

import { useSignalR } from "@/hooks/useSignalR";

interface BoardData {
  root: any;
  [key: string]: any;
}

export default function ProgramacionPage() {
  const { tests, mutate: mutateTests } = useTests();
  const { data: bancos } = useSWR("/api/bancos", swrFetcher);
  const router = useRouter();

  // Integrated SignalR for real-time updates and locks
  const { locks } = useSignalR({
    onListUpdated: () => {
      console.log("[SignalR] List updated, refreshing tests...");
      mutateTests();
    },
  });

  const [boardData, isLoaded] = useMemo(() => {
    const data: BoardData = {
      root: {
        id: "root",
        title: "Bancos",
        children: [],
        totalChildrenCount: 0,
        parentId: null,
      },
    };

    if (!bancos) return [data, false];

    // Sort banks by name to ensure A, B, C... order regardless of ID
    const sortedBancos = [...bancos].sort((a: any, b: any) =>
      (a.nombre || "").localeCompare(b.nombre || "", undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    );

    // Initialize columns for each active bank
    sortedBancos.forEach((bank: any) => {
      data[`col-${bank.id}`] = {
        id: `col-${bank.id}`,
        title: bank.nombre,
        children: [],
        totalChildrenCount: 0,
        parentId: "root",
        content: { bankId: bank.id },
      };
    });

    // Update root children with sorted IDs
    data.root.children = sortedBancos.map((b: any) => `col-${b.id}`);
    data.root.totalChildrenCount = sortedBancos.length;

    if (!tests) return [data, false];

    // Filter and Sort tests by "orden" before adding to columns
    const kanbanTests = tests
      .filter(
        (t: any) =>
          !t.id.toString().startsWith("pending-") &&
          (t.status === "EN_BANCO" || t.status === "IN_PROGRESS"),
      )
      .sort(
        (a, b) =>
          (a.orden || 0) - (b.orden || 0) ||
          a.id.toString().localeCompare(b.id.toString()),
      );

    kanbanTests.forEach((test: any) => {
      const bankId = test.bancoId;
      if (bankId && data[`col-${bankId}`]) {
        const bankCol = data[`col-${bankId}`];
        const taskId = `task-${test.id}`;

        bankCol.children.push(taskId);
        bankCol.totalChildrenCount++;

        data[taskId] = {
          id: taskId,
          title: `#${test.id}`,
          parentId: `col-${bankId}`,
          children: [],
          totalChildrenCount: 0,
          type: "card",
          content: {
            ...test,
            cliente: test.generalInfo?.cliente || test.cliente,
            tipoBomba: test.generalInfo?.modeloBomba || test.tipoBomba,
            ordenTrabajo: test.generalInfo?.ordenTrabajo || test.ordenTrabajo,
            isLocked: !!locks[test.id],
            lockedBy: locks[test.id],
          },
        };
      }
    });

    return [data, true];
  }, [tests, bancos, locks]);

  const handleCardMove = async (move: any) => {
    // react-kanban-kit provides: cardId, fromColumnId, toColumnId, position, taskAbove, taskBelow
    const {
      cardId,
      toColumnId,
      position: toIndex,
      taskAbove,
      taskBelow,
    } = move;
    const movingTestIdStr = cardId.replace("task-", "");
    const toBankId = boardData[toColumnId]?.content?.bankId;
    const bankName = boardData[toColumnId]?.title;

    if (!tests || !toBankId) return;

    console.log(
      `[Kanban] Dropping Card ${movingTestIdStr} into Bank ${toBankId} at pos=${toIndex} (above=${taskAbove}, below=${taskBelow})`,
    );

    // 1. Get tests currently in target bank (sorted by order)
    const currentTargetBankTests = tests
      .filter(
        (t) => t.bancoId === toBankId && t.id.toString() !== movingTestIdStr,
      )
      .sort(
        (a, b) =>
          (a.orden || 0) - (b.orden || 0) ||
          a.id.toString().localeCompare(b.id.toString()),
      );

    // 2. Find the moving test object
    const movingTest = tests.find((t) => t.id.toString() === movingTestIdStr);
    if (!movingTest) return;

    // 3. Insert into the target sequence at the PRECISE index where the placeholder was
    const newSequenceInBank = [...currentTargetBankTests];
    newSequenceInBank.splice(toIndex, 0, { ...movingTest, bancoId: toBankId });

    const protocolIdsInOrder = newSequenceInBank.map((t) =>
      parseInt(t.id.toString()),
    );

    // 4. Create OPTIMISTIC state for all tests
    const optimisticTests = tests.map((t) => {
      const pIdInt = parseInt(t.id.toString());
      const pos = protocolIdsInOrder.indexOf(pIdInt);

      if (pos !== -1) {
        // This test is now in the destination sequence
        return {
          ...t,
          bancoId: toBankId,
          orden: pos + 1,
          status:
            pIdInt === parseInt(movingTestIdStr)
              ? t.status === "IN_PROGRESS"
                ? "IN_PROGRESS"
                : "EN_BANCO"
              : t.status,
        } as any;
      }
      return t;
    });

    try {
      // 5. Update UI instantly
      mutateTests(optimisticTests, { revalidate: false });

      // 6. Persist to API
      await reorderTests(protocolIdsInOrder, toBankId);

      // 5. Final sync and toast
      mutateTests();
      toast.success(`Movido y reordenado en ${bankName}`);
    } catch (error: any) {
      toast.error(error.message || "Error al mover");
      mutateTests(); // Rollback
    }
  };

  const configMap = {
    card: {
      render: ({ data, index }: any) => {
        const test = data.content;
        const isCompleted = test?.status === "COMPLETED";
        const isInProgress = test?.status === "IN_PROGRESS";
        const isEnBanco = test?.status === "EN_BANCO";
        const isLocked = test?.isLocked;

        const statusDot = isCompleted
          ? "bg-green-500"
          : isInProgress
            ? "bg-blue-500"
            : "bg-amber-500";

        return (
          <div
            className={`block bg-white dark:bg-slate-800 border ${isLocked ? "border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "border-slate-200 dark:border-slate-700"} rounded-md p-2.5 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all cursor-move relative overflow-hidden`}
          >
            {isLocked && (
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 animate-pulse" />
            )}
            <div className="flex items-start justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${statusDot} ${isLocked ? "animate-ping" : ""}`}
                />
                <span className="text-[10px] font-mono text-slate-400">
                  #{test?.id}
                </span>
                {isLocked && (
                  <span className="text-[9px] font-medium text-blue-500 animate-pulse">
                    LOCKED ({test.lockedBy})
                  </span>
                )}
              </div>
              {isInProgress && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(
                      `/supervisor/3d/${test?.id}`,
                      "_blank",
                      "width=1200,height=800",
                    );
                  }}
                  className="text-[9px] px-1.5 py-0.5 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                >
                  3D
                </button>
              )}
            </div>
            <div
              onClick={() => router.push(`/supervisor/protocolo/${test?.id}`)}
              className="cursor-pointer"
            >
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                {test?.cliente || "-"}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {test?.tipoBomba || test?.modelo || "-"}
              </p>
              {test?.ordenTrabajo && (
                <p className="text-[10px] font-mono text-slate-400 mt-1">
                  OT: {test.ordenTrabajo}
                </p>
              )}
            </div>
          </div>
        );
      },
      isDraggable: true,
    },
  };

  const stats = useMemo(() => {
    const all = tests?.filter((t: any) => !t.id.startsWith("pending-")) || [];
    return {
      pending: all.filter(
        (t: any) => t.status === "GENERATED" || t.status === "GENERADO",
      ).length,
      inProgress: all.filter((t: any) => t.status === "IN_PROGRESS").length,
      completed: all.filter((t: any) => t.status === "COMPLETED").length,
    };
  }, [tests]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <header className="flex items-center justify-between px-4 py-3 border-b shrink-0">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <h1 className="text-sm font-medium text-foreground">Programación</h1>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {stats.pending}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            {stats.inProgress}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            {stats.completed}
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-hidden p-3 min-h-0 flex items-center justify-center">
        <div className="h-full w-full max-w-[95%]">
          <Kanban
            dataSource={boardData}
            configMap={configMap}
            onCardMove={handleCardMove}
            columnWrapperClassName={() => "h-full min-w-0"}
            columnClassName={() => "h-full min-w-[180px] flex-1 max-w-[350px]"}
            columnHeaderClassName={() =>
              "px-3 py-2 border-b border-slate-200 dark:border-slate-700"
            }
            columnListContentClassName={() =>
              "p-2 h-[calc(100%-50px)] overflow-y-auto space-y-1.5"
            }
            cardsGap={6}
            renderColumnHeader={(column: any) => (
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {column.title}
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  {column.totalChildrenCount}
                </span>
              </div>
            )}
            renderColumnFooter={() => null}
            allowColumnAdder={false}
            renderListFooter={() => null}
            allowListFooter={() => false}
          />
        </div>
      </div>
    </div>
  );
}
