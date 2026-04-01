"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Kanban } from "react-kanban-kit";
import { toast } from "sonner";

import { useTests } from "@/hooks/useTests";
import { SupervisorSiteHeader } from "@/components/supervisor";

const BANKS = ["A", "B", "C", "D", "E"];

interface BoardData {
  root: any;
  [key: string]: any;
}

export default function ProgramacionPage() {
  const { tests, mutate } = useTests();
  const router = useRouter();

  const [boardData] = useMemo(() => {
    const data: BoardData = {
      root: {
        id: "root",
        title: "Bancos",
        children: BANKS.map((bank) => `col-${bank}`),
        totalChildrenCount: BANKS.length,
        parentId: null,
      },
    };

    if (!tests) {
      BANKS.forEach((bank) => {
        data[`col-${bank}`] = {
          id: `col-${bank}`,
          title: `BANCO ${bank}`,
          children: [],
          totalChildrenCount: 0,
          parentId: "root",
          content: { bankId: bank },
        };
      });

      return [data, false];
    }

    const banks: Record<string, any[]> = { A: [], B: [], C: [], D: [], E: [] };

    tests
      .filter(
        (test: any) =>
          !test.id.startsWith("pending-") &&
          (test.status === "EN_BANCO" || test.status === "IN_PROGRESS"),
      )
      .forEach((test: any) => {
        const bank = test.banco || "A";
        if (!banks[bank]) {
          return;
        }

        banks[bank].push({
          id: test.id,
          numeroprotocolo: test.numeroprotocolo || 0,
          cliente: test.cliente || "",
          modelo: test.modelo || "",
          ordenTrabajo: test.ordenTrabajo || "",
          tipoBomba: test.tipoBomba || "",
          status: test.status || "EN_BANCO",
        });
      });

    BANKS.forEach((bank) => {
      const bankTests = banks[bank];
      data[`col-${bank}`] = {
        id: `col-${bank}`,
        title: `BANCO ${bank}`,
        children: bankTests.map((test) => `task-${test.id}`),
        totalChildrenCount: bankTests.length,
        parentId: "root",
        content: { bankId: bank },
      };

      bankTests.forEach((test) => {
        data[`task-${test.id}`] = {
          id: `task-${test.id}`,
          title: `#${test.numeroprotocolo}`,
          parentId: `col-${bank}`,
          children: [],
          totalChildrenCount: 0,
          type: "card",
          content: { ...test },
        };
      });
    });

    return [data, true];
  }, [tests]);

  const handleCardMove = async (move: any) => {
    const { cardId, toColumnId } = move;
    const testId = cardId.replace("task-", "");
    const newBankLetter = toColumnId.replace("col-", "");
    const bankMap: Record<string, number> = { A: 1, B: 2, C: 3, D: 4, E: 5 };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || ""}/api/Tests/${testId}/banco`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bancoId: bankMap[newBankLetter] || 1 }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || "Error al mover");
        return;
      }

      toast.success(`Movido a banco ${newBankLetter}`);
      await mutate();
    } catch {
      toast.error("Error al mover");
    }
  };

  const configMap = {
    card: {
      render: ({ data }: any) => {
        const test = data.content;
        const isCompleted = test?.status === "COMPLETED";
        const isInProgress = test?.status === "IN_PROGRESS";
        const statusDot = isCompleted
          ? "bg-green-500"
          : isInProgress
            ? "bg-blue-500"
            : "bg-amber-500";

        return (
          <div className="block rounded-md border border-slate-200 bg-white p-2.5 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 dark:hover:bg-slate-700/50">
            <div className="mb-1.5 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-1.5 w-1.5 rounded-full ${statusDot}`} />
                <span className="font-mono text-[10px] text-slate-400">
                  #{test?.numeroprotocolo}
                </span>
              </div>
              {isInProgress && (
                <button
                  onClick={(event) => {
                    event.stopPropagation();
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
              <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                {test?.cliente || "-"}
              </p>
              <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                {test?.tipoBomba || test?.modelo || "-"}
              </p>
              {test?.ordenTrabajo && (
                <p className="mt-1 font-mono text-[10px] text-slate-400">
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
    const all = tests?.filter((test: any) => !test.id.startsWith("pending-")) || [];
    return {
      pending: all.filter(
        (test: any) =>
          test.status === "GENERATED" || test.status === "GENERADO",
      ).length,
      inProgress: all.filter((test: any) => test.status === "IN_PROGRESS")
        .length,
      completed: all.filter((test: any) => test.status === "COMPLETED").length,
    };
  }, [tests]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <SupervisorSiteHeader
        title="Programacion"
        description="Distribucion actual de protocolos entre los bancos de prueba."
        breadcrumbs={[{ label: "Programacion" }]}
        actions={
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {stats.pending}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              {stats.inProgress}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              {stats.completed}
            </span>
          </div>
        }
      />

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-3">
        <div className="h-full w-full max-w-[95%]">
          <Kanban
            dataSource={boardData}
            configMap={configMap}
            onCardMove={handleCardMove}
            columnWrapperClassName={() => "h-full min-w-0"}
            columnClassName={() => "h-full min-w-[180px] max-w-[350px] flex-1"}
            columnHeaderClassName={() =>
              "border-b border-slate-200 px-3 py-2 dark:border-slate-700"
            }
            columnListContentClassName={() =>
              "h-[calc(100%-50px)] overflow-y-auto space-y-1.5 p-2"
            }
            cardsGap={6}
            renderColumnHeader={(column: any) => (
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {column.title}
                </span>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-400 dark:bg-slate-800">
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
