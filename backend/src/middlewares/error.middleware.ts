import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Error:', error);

  if (error.name === 'ValidationError') {
    res.status(400).json({
      message: 'Validation error',
      details: error.message
    });
    return;
  }

  if (error.name === 'UnauthorizedError') {
    res.status(401).json({
      message: 'Unauthorized access'
    });
    return;
  }

  res.status(500).json({
    message: 'Internal server error'
  });
};
