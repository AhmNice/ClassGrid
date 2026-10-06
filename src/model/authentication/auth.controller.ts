import { SessionService } from "@/utils/session.js";
import authService, { IAuthService } from "./auth.service.js";
import { asyncHandler } from "@/lib/asyncHandler.js";
import { ICreateUser } from "./auth.interface.js";
import { Request, Response } from "express";
import { ApiResponse } from "@/utils/api-response.js";
import { SessionPayload } from "@/interface/session.interface.js";
class AuthController {
  constructor(private readonly authService: IAuthService) {}
  readonly createUser = asyncHandler(async (req: Request, res: Response) => {
    const userData = req.body as ICreateUser;
    const user = await this.authService.createUser(userData);
    res
      .status(201)
      .json(new ApiResponse(201, user, "User created successfully"));
  });
  readonly loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await this.authService.loginUser(email, password);
    const sessionPayload: SessionPayload = {
      userId: user.id,
      role: user.role,
      email: user.email,
    };
    await SessionService.signTo(res, sessionPayload);
    res.status(200).json(new ApiResponse(200, user, "Login successful"));
  });
  readonly currentUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.authService.currentUser(req);
    res.status(200).json(new ApiResponse(200, user, "Current user fetched"));
  });
  readonly logoutUser = asyncHandler(async (req: Request, res: Response) => {
    await this.authService.logoutUser(req, res);
    res.status(200).json(new ApiResponse(200, null, "Logout successful"));
  });
}
const authController = new AuthController(authService);
export default authController;
