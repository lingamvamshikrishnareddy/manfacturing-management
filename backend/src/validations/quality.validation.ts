// src/validations/quality.validation.ts
import Joi from 'joi';

export const qualityValidation = {
  createInspection: Joi.object({
    batchId: Joi.string().min(1).required(),
    inspectionDate: Joi.date().required(),
    inspectedBy: Joi.number().required(),
    defectType: Joi.string().min(2).optional(),
    severity: Joi.string().valid('low', 'medium', 'high', 'critical').optional(),
    description: Joi.string().min(5).optional(),
    status: Joi.string().valid('open', 'in_progress', 'resolved', 'closed').required()
  }),
  
  reportDefect: Joi.object({
    batchId: Joi.string().min(1).required(),
    defectType: Joi.string().min(2).required(),
    severity: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
    description: Joi.string().min(5).required(),
    reportedBy: Joi.number().required()
  })
};