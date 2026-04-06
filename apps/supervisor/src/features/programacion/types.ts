import type { BoardData, BoardItem } from "react-kanban-kit";
import type { Test } from "@/lib/api";

export interface ProgramacionBank {
  id: number;
  nombre: string;
}

export interface ProgramacionCardContent extends Test {
  cliente: string;
  tipoBomba: string;
  ordenTrabajo: string;
  isLocked: boolean;
  lockedBy?: string;
}

export interface ProgramacionBoardNode extends BoardItem {
  content?: {
    bankId?: number;
  } | ProgramacionCardContent;
}

export interface ProgramacionBoardData extends BoardData {
  root: ProgramacionBoardNode;
  [key: string]: ProgramacionBoardNode;
}

export interface ProgramacionMove {
  cardId: string;
  toColumnId: string;
  position: number;
}

export type ProgramacionColumnHeaderProps = Pick<
  BoardItem,
  "title" | "totalChildrenCount"
>;
