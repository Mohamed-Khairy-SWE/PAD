import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/app-error';
import config from '../config/config';
const getProductionErrorMessage = (error: AppError) => {
  const { status, message } = error;
  return {
    status,
    message,
  };
};
const getDevelopmentErrorMessage = (error: AppError) => {
  const { status, message } = error;
  return {
    status,
    error,
    message,
    stack: error.stack,
  };
};

// handle any error in the server
export const globalErrorHandler = (
  error: AppError,
  _request: Request,
  response: Response,
  _next: NextFunction
) => {
  const { statusCode } = error;

  const responseObject =
    config.env === 'development'
      ? getDevelopmentErrorMessage(error)
      : getProductionErrorMessage(error);
  response.status(statusCode || 500).json(responseObject);
};

// Handle not found routes
export const notFoundHandler = (
  request: Request,
  response: Response,
  _next: NextFunction
) => {
  const url = `http://${request.host}${request.originalUrl}`;
  response.status(404).json({
    status: 'fail',
    message: `This URL : ${url} is not found in this server`,
  });
};
