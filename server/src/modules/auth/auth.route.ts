import { Router, Request, Response } from "express";
import {
    getCurrentUserData,
    login,
    register,
    logout,
    resetPassword,
    registerVerification,
    forgetPassword,
    protect,
} from "./auth.controller";
import passport, { GoogleAuthResult } from "../../config/passport";
import config from "../../config/config";
import { signJWT, attachAuthCookie } from "@/utils/jwt";

const AuthRouter = Router();

AuthRouter.route("/login").post(login);
AuthRouter.route("/register").post(register);
AuthRouter.route("/register-verification").post(registerVerification);
AuthRouter.route("/forget-password").post(forgetPassword);
AuthRouter.route("/reset-password").post(resetPassword);
AuthRouter.route("/logout").post(logout);
AuthRouter.route("/me").get(protect, getCurrentUserData);

// OAuth routes
AuthRouter.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

AuthRouter.get(
    "/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: `${config.webUrl}/auth/login?error=google_failed` }),
    (req: Request, res: Response) => {
        const googleData = req.user as unknown as GoogleAuthResult;

        if (!googleData) {
            return res.redirect(`${config.webUrl}/auth/login?error=no_data`);
        }

        if (!googleData.isNewUser && googleData.existingUser) {
            // Existing user - log them in directly
            const token = signJWT(googleData.existingUser.id);

            // Set JWT cookie
            attachAuthCookie(res, token);

            // Redirect to frontend with success
            return res.redirect(`${config.webUrl}/auth/callback?type=login&success=true`);
        } else {
            // New user - redirect to registration page with pre-filled data (email, firstName, lastName)
            const userData = {
                email: googleData.email,
                firstName: googleData.firstName,
                lastName: googleData.lastName,
            };

            const encodedData = Buffer.from(JSON.stringify(userData)).toString("base64");

            return res.redirect(`${config.webUrl}/auth/callback?type=register&data=${encodedData}`);
        }
    }
);

export default AuthRouter;
