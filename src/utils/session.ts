import crypto from "crypto";
import {
  jwtSignReturnType,
  SessionPayload,
} from "@/interface/session.interface.js";
import config from "@/config/config.js";
import { NextFunction, Request, Response, CookieOptions } from "express";
import jwt from "jsonwebtoken";
import { ApiError, TokenExpiredApiError } from "./errorHandler.js";
import { TokenRepository } from "@/model/token/token.repo.js";
import { TokenType } from "@/types/general.js";
import { TokenService } from "@/model/token/token.service.js";

declare module "express-serve-static-core" {
  interface Request {
    user?: SessionPayload & { sessionId: string };
  }
}

type SignedTokenPayload = SessionPayload & {
  sessionId: string;
  tokenType: TokenType;
};

export class SessionService {
  private static readonly baseCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };

  private static secretFor(type: TokenType): string {
    return type === "access"
      ? config.ACCESS_TOKEN_SECRET
      : config.REFRESH_TOKEN_SECRET;
  }

  private static maxAgeMsFromToken(token: string): number | undefined {
    const decoded = jwt.decode(token) as { exp?: number } | null;
    if (!decoded?.exp) return undefined;
    const maxAge = decoded.exp * 1000 - Date.now();
    return maxAge > 0 ? maxAge : undefined;
  }

  private static setSessionCookie(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    res.cookie(config.ACCESS_TOKEN_NAME, accessToken, {
      ...SessionService.baseCookieOptions,
      maxAge: SessionService.maxAgeMsFromToken(accessToken),
    });
    res.cookie(config.REFRESH_TOKEN_NAME, refreshToken, {
      ...SessionService.baseCookieOptions,
      maxAge: SessionService.maxAgeMsFromToken(refreshToken),
    });
  }

  private static clearSessionCookies(res: Response): void {
    res.clearCookie(config.ACCESS_TOKEN_NAME, SessionService.baseCookieOptions);
    res.clearCookie(
      config.REFRESH_TOKEN_NAME,
      SessionService.baseCookieOptions,
    );
  }

  private static createTokenPair(
    payload: SessionPayload,
    sessionId: string,
  ): { accessToken: string; refreshToken: string } {
    const cleanPayload: SessionPayload = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    const accessToken = jwt.sign(
      { ...cleanPayload, sessionId, tokenType: "access" },
      SessionService.secretFor("access"),
      {
        expiresIn:
          config.ACCESS_TOKEN_EXPIRATION as jwt.SignOptions["expiresIn"],
        algorithm: "HS256",
      },
    );
    const refreshToken = jwt.sign(
      { ...cleanPayload, sessionId, tokenType: "refresh" },
      SessionService.secretFor("refresh"),
      {
        expiresIn:
          config.REFRESH_TOKEN_EXPIRATION as jwt.SignOptions["expiresIn"],
        algorithm: "HS256",
      },
    );
    return { accessToken, refreshToken };
  }

  private static verifyTokenOfType(
    token: string,
    expectedType: TokenType,
    options?: jwt.VerifyOptions,
  ): SignedTokenPayload {
    let decoded: SignedTokenPayload;
    try {
      decoded = jwt.verify(token, SessionService.secretFor(expectedType), {
        ...options,
        algorithms: ["HS256"],
      }) as SignedTokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new TokenExpiredApiError(expectedType);
      }
      throw new ApiError(401, `Unauthorized: Invalid ${expectedType} token.`);
    }
    if (decoded.tokenType !== expectedType) {
      throw new ApiError(
        401,
        `Unauthorized: Expected a ${expectedType} token.`,
      );
    }
    return decoded;
  }

  private static async performRefresh(
    res: Response,
    refreshTokenRaw: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const decoded = SessionService.verifyTokenOfType(
      refreshTokenRaw,
      "refresh",
    );

    const payload: SessionPayload = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    const newSessionId = crypto.randomUUID();
    const { accessToken, refreshToken } = SessionService.createTokenPair(
      payload,
      newSessionId,
    );

    const rotated = await TokenService.rotateSessionAtomically(
      decoded.userId,
      decoded.sessionId,
      newSessionId,
    );
    if (!rotated) {
      throw new ApiError(401, "Unauthorized: Session already used or revoked.");
    }

    SessionService.setSessionCookie(res, accessToken, refreshToken);
    return { accessToken, refreshToken };
  }

  static async signTo(
    res: Response,
    payload: SessionPayload,
  ): Promise<jwtSignReturnType> {
    const sessionId = crypto.randomUUID();
    const { accessToken, refreshToken } = SessionService.createTokenPair(
      payload,
      sessionId,
    );
    await TokenRepository.saveSession(payload.userId, sessionId);
    SessionService.setSessionCookie(res, accessToken, refreshToken);
    return { accessToken, refreshToken };
  }

  static async autoRefresh(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const refreshTokenRaw =
      req.cookies[config.REFRESH_TOKEN_NAME] ||
      (req.headers["x-refresh-token"] as string | undefined);

    if (!refreshTokenRaw) {
      return next(
        new ApiError(401, "Unauthorized: No refresh token provided."),
      );
    }

    let user: SignedTokenPayload;
    try {
      const { accessToken } = await SessionService.performRefresh(
        res,
        refreshTokenRaw,
      );
      user = SessionService.verifyTokenOfType(accessToken, "access");
    } catch (error: unknown) {
      SessionService.clearSessionCookies(res);
      return next(
        error instanceof ApiError
          ? error
          : new ApiError(401, "Unauthorized: Invalid refresh token."),
      );
    }

    req.user = user;
    return next();
  }

  static async verifySession(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const accessToken = req.cookies[config.ACCESS_TOKEN_NAME];
    const refreshToken = req.cookies[config.REFRESH_TOKEN_NAME];

    if (!accessToken && !refreshToken) {
      return next(new ApiError(401, "Unauthorized: No tokens provided."));
    }
    if (!accessToken) {
      return SessionService.autoRefresh(req, res, next);
    }

    let decoded: SignedTokenPayload;
    try {
      decoded = SessionService.verifyTokenOfType(accessToken, "access");
    } catch (error: unknown) {
      if (error instanceof TokenExpiredApiError && refreshToken) {
        return SessionService.autoRefresh(req, res, next);
      }
      return next(
        error instanceof ApiError
          ? error
          : new ApiError(401, "Unauthorized: Invalid access token."),
      );
    }

    try {
      const isActive = await TokenService.isActiveToken(
        decoded.userId,
        decoded.sessionId,
      );
      if (!isActive) {
        await SessionService.clearFrom(res, decoded.userId, decoded.sessionId);
        return next(new ApiError(401, "Unauthorized: Session is not active."));
      }
    } catch (error) {
      return next(error); // DB failure: let the error handler return a 500
    }

    req.user = decoded;
    return next();
  }

  static async clearFrom(
    res: Response,
    userId: string,
    sessionId: string,
  ): Promise<void> {
    try {
      await TokenService.invalidateToken(userId, sessionId);
    } catch (error) {
      console.error(
        `[SessionService.clearFrom] Failed to invalidate session ${sessionId} for user ${userId}:`,
        error,
      );
    }
    SessionService.clearSessionCookies(res);
  }

  static async logout(req: Request, res: Response) {
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
    } catch {
      // Bad signature or DB error: still clear the cookies below.
    }

    SessionService.clearSessionCookies(res);
    return { success: true };
  }
}
