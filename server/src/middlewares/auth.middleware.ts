import { Request, Response, NextFunction } from "express";
import AppError from "../utils/app-error";
import { verifyJWT } from "../utils/jwt";
import UserService from "../modules/user/user.service";
import { IUser } from "../modules/user/types/IUser";
import { AdminPrivilege, UserRole } from "../enum/UserRole";

export class AuthMiddleware {
    static async protect(request: Request, _response: Response, next: NextFunction) {
        // Extract the jwt from browser cookies
        const jwt = request.cookies.jwt;
        // Check if there is a jwt
        if (!jwt) {
            return next(new AppError(401, `غير مصرح لك، سجل الدخول وحاول مرة أخرى!`));
        }

        // Extract user id from jwt
        let data;
        try {
            data = verifyJWT(jwt);
        } catch (err) {
            return next(
                new AppError(
                    401,
                    "رمز غير صالح أو منتهي الصلاحية. يرجى تسجيل الدخول مرة أخرى."
                )
            );
        }
        const { id, iat } = data;
        // Add user data to the response
        const user = await UserService.getUser(id, next);
        if (!user) return;

        // Check if the user changed the password after the token was issued
        if (user.passwordChangedAt && iat) {
            const passwordChangedTimestamp = Math.floor(
                new Date(user.passwordChangedAt).getTime() / 1000
            );
            if (passwordChangedTimestamp > iat) {
                return next(
                    new AppError(
                        401,
                        "تم تغيير كلمة المرور. يرجى تسجيل الدخول مرة أخرى."
                    )
                );
            }
        }

        request.user = user as IUser;
        next();
    }

    // Restrict routes to specific roles
    static checkPermissions(
        allowedRoles: UserRole[],
        requiredPrivileges: AdminPrivilege[] = []
    ) {
        return (request: Request, _response: Response, next: NextFunction) => {
            const user = request.user as IUser;

            if (!user) {
                return next(new AppError(401, "غير مصرح"));
            }

            if (user.role === UserRole.SUPER_ADMIN || user.role === "SUPER_ADMIN") {
                return next();
            }

            // Check if user role is in allowed roles (compare as strings)
            const userRoleStr = user.role as string;
            const allowedRoleStrs = allowedRoles.map(r => r as string);
            if (!allowedRoleStrs.includes(userRoleStr)) {
                return next(new AppError(403, "تم الرفض، ليس لديك صلاحية للقيام بهذا الإجراء"));
            }

            // --- Privilege Check (Only for ADMIN role) ---
            if ((user.role === UserRole.ADMIN || user.role === "ADMIN") && requiredPrivileges.length > 0) {
                const userPrivilegeNames = user.privileges?.map(p => p.name) || [];
                const requiredPrivilegeNames = requiredPrivileges.map(p => p as string);

                const hasAllPrivileges = requiredPrivilegeNames.every((privilege) =>
                    userPrivilegeNames.includes(privilege)
                );

                if (!hasAllPrivileges) {
                    return next(
                        new AppError(403, "تم الرفض، ليس لديك صلاحية للقيام بهذا الإجراء")
                    );
                }
            }

            next();
        };
    }
}
