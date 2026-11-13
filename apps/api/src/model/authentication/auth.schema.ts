import { z } from "zod";
export const CreateUserSchema = z.object({
  schoolId: z.string().uuid(),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "USER"]),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});
export const userSchema = z.object({
  id: z.string().uuid(),
  schoolId: z.string().uuid(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["ADMIN", "TIMETABLE_OFFICER"]),
  isActive: z.boolean(),
  lastLoginAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export const createUserReqSchema = z.object({
  body: CreateUserSchema,
});
export const loginReqSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
});
