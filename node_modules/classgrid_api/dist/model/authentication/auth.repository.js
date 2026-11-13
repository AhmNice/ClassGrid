import { prisma } from "@/lib/prisma.js";
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
};
class AuthRepository {
    constructor() { }
    async createUser(user) {
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
    async findUserByEmail(email) {
        return await prisma.user.findUnique({
            where: {
                email,
            },
            select: userSelect,
        });
    }
    async findUserByEmailWithPassword(email) {
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
    async updateLastLogin(userId, lastLoginAt) {
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
