"use client";

import { useMemo, type ComponentProps } from "react";
import { useRouter } from "next/navigation";
import { Kanban } from "react-kanban-kit";
import type { BoardItem } from "react-kanban-kit";

import { useSupervisorPageHeader } from "@/components/supervisor/supervisor-page-header-context";
import { useProgramacionBoard } from "@/features/programacion/hooks/use-programacion-board";
import { cn } from "@/lib/utils";
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
            className={cn(
              "group relative block cursor-move overflow-hidden rounded-xl border p-2.5 transition-colors",
              isLocked
                ? "border-sky-500/50 bg-sky-500/[0.07] hover:border-sky-500/65 hover:bg-sky-500/[0.11] dark:border-sky-500/40 dark:bg-sky-950/40 dark:hover:border-sky-400/45 dark:hover:bg-sky-950/55"
                : "border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-[#2c2e30] dark:bg-[#1d1f20] dark:hover:border-[#35383a] dark:hover:bg-[#202121]",
            )}
          >
            {isLocked && (
              <div className="absolute left-0 top-0 h-full w-1 animate-pulse bg-sky-600 dark:bg-sky-400" />
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
                  <span className="truncate rounded-full border border-sky-600/25 bg-sky-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-sky-900 dark:border-sky-400/35 dark:bg-sky-400/10 dark:text-sky-200">
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
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-[var(--supervisor-page-background)] text-foreground">
      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden p-2 sm:p-3 md:p-4">
        <div className="programacion-board h-full min-h-0 w-full min-w-0 max-w-none">
          <Kanban
            dataSource={boardData}
            configMap={configMap}
            onCardMove={handleCardMove}
            rootClassName="flex h-full min-h-0 w-full min-w-0 gap-2 overflow-x-auto overflow-y-hidden pb-0.5 sm:gap-3"
            columnWrapperClassName={() =>
              "h-full min-h-0 min-w-[260px] shrink-0 md:min-w-0 md:flex-1 md:basis-0"
            }
            columnClassName={() =>
              "h-full min-h-0 w-full overflow-hidden rounded-2xl border border-border bg-card/95 shadow-none backdrop-blur-sm"
            }
            columnHeaderClassName={() =>
              "border-b border-border bg-muted/50 px-3 py-3 dark:bg-card/80"
            }
            columnListContentClassName={() =>
              "h-[calc(100%-56px)] space-y-2 overflow-y-auto bg-transparent p-2.5 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,transparent_22%)]"
            }
            cardsGap={6}
            renderColumnHeader={(column: BoardItem) => (
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold tracking-tight text-foreground">
                  {column.title}
                </span>
                <span className="rounded-full border border-border/70 bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
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

