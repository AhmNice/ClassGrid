import crypto from "crypto";
import config from "@/config/config.js";
import jwt from "jsonwebtoken";
import { ApiError, TokenExpiredApiError } from "./errorHandler.js";
import { TokenRepository } from "@/model/token/token.repo.js";
import { TokenService } from "@/model/token/token.service.js";
export class SessionService {
    static baseCookieOptions = {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    };
    static secretFor(type) {
        return type === "access"
            ? config.ACCESS_TOKEN_SECRET
            : config.REFRESH_TOKEN_SECRET;
    }
    static maxAgeMsFromToken(token) {
        const decoded = jwt.decode(token);
        if (!decoded?.exp)
            return undefined;
        const maxAge = decoded.exp * 1000 - Date.now();
        return maxAge > 0 ? maxAge : undefined;
    }
    static setSessionCookie(res, accessToken, refreshToken) {
        res.cookie(config.ACCESS_TOKEN_NAME, accessToken, {
            ...SessionService.baseCookieOptions,
            maxAge: SessionService.maxAgeMsFromToken(accessToken),
        });
        res.cookie(config.REFRESH_TOKEN_NAME, refreshToken, {
            ...SessionService.baseCookieOptions,
            maxAge: SessionService.maxAgeMsFromToken(refreshToken),
        });
    }
    static clearSessionCookies(res) {
        res.clearCookie(config.ACCESS_TOKEN_NAME, SessionService.baseCookieOptions);
        res.clearCookie(config.REFRESH_TOKEN_NAME, SessionService.baseCookieOptions);
    }
    static createTokenPair(payload, sessionId) {
        const cleanPayload = {
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
            schoolId: payload.schoolId,
        };
        const accessToken = jwt.sign({ ...cleanPayload, sessionId, tokenType: "access" }, SessionService.secretFor("access"), {
            expiresIn: config.ACCESS_TOKEN_EXPIRATION,
            algorithm: "HS256",
        });
        const refreshToken = jwt.sign({ ...cleanPayload, sessionId, tokenType: "refresh" }, SessionService.secretFor("refresh"), {
            expiresIn: config.REFRESH_TOKEN_EXPIRATION,
            algorithm: "HS256",
        });
        return { accessToken, refreshToken };
    }
    static verifyTokenOfType(token, expectedType, options) {
        let decoded;
        try {
            decoded = jwt.verify(token, SessionService.secretFor(expectedType), {
                ...options,
                algorithms: ["HS256"],
            });
        }
        catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new TokenExpiredApiError(expectedType);
            }
            throw new ApiError(401, `Unauthorized: Invalid ${expectedType} token.`);
        }
        if (decoded.tokenType !== expectedType) {
            throw new ApiError(401, `Unauthorized: Expected a ${expectedType} token.`);
        }
        return decoded;
    }
    static async performRefresh(res, refreshTokenRaw) {
        const decoded = SessionService.verifyTokenOfType(refreshTokenRaw, "refresh");
        const payload = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            schoolId: decoded.schoolId,
        };
        const newSessionId = crypto.randomUUID();
        const { accessToken, refreshToken } = SessionService.createTokenPair(payload, newSessionId);
        const rotated = await TokenService.rotateSessionAtomically(decoded.userId, decoded.sessionId, newSessionId);
        if (!rotated) {
            throw new ApiError(401, "Unauthorized: Session already used or revoked.");
        }
        SessionService.setSessionCookie(res, accessToken, refreshToken);
        return { accessToken, refreshToken };
    }
    static async signTo(res, payload) {
        const sessionId = crypto.randomUUID();
        const { accessToken, refreshToken } = SessionService.createTokenPair(payload, sessionId);
        await TokenRepository.saveSession(payload.userId, sessionId);
        SessionService.setSessionCookie(res, accessToken, refreshToken);
        return { accessToken, refreshToken };
    }
    static async autoRefresh(req, res, next) {
        const refreshTokenRaw = req.cookies[config.REFRESH_TOKEN_NAME] ||
            req.headers["x-refresh-token"];
        if (!refreshTokenRaw) {
            return next(new ApiError(401, "Unauthorized: No refresh token provided."));
        }
        let user;
        try {
            const { accessToken } = await SessionService.performRefresh(res, refreshTokenRaw);
            user = SessionService.verifyTokenOfType(accessToken, "access");
        }
        catch (error) {
            SessionService.clearSessionCookies(res);
            return next(error instanceof ApiError
                ? error
                : new ApiError(401, "Unauthorized: Invalid refresh token."));
        }
        req.user = user;
        return next();
    }
    static async verifySession(req, res, next) {
        const accessToken = req.cookies[config.ACCESS_TOKEN_NAME];
        const refreshToken = req.cookies[config.REFRESH_TOKEN_NAME];
        if (!accessToken && !refreshToken) {
            return next(new ApiError(401, "Unauthorized: No tokens provided."));
        }
        if (!accessToken) {
            return SessionService.autoRefresh(req, res, next);
        }
        let decoded;
        try {
            decoded = SessionService.verifyTokenOfType(accessToken, "access");
        }
        catch (error) {
            if (error instanceof TokenExpiredApiError && refreshToken) {
                return SessionService.autoRefresh(req, res, next);
            }
            return next(error instanceof ApiError
                ? error
                : new ApiError(401, "Unauthorized: Invalid access token."));
        }
        try {
            const isActive = await TokenService.isActiveToken(decoded.userId, decoded.sessionId);
            if (!isActive) {
                await SessionService.clearFrom(res, decoded.userId, decoded.sessionId);
                return next(new ApiError(401, "Unauthorized: Session is not active."));
            }
        }
        catch (error) {
            return next(error); // DB failure: let the error handler return a 500
        }
        req.user = decoded;
        return next();
    }
    static async clearFrom(res, userId, sessionId) {
        try {
            await TokenService.invalidateToken(userId, sessionId);
        }
        catch (error) {
            console.error(`[SessionService.clearFrom] Failed to invalidate session ${sessionId} for user ${userId}:`, error);
        }
        SessionService.clearSessionCookies(res);
    }
    static async logout(req, res) {
        const accessToken = req.cookies[config.ACCESS_TOKEN_NAME];
        const refreshToken = req.cookies[config.REFRESH_TOKEN_NAME];
        try {
            const decoded = accessToken
                ? SessionService.verifyTokenOfType(accessToken, "access", {
                    ignoreExpiration: true,
                })
                : refreshToken
                    ? SessionService.verifyTokenOfType(refreshToken, "refresh", {
                        ignoreExpiration: true,
                    })
                    : null;
            if (decoded) {
                await TokenService.invalidateToken(decoded.userId, decoded.sessionId);
            }
        }
        catch {
            // Bad signature or DB error: still clear the cookies below.
        }
        SessionService.clearSessionCookies(res);
        return { success: true };
    }
}
