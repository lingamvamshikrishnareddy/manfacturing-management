import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import logger from '../utils/logger';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      logger.warn('Validation error:', error.details[0].message);
      res.status(400).json({
        message: 'Validation error',
        details: error.details[0].message
      });
      return;
    }

    next();
  };
};