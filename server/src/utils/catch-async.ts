import { Request, Response, NextFunction } from 'express';

export const catchAsync =
  (fn: any) => (request: Request, response: Response, next: NextFunction) =>
    fn(request, response, next).catch(next);

