import crypto from "crypto";

// Generate OTP of  6 digits
export const generateOTP = () => crypto.randomInt(100000, 999999).toString();
