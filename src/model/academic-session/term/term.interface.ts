import type { TermName } from "@/generated/prisma/client.js";

export interface ITerm {
  id: string;
  sessionId: string;
  name: TermName;
  startDate: Date | null;
  endDate: Date | null;
  isCurrent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITermCreate {
  sessionId: string;
  name: TermName;
  startDate: Date | null;
  endDate: Date | null;
  isCurrent?: boolean;
}

export interface ITermUpdate {
  name?: TermName;
  startDate?: Date | null;
  endDate?: Date | null;
  isCurrent?: boolean;
}
