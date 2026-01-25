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
const AuthRouter: Router = Router();

AuthRouter.route("/login").post(login);
AuthRouter.route("/register").post(register);
AuthRouter.route("/register-verification").post(registerVerification);
AuthRouter.route("/forget-password").post(forgetPassword);
AuthRouter.route("/reset-password").post(resetPassword);
AuthRouter.route("/logout").post(logout);
AuthRouter.route("/me").get(protect, getCurrentUserData);




export default AuthRouter;
