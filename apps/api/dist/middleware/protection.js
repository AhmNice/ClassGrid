import { SessionService } from "@/utils/session.js";
export const protect = async (req, res, next) => {
    try {
        await SessionService.verifySession(req, res, next);
    }
    catch (error) {
        next(error);
    }
};
