import { UserRole } from "@/types/general.js";

export interface SessionPayload {
  sessionId?: string;
  userId: string;
  email?: string;
  role: UserRole;
  // accountStatus: "ACTIVE" | "SUSPENDED" | "BANNED";
}
export interface jwtSignReturnType {
  accessToken: string;
  refreshToken: string;
}
