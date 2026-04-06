"use client";

import { useMemo, type ComponentProps } from "react";
import { useRouter } from "next/navigation";
import { Kanban } from "react-kanban-kit";
import type { BoardItem } from "react-kanban-kit";

import { useSupervisorPageHeader } from "@/components/supervisor/supervisor-page-header-context";
import { useProgramacionBoard } from "@/features/programacion/hooks/use-programacion-board";
import type {
  ProgramacionBoardNode,
  ProgramacionCardContent,
} from "@/features/programacion/types";

export function ProgramacionPage() {
  const { boardData, handleCardMove } = useProgramacionBoard();
  const router = useRouter();

  type KanbanConfigMap = NonNullable<ComponentProps<typeof Kanban>["configMap"]>;

  const configMap: KanbanConfigMap = {
    card: {
      render: ({ data }: { data: BoardItem }) => {
        const boardItem = data as ProgramacionBoardNode;
        const test = boardItem.content as ProgramacionCardContent | undefined;
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
              <div className="absolute left-0 top-0 h-full w-1 animate-pulse bg-sky-400" />
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
                {test?.tipoBomba || "-"}
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

  const programacionHeader = useMemo(
    () => ({
      density: "relaxed" as const,
      center: (
        <h1 className="text-sm font-semibold tracking-tight text-foreground">
          Programacion
        </h1>
      ),
    }),
    [],
  );

  useSupervisorPageHeader(programacionHeader);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[var(--supervisor-page-background)]">
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
              "border-b border-slate-200 px-3 py-3 dark:border-[#222425] dark:bg-[#1d1f20]"
            }
            columnListContentClassName={() =>
              "h-[calc(100%-56px)] space-y-2 overflow-y-auto p-2.5 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0)_18%)]"
            }
            cardsGap={6}
            renderColumnHeader={(column: BoardItem) => (
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

