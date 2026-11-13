export type UserRole = "ADMIN" | "TIMETABLE_OFFICER";
export interface User {
  id: string;
  schoolId: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
export type SafeUser = Omit<User, "passwordHash">;