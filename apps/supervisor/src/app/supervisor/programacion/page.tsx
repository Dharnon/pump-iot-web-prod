"use client";

import { useMemo, useCallback } from "react";
import { Kanban } from "react-kanban-kit";
import { toast } from "sonner";
import { useTests } from "@/hooks/useTests";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
      root: { id: "root", title: "Bancos", children: BANKS.map(b => `col-${b}`), totalChildrenCount: BANKS.length, parentId: null },
    };

    if (!tests) {
      BANKS.forEach(bank => {
        data[`col-${bank}`] = { id: `col-${bank}`, title: `BANCO ${bank}`, children: [], totalChildrenCount: 0, parentId: "root", content: { bankId: bank } };
      });
      return [data, false];
    }

    const banks: Record<string, any[]> = { A: [], B: [], C: [], D: [], E: [] };
    
    // Only show tests that are EN_BANCO or IN_PROGRESS in the kanban
    tests.filter((t: any) => 
      !t.id.startsWith("pending-") && 
      (t.status === "EN_BANCO" || t.status === "IN_PROGRESS")
    ).forEach((test: any) => {
      const bank = test.banco || "A";
      if (banks[bank]) {
        banks[bank].push({
          id: test.id,
          numeroprotocolo: test.numeroprotocolo || 0,
          cliente: test.cliente || "",
          modelo: test.modelo || "",
          ordenTrabajo: test.ordenTrabajo || "",
          tipoBomba: test.tipoBomba || "",
          status: test.status || "EN_BANCO",
        });
      }
    });

    BANKS.forEach(bank => {
      const bankTests = banks[bank];
      data[`col-${bank}`] = {
        id: `col-${bank}`,
        title: `BANCO ${bank}`,
        children: bankTests.map(t => `task-${t.id}`),
        totalChildrenCount: bankTests.length,
        parentId: "root",
        content: { bankId: bank },
      };

      bankTests.forEach(test => {
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
    const newBancoId = bankMap[newBankLetter] || 1;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/Tests/${testId}/banco`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bancoId: newBancoId }),
      });
      
      if (response.ok) {
        toast.success(`Movido a banco ${newBankLetter}`);
        mutate();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al mover');
      }
    } catch (error) {
      toast.error('Error al mover');
    }
  };

  const configMap = {
    card: {
      render: ({ data, index }: any) => {
        const test = data.content;
        const isCompleted = test?.status === "COMPLETED";
        const isInProgress = test?.status === "IN_PROGRESS";
        
        const statusDot = isCompleted ? "bg-green-500" : isInProgress ? "bg-blue-500" : "bg-amber-500";

        return (
          <div
            onClick={() => router.push(`/supervisor/protocolo/${test?.id}`)}
            className="block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md p-2.5 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
              <span className="text-[10px] font-mono text-slate-400">#{test?.numeroprotocolo}</span>
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{test?.cliente || '-'}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{test?.tipoBomba || test?.modelo || '-'}</p>
            {test?.ordenTrabajo && (
              <p className="text-[10px] font-mono text-slate-400 mt-1">OT: {test.ordenTrabajo}</p>
            )}
          </div>
        );
      },
      isDraggable: true,
    },
  };

  const stats = useMemo(() => {
    const all = tests?.filter((t: any) => !t.id.startsWith("pending-")) || [];
    return {
      pending: all.filter((t: any) => t.status === 'GENERATED' || t.status === 'GENERADO').length,
      inProgress: all.filter((t: any) => t.status === 'IN_PROGRESS').length,
      completed: all.filter((t: any) => t.status === 'COMPLETED').length,
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
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />{stats.pending}</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" />{stats.inProgress}</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />{stats.completed}</span>
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
            columnHeaderClassName={() => "px-3 py-2 border-b border-slate-200 dark:border-slate-700"}
            columnListContentClassName={() => "p-2 h-[calc(100%-50px)] overflow-y-auto space-y-1.5"}
            cardsGap={6}
            renderColumnHeader={(column: any) => (
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{column.title}</span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{column.totalChildrenCount}</span>
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
