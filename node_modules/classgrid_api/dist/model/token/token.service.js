import { ApiError } from "../../utils/errorHandler.js";
import { TokenRepository } from "./token.repo.js";
export class TokenService {
    static async isActiveToken(userId, sessionId) {
        const session = await TokenRepository.findSession(userId, sessionId);
        if (!session) {
            return false;
        }
        return !session.revoked;
    }
    static async invalidateToken(userId, sessionId) {
        return TokenRepository.markAsRotated(userId, sessionId);
    }
    static async deleteToken(userId, sessionId) {
        return TokenRepository.deleteSession(userId, sessionId);
    }
    static async deleteAllUserTokens(userId) {
        return TokenRepository.deleteAllUserSessions(userId);
    }
    static async rotateSession(userId, sessionId) {
        const result = await TokenRepository.markAsRotated(userId, sessionId);
        if (result.count !== 1) {
            throw new ApiError(401, "Refresh token has already been used");
        }
    }
    static revokeAllUserSessions(userId) {
        return TokenRepository.deleteAllUserSessions(userId);
    }
    static async rotateSessionAtomically(userId, oldSessionId, newSessionId) {
        return TokenRepository.rotateSessionAtomically(userId, oldSessionId, newSessionId);
    }
}
