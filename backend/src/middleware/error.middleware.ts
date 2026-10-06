import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  statusCode?: number;
  name: string;
  code?: number;
  errors?: Record<string, any>;
}

export const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('[Error Middleware] Error captured:', err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Handle Mongoose invalid ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  // Handle Mongoose Schema Validation Error
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    const details = Object.values(err.errors).map((e: any) => e.message);
    message = details.join(', ');
  }

  // Hide internal stack traces in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.status(statusCode).json({
    success: false,
    message: isProduction && statusCode === 500 ? 'Internal server error' : message,
  });
};
