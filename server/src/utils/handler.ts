import { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../models';

export class Handler {
  public static controllerHandler(fn: (...args: any[]) => Promise<any>, params?: (...args: any[]) => any[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const boundParams: any[] = params ? params(req, res, next) : [];
      try {
        const result: ApiResponse = await fn(...boundParams);
        res.status(result.status).json({ message: result.message });
      } catch (error) {
        next(error);
      }
    };
  }
}
