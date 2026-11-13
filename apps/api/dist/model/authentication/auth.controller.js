import { SessionService } from "@/utils/session.js";
import authService from "./auth.service.js";
import { asyncHandler } from "@/lib/asyncHandler.js";
import { ApiResponse } from "@/utils/api-response.js";
class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    createUser = asyncHandler(async (req, res) => {
        const userData = req.body;
        const user = await this.authService.createUser(userData);
        res
            .status(201)
            .json(new ApiResponse(201, user, "User created successfully"));
    });
    loginUser = asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        const user = await this.authService.loginUser(email, password);
        const sessionPayload = {
            userId: user.id,
            role: user.role,
            email: user.email,
            schoolId: user.schoolId,
        };
        await SessionService.signTo(res, sessionPayload);
        res.status(200).json(new ApiResponse(200, user, "Login successful"));
    });
    currentUser = asyncHandler(async (req, res) => {
        const user = await this.authService.currentUser(req);
        res.status(200).json(new ApiResponse(200, user, "Current user fetched"));
    });
    logoutUser = asyncHandler(async (req, res) => {
        await this.authService.logoutUser(req, res);
        res.status(200).json(new ApiResponse(200, null, "Logout successful"));
    });
}
const authController = new AuthController(authService);
export default authController;
