import { UserRole } from "@/types/general.js";
import { PermissionAction, PermissionResource } from "@/types/general.js";

type PermissionMap = Partial<
  Record<PermissionResource, readonly PermissionAction[]>
>;

export const ROLE_PERMISSIONS: Record<UserRole, PermissionMap> = {
  ADMIN: {
    dashboard: ["view"],
    school: ["view", "update"],
    users: ["view", "create", "update", "delete"],
    academicSessions: ["view", "create", "update", "delete"],
    terms: ["view", "create", "update", "delete"],
    classes: ["view", "create", "update", "delete"],
    teachers: ["view", "create", "update", "delete"],
    subjects: ["view", "create", "update", "delete"],
    rooms: ["view", "create", "update", "delete"],
    periods: ["view", "create", "update", "delete"],
    teachingAssignments: ["view", "create", "update", "delete"],
    timetables: [
      "view",
      "create",
      "update",
      "generate",
      "validate",
      "publish",
      "archive",
      "duplicate",
      "export",
    ],
    auditLogs: ["view"],
  },

  TIMETABLE_OFFICER: {
    dashboard: ["view"],
    school: ["view"],
    academicSessions: ["view"],
    terms: ["view"],
    classes: ["view"],
    teachers: ["view"],
    subjects: ["view"],
    rooms: ["view"],
    periods: ["view"],
    teachingAssignments: ["view"],
    timetables: [
      "view",
      "create",
      "update",
      "generate",
      "validate",
      "publish",
      "duplicate",
      "export",
    ],
  },
};
