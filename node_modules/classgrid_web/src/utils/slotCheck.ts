import type { IPeriod } from "../interface/period.interface";
import type { IRoom, RoomType } from "../interface/room.interface";
import type { DayOfWeek } from "../interface/schedule.interface";
import type { ITimetableEntryCreate } from "../interface/timetable-entry.interface";
import { ROOM_TYPE_LABELS } from "../types/roomTypes";
import { shortLabel } from "./PeriodUtils";

/* ---------------------------------- types --------------------------------- */

/** One "this teacher teaches this subject to this class arm" record. */
export interface LessonAssignment {
  id: string;
  subjectId: string;
  teacherId: string;
  subject: { name: string; code: string };
  teacher: { title: string | null; firstName: string; lastName: string };
  periodsPerWeek: number;
  maxPeriodsPerDay: number | null;
  requiresDoublePeriod: boolean;
  requiredRoomType: RoomType | null;
}

/** The parts of an existing timetable entry that matter for clash checks. */
export type PlacedEntry = Pick<
  ITimetableEntryCreate,
  "dayOfWeek" | "periodId" | "assignmentId" | "teacherId" | "classArmId" | "roomId"
>;

export interface SlotIssue {
  id: string;
  /**
   * "conflict": something would be in two places at once (red).
   * "warning": it breaks a preference or a limit (amber).
   * Both can be overridden by the user.
   */
  severity: "conflict" | "warning";
  message: string;
}

export const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
};

export const teacherLabel = (t: LessonAssignment["teacher"]) =>
  [t.title, t.firstName, t.lastName].filter(Boolean).join(" ");

/** How many lessons of this assignment are already on the timetable. */
export const countPlaced = (assignmentId: string, entries: PlacedEntry[]) =>
  entries.filter((e) => e.assignmentId === assignmentId).length;

/* --------------------------------- checking -------------------------------- */

interface CheckInput {
  assignment: LessonAssignment;
  roomId: string | null;
  dayOfWeek: DayOfWeek;
  classArmId: string;
  /** The period(s) the lesson would take: one, or two for a double period. */
  slots: IPeriod[];
  /** True if the user ticked "double period", even if it can't be placed. */
  wantsDouble: boolean;
  /** Every entry in this timetable, for every class arm. */
  entries: PlacedEntry[];
  rooms: IRoom[];
  armLabel: (classArmId: string) => string;
}

const roomTypeName = (type: RoomType) => ROOM_TYPE_LABELS[type].toLowerCase();

/**
 * Everything wrong with putting this lesson here. An empty list means it fits
 * cleanly. The caller shows the messages and lets the user go ahead anyway.
 */
export function checkSlot({
  assignment,
  roomId,
  dayOfWeek,
  classArmId,
  slots,
  wantsDouble,
  entries,
  rooms,
  armLabel,
}: CheckInput): SlotIssue[] {
  const issues: SlotIssue[] = [];
  const add = (issue: SlotIssue) => {
    if (!issues.some((existing) => existing.id === issue.id)) issues.push(issue);
  };

  const subjectName = assignment.subject.name;
  const room = roomId ? rooms.find((r) => r.id === roomId) : undefined;
  const inSlot = (e: PlacedEntry, slot: IPeriod) =>
    e.dayOfWeek === dayOfWeek && e.periodId === slot.id;

  /* Conflicts: in two places at once. */
  for (const slot of slots) {
    const when = slots.length > 1 ? ` in ${shortLabel(slot)}` : "";

    const sameClass = entries.find(
      (e) => inSlot(e, slot) && e.classArmId === classArmId,
    );
    if (sameClass) {
      add({
        id: `class-${slot.id}`,
        severity: "conflict",
        message: `${armLabel(classArmId)} already has a lesson in ${shortLabel(slot)}.`,
      });
    }

    const teacherBusy = entries.find(
      (e) =>
        inSlot(e, slot) &&
        e.teacherId === assignment.teacherId &&
        e.classArmId !== classArmId,
    );
    if (teacherBusy) {
      add({
        id: `teacher-${slot.id}`,
        severity: "conflict",
        message: `${teacherLabel(assignment.teacher)} is already teaching ${armLabel(teacherBusy.classArmId)}${when || " at this time"}.`,
      });
    }

    if (roomId) {
      const roomBusy = entries.find((e) => inSlot(e, slot) && e.roomId === roomId);
      if (roomBusy) {
        add({
          id: `room-${slot.id}`,
          severity: "conflict",
          message: `${room?.name ?? "This room"} is already used by ${armLabel(roomBusy.classArmId)}${when || " at this time"}.`,
        });
      }
    }
  }

  /* Warnings: limits and preferences. */
  const placed = countPlaced(assignment.id, entries);
  const after = placed + slots.length;
  if (after > assignment.periodsPerWeek) {
    add({
      id: "weekly",
      severity: "warning",
      message:
        placed >= assignment.periodsPerWeek
          ? `${subjectName} already has all ${assignment.periodsPerWeek} of its lessons this week.`
          : `${subjectName} has ${placed} of ${assignment.periodsPerWeek} lessons placed, so this would make ${after}.`,
    });
  }

  if (assignment.maxPeriodsPerDay !== null) {
    const today = entries.filter(
      (e) => e.assignmentId === assignment.id && e.dayOfWeek === dayOfWeek,
    ).length;
    if (today + slots.length > assignment.maxPeriodsPerDay) {
      add({
        id: "daily",
        severity: "warning",
        message: `${subjectName} is limited to ${assignment.maxPeriodsPerDay} a day, and this would make ${today + slots.length} on ${DAY_LABELS[dayOfWeek]}.`,
      });
    }
  }

  if (assignment.requiresDoublePeriod && slots.length < 2) {
    add({
      id: "double",
      severity: "warning",
      message: wantsDouble
        ? `${subjectName} is normally a double period, but the next period can’t be used.`
        : `${subjectName} is normally a double period. Tick the double-period box to use two periods.`,
    });
  }

  if (assignment.requiredRoomType) {
    if (!room) {
      add({
        id: "room-missing",
        severity: "warning",
        message: `${subjectName} normally needs a ${roomTypeName(assignment.requiredRoomType)}, and no room is chosen.`,
      });
    } else if (room.type !== assignment.requiredRoomType) {
      add({
        id: "room-type",
        severity: "warning",
        message: `${subjectName} normally needs a ${roomTypeName(assignment.requiredRoomType)}, and ${room.name} is a ${roomTypeName(room.type)}.`,
      });
    }
  }

  // Red conflicts first, so the most serious problems are read first.
  return issues.sort((a, b) =>
    a.severity === b.severity ? 0 : a.severity === "conflict" ? -1 : 1,
  );
}