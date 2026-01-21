import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import config from '../config/config';
import { Response } from 'express';

//? Create a type for ExpiresIn in token options because it needs a string value with a specific type format
type unit = 'd' | 'D' | 'y' | 'Y' | 'W' | 'w' | 'H' | 'h';
type JWTExpiresType = `${number}${unit}`;

export const signJWT = (userId: string) => {
  const tokenSecret = config.jwt.secret as string;
  const jwtOptions: SignOptions = {
    expiresIn: config.jwt.expiresIn as JWTExpiresType,
  };

  // Sign a JWT token
  return jwt.sign({ id: userId }, tokenSecret, jwtOptions);
};

export const attachAuthCookie = (response: Response, token: string) => {
  const cookieExpiresIn = new Date(
    Date.now() + Number(config.cookies.expiresIn) * 24 * 60 * 60 * 1000
  );
  response.cookie('jwt', token, {
    expires: cookieExpiresIn,
    httpOnly: true,
  });
};

export const verifyJWT = (token: string): JwtPayload => {
  const tokenSecret = config.jwt.secret as string;
  return jwt.verify(token, tokenSecret) as JwtPayload;
};

export const signPasswordResetJWT = (email: string) => {
  const resetSecret = config.jwt.resetPasswordSecret as string;

  const jwtOptions: SignOptions = {
    expiresIn: config.jwt.resetPasswordExpiresIn as JWTExpiresType,
  };

  return jwt.sign({ email }, resetSecret, jwtOptions);
};

export const verifyPasswordResetJWT = (token: string): JwtPayload => {
  const resetSecret = config.jwt.resetPasswordSecret as string;
  return jwt.verify(token, resetSecret) as JwtPayload;
};
