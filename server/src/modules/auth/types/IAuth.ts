import { UserRole } from "../../../enum/UserRole";

export interface IUserLoginData {
  usernameOrEmail: string;
  password: string;
}
export interface IRegisterVerificationData {
  email: string;
}
export interface IRegisterData {
  otp: {
    hashedOtp: string;
    expiresIn: string;
    enteredOtp: string;
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    role: UserRole;
  };
}

export interface IResetPasswordData {
  token: string;
  password: string;
}
