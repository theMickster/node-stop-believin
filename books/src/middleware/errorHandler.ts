import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  status?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {  
  console.error(`[${new Date().toISOString()}] Error:`, err.stack);
  
  const statusCode = err.status ?? 500;
  
  const errorResponse: { status: number; message: string; stack?: string } = {
    status: statusCode,
    message: err.message || 'Internal Server Error'
  };
  
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack ?? '';
  }

  res.status(statusCode).json(errorResponse);
};
