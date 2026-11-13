import { Request, Response, NextFunction } from "express";
import { ApiError } from "@/utils/errorHandler.js";
import { UserRole } from "@/generated/prisma/client.js";
import { PermissionAction, PermissionResource } from "@/types/general.js";
import { ROLE_PERMISSIONS } from "@/seeds/permission.js";

export function hasPermission(
  role: UserRole,
  resource: PermissionResource,
  action: PermissionAction,
): boolean {
  return ROLE_PERMISSIONS[role]?.[resource]?.includes(action) ?? false;
}

export const authorize = (requiredRoles: UserRole | UserRole[]) => {
  const allowed = new Set<UserRole>(
    Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles],
  );

  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user) {
      return next(new ApiError(401, "Unauthorized: No user session found."));
    }
    if (user.role !== "ADMIN" && !allowed.has(user.role)) {
      return next(
        new ApiError(
          403,
          "Forbidden: You do not have access to this resource.",
        ),
      );
    }
    next();
  };
};

/**
 * Fine-grained check against ROLE_PERMISSIONS.
 * Must run after SessionService.verifySession (needs req.user).
 */
export const requirePermission = (
  resource: PermissionResource,
  action: PermissionAction,
) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user) {
      return next(new ApiError(401, "Unauthorized: Authentication required."));
    }
    if (!hasPermission(user.role, resource, action)) {
      return next(
        new ApiError(
          403,
          "Forbidden: You do not have permission to perform this action.",
        ),
      );
    }
    next();
  };
};
