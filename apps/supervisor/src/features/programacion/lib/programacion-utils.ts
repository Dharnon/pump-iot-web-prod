import type {
  ProgramacionBank,
  ProgramacionBoardData,
  ProgramacionBoardNode,
  ProgramacionCardContent,
} from "../types";
import type { Test } from "@/lib/api";

export function sortBanks(banks: ProgramacionBank[]) {
  return [...banks].sort((a, b) =>
    a.nombre.localeCompare(b.nombre, undefined, {
      numeric: true,
      sensitivity: "base",
    }),
  );
}

export function sortProgramacionTests(tests: Test[]) {
  return [...tests]
    .filter((test) => !test.id.toString().startsWith("pending-"))
    .filter((test) => test.status === "EN_BANCO" || test.status === "IN_PROGRESS")
    .sort(
      (a, b) =>
        (a.orden || 0) - (b.orden || 0) ||
        a.id.toString().localeCompare(b.id.toString()),
    );
}

export function createBoardRoot(): ProgramacionBoardNode {
  return {
    id: "root",
    title: "Bancos",
    children: [],
    totalChildrenCount: 0,
    parentId: null,
  };
}

export function buildBoardData(
  banks: ProgramacionBank[] | undefined,
  tests: Test[] | undefined,
  locks: Record<string, string>,
): ProgramacionBoardData {
  const data: ProgramacionBoardData = {
    root: createBoardRoot(),
  };

  if (!banks) {
    return data;
  }

  const sortedBanks = sortBanks(banks);

  sortedBanks.forEach((bank) => {
    data[`col-${bank.id}`] = {
      id: `col-${bank.id}`,
      title: bank.nombre,
      children: [],
      totalChildrenCount: 0,
      parentId: "root",
      content: { bankId: bank.id },
    };
  });

  data.root.children = sortedBanks.map((bank) => `col-${bank.id}`);
  data.root.totalChildrenCount = sortedBanks.length;

  if (!tests) {
    return data;
  }

  const kanbanTests = sortProgramacionTests(tests);

  kanbanTests.forEach((test) => {
    const bankId = test.bancoId;
    if (bankId && data[`col-${bankId}`]) {
      const bankCol = data[`col-${bankId}`];
      const taskId = `task-${test.id}`;
      const cardContent: ProgramacionCardContent = {
        ...test,
        cliente: test.generalInfo.cliente,
        tipoBomba: test.generalInfo.tipoDeBomba,
        ordenTrabajo: test.generalInfo.ordenDeTrabajo,
        isLocked: Boolean(locks[test.id]),
        lockedBy: locks[test.id],
      };

      bankCol.children.push(taskId);
      bankCol.totalChildrenCount += 1;

      data[taskId] = {
        id: taskId,
        title: `#${test.id}`,
        parentId: `col-${bankId}`,
        children: [],
        totalChildrenCount: 0,
        type: "card",
        content: cardContent,
      };
    }
  });

  return data;
}

export function getColumnBankId(column: ProgramacionBoardNode | undefined) {
  const content = column?.content;

  if (!content || !("bankId" in content)) {
    return undefined;
  }

  return content.bankId;
}
