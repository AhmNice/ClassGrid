import { prisma } from "@/lib/prisma.js";
import { ICreateUser, SafeUser } from "./auth.interface.js";
import { Prisma, User } from "@/generated/prisma/browser.js";

// default: safe fields only
const userSelect = {
  id: true,
  schoolId: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export interface IAuthRepository {
  createUser(user: ICreateUser): Promise<User>;
  findUserByEmail(email: string): Promise<SafeUser | null>;
  findUserByEmailWithPassword(email: string): Promise<User | null>;
  updateLastLogin(userId: string, lastLoginAt: Date): Promise<void>;
}
class AuthRepository implements IAuthRepository {
  constructor() {}
  async createUser(user: ICreateUser) {
    return await prisma.user.create({
      data: {
        schoolId: user.schoolId,
        email: user.email,
        passwordHash: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
  async findUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: {
        email,
      },
      select: userSelect,
    });
  }
  async findUserByEmailWithPassword(email: string) {
    return await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        ...userSelect,
        passwordHash: true,
      },
    });
  }
  async updateLastLogin(userId: string, lastLoginAt: Date) {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        lastLoginAt,
      },
    });
  }
}
const authRepository = new AuthRepository();
export default authRepository;
