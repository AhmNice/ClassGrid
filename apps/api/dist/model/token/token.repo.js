import { prisma } from "@/lib/prisma.js";
export class TokenRepository {
    static saveSession(userId, sessionId, tx = prisma) {
        return tx.sessionToken.create({
            data: {
                sessionTokenId: sessionId,
                userId,
            },
        });
    }
    static findSession(userId, sessionId, tx = prisma) {
        return tx.sessionToken.findFirst({
            where: {
                userId,
                sessionTokenId: sessionId,
            },
        });
    }
    static markAsRotated(userId, sessionId, tx = prisma) {
        return tx.sessionToken.updateMany({
            where: {
                userId,
                sessionTokenId: sessionId,
                revoked: false,
            },
            data: {
                revoked: true,
                usedAt: new Date(),
            },
        });
    }
    static deleteSession(userId, sessionId, tx = prisma) {
        return tx.sessionToken.deleteMany({
            where: {
                userId,
                sessionTokenId: sessionId,
            },
        });
    }
    static deleteAllUserSessions(userId, tx = prisma) {
        return tx.sessionToken.deleteMany({
            where: {
                userId,
            },
        });
    }
    static async rotateSessionAtomically(userId, oldSessionId, newSessionId) {
        return prisma.$transaction(async (tx) => {
            // 1. Consume the old session.
            const result = await tx.sessionToken.updateMany({
                where: {
                    userId,
                    sessionTokenId: oldSessionId,
                    revoked: false,
                },
                data: {
                    revoked: true,
                    usedAt: new Date(),
                },
            });
            // Nobody successfully consumed this session.
            if (result.count !== 1) {
                return false;
            }
            // 2. Create the new session.
            await tx.sessionToken.create({
                data: {
                    sessionTokenId: newSessionId,
                    userId,
                },
            });
            return true;
        });
    }
}
