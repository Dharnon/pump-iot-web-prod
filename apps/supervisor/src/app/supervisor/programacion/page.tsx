"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Kanban } from "react-kanban-kit";
import { toast } from "sonner";
import useSWR from "swr";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useSignalR } from "@/hooks/useSignalR";
import { useTests } from "@/hooks/useTests";
import { reorderTests, swrFetcher } from "@/lib/api";

interface BoardData {
  root: any;
  [key: string]: any;
}

export default function ProgramacionPage() {
  const { tests, mutate: mutateTests } = useTests();
  const { data: bancos } = useSWR("/api/bancos", swrFetcher);
  const router = useRouter();

  const { locks } = useSignalR({
    onListUpdated: () => {
      mutateTests();
    },
  });

  const [boardData] = useMemo(() => {
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

    const sortedBancos = [...bancos].sort((a: any, b: any) =>
      (a.nombre || "").localeCompare(b.nombre || "", undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    );

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

    data.root.children = sortedBancos.map((b: any) => `col-${b.id}`);
    data.root.totalChildrenCount = sortedBancos.length;

    if (!tests) return [data, false];

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
    const { cardId, toColumnId, position: toIndex } = move;
    const movingTestIdStr = cardId.replace("task-", "");
    const toBankId = boardData[toColumnId]?.content?.bankId;
    const bankName = boardData[toColumnId]?.title;

    if (!tests || !toBankId) return;

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
    if (!movingTest) return;

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
        } as any;
      }

      return t;
    });

    try {
      mutateTests(optimisticTests, { revalidate: false });
      await reorderTests(protocolIdsInOrder, toBankId);
      mutateTests();
      toast.success(`Movido y reordenado en ${bankName}`);
    } catch (error: any) {
      toast.error(error.message || "Error al mover");
      mutateTests();
    }
  };

  const statPillClass =
    "inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-foreground/85";

  const configMap = {
    card: {
      render: ({ data }: any) => {
        const test = data.content;
        const isCompleted = test?.status === "COMPLETED";
        const isInProgress = test?.status === "IN_PROGRESS";
        const isLocked = test?.isLocked;

        const statusDot = isCompleted
          ? "bg-green-500"
          : isInProgress
            ? "bg-blue-500"
            : "bg-amber-500";

        return (
          <div
            className={`group relative block cursor-move overflow-hidden rounded-xl border p-2.5 transition-all ${
              isLocked
                ? "border-sky-500/80 bg-sky-950/30"
                : "border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-[#2c2e30] dark:bg-[#1d1f20] dark:hover:border-[#35383a] dark:hover:bg-[#202121]"
            }`}
          >
            {isLocked && (
              <div className="absolute left-0 top-0 h-full w-1 bg-sky-400 animate-pulse" />
            )}

            <div className="mb-1.5 flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <div
                  className={`h-1.5 w-1.5 rounded-full ${statusDot} ${
                    isLocked ? "animate-ping" : ""
                  }`}
                />
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-300/70">
                  #{test?.id}
                </span>
                {isLocked && (
                  <span className="truncate rounded-full border border-sky-400/35 bg-sky-400/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-sky-300">
                    Locked ({test.lockedBy})
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
                  className="rounded bg-blue-500 px-1.5 py-0.5 text-[9px] text-white transition-colors hover:bg-blue-600"
                >
                  3D
                </button>
              )}
            </div>

            <div
              onClick={() => router.push(`/supervisor/protocolo/${test?.id}`)}
              className="cursor-pointer"
            >
              <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-50">
                {test?.cliente || "-"}
              </p>
              <p className="truncate text-[11px] text-slate-500 dark:text-slate-300/80">
                {test?.tipoBomba || test?.modelo || "-"}
              </p>
              {test?.ordenTrabajo && (
                <p className="mt-1 text-[10px] font-mono text-slate-500 dark:text-slate-300/65">
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
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
      <header className="flex shrink-0 flex-col gap-3 border-b border-border/80 bg-background/95 px-4 py-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <h1 className="text-sm font-semibold tracking-tight text-foreground">
            Programacion
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground sm:gap-3">
          <span className={statPillClass}>
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Generados
            {stats.pending}
          </span>
          <span className={statPillClass}>
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            En proceso
            {stats.inProgress}
          </span>
          <span className={statPillClass}>
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Completados
            {stats.completed}
          </span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden p-3">
        <div className="programacion-board h-full w-full max-w-none">
          <Kanban
            dataSource={boardData}
            configMap={configMap}
            onCardMove={handleCardMove}
            columnWrapperClassName={() => "h-full min-w-0"}
            columnClassName={() =>
              "h-full min-w-[220px] max-w-[360px] flex-1 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/92 shadow-none backdrop-blur-sm dark:border-[#222425] dark:bg-[#181a1b]"
            }
            columnHeaderClassName={() =>
              "border-b border-slate-200 dark:bg-[#1d1f20] px-3 py-3 dark:border-[#222425]"
            }
            columnListContentClassName={() =>
              "h-[calc(100%-56px)] space-y-2 overflow-y-auto p-2.5 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0)_18%)]"
            }
            cardsGap={6}
            renderColumnHeader={(column: any) => (
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">
                  {column.title}
                </span>
                <span className="rounded-full border border-border/70 bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-500 dark:bg-[#141515] dark:text-slate-300/80">
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
