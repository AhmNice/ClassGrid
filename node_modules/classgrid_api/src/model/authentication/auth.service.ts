import { Request, Response } from "express";
import config from "@/config/config.js";
import { ICreateUser, User } from "./auth.interface.js";
import authRepository, { IAuthRepository } from "./auth.repository.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

import { ApiError } from "@/utils/errorHandler.js";
import { Prisma } from "@/generated/prisma/client.js";
import { SafeUser } from "./auth.interface.js";
import { SessionService } from "@/utils/session.js";

export interface IAuthService {
  createUser(userData: ICreateUser): Promise<SafeUser>;
  loginUser(email: string, password: string): Promise<SafeUser>;
  currentUser(req: Request): Promise<SafeUser>;
  logoutUser(req: Request, res: Response): Promise<void>;
}

const BCRYPT_COST = 12;

// Used to keep login timing the same when the email doesn't exist.
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", BCRYPT_COST);

export class AuthService implements IAuthService {
  constructor(private readonly authRepository: IAuthRepository) {}

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_COST);
  }

  private comparePassword(plainText: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashed);
  }

  private toSafeUser(user: User): SafeUser {
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }

  // No fallback: OTP_HMAC_SECRET must be validated at startup.
  private hashOtp(otp: string): string {
    return crypto
      .createHmac("sha256", config.OTP_HMAC_SECRET)
      .update(otp)
      .digest("hex");
  }

  async createUser(userData: ICreateUser): Promise<SafeUser> {
    const email = this.normalizeEmail(userData.email);

    if (await this.authRepository.findUserByEmail(email)) {
      throw new ApiError(409, "User with this email already exists");
    }

    const passwordHash = await this.hashPassword(userData.password);
    const { password: _password, ...rest } = userData;

    try {
      const user = await this.authRepository.createUser({
        ...rest,
        email,
        password: passwordHash,
      });
      return this.toSafeUser(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ApiError(409, "User with this email already exists");
      }
      throw error;
    }
  }

  async loginUser(email: string, password: string): Promise<SafeUser> {
    const user = await this.authRepository.findUserByEmailWithPassword(
      this.normalizeEmail(email),
    );

    // Always run bcrypt so response time doesn't reveal whether the email exists.
    const isMatch = await this.comparePassword(
      password,
      user?.passwordHash ?? DUMMY_HASH,
    );

    if (!user || !isMatch) {
      throw new ApiError(401, "Invalid email or password");
    }
    if (!user.isActive) {
      throw new ApiError(403, "This account has been deactivated");
    }

    await this.authRepository.updateLastLogin(user.id, new Date());
    return this.toSafeUser(user);
  }
  async logoutUser(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new ApiError(401, "Not authenticated");
    }
    const { sessionId } = req.user;
    if (!sessionId) {
      throw new ApiError(400, "No session found");
    }
    await SessionService.logout(req, res);
  }
  async currentUser(req: Request): Promise<SafeUser> {
    if (!req.user) {
      throw new ApiError(401, "Not authenticated");
    }
    const { email } = req.user;
    const user = await this.authRepository.findUserByEmail(email as string);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return user;
  }
}
const authService = new AuthService(authRepository);
export default authService;
