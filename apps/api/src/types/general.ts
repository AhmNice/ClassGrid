import { Prisma } from "@/generated/prisma/client.js";

export type UserRole = "ADMIN" | "TIMETABLE_OFFICER";
export type PrismaTx = Prisma.TransactionClient;
export type TokenType = "access" | "refresh";
export type PermissionAction =
  | "view"
  | "create"
  | "update"
  | "delete"
  | "generate"
  | "validate"
  | "publish"
  | "archive"
  | "duplicate"
  | "export";

export type PermissionResource =
  | "dashboard"
  | "school"
  | "users"
  | "academicSessions"
  | "terms"
  | "classes"
  | "teachers"
  | "subjects"
  | "rooms"
  | "periods"
  | "teachingAssignments"
  | "timetables"
  | "auditLogs";
