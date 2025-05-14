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
  // Log the error details (stack trace included)
  console.error(`[${new Date().toISOString()}] Error:`, err.stack);

  // Determine the HTTP status code, defaulting to 500
  const statusCode = err.status ?? 500;

  // Build the error response
  const errorResponse: { status: number; message: string; stack?: string } = {
    status: statusCode,
    message: err.message || 'Internal Server Error'
  };

  // Optionally include the error stack if in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack ?? '';
  }

  // Send the error response
  res.status(statusCode).json(errorResponse);
};
