// src/validations/maintenance.validation.ts
import Joi from 'joi';

export const maintenanceValidation = {
  addEquipment: Joi.object({
    name: Joi.string().min(2).required(),
    type: Joi.string().min(2).required(),
    status: Joi.string().valid('operational', 'maintenance', 'broken').required(),
    lastMaintenance: Joi.date().optional(),
    nextMaintenance: Joi.date().optional()
  }),
  
  scheduleMaintenance: Joi.object({
    equipmentId: Joi.string().min(1).required(),
    maintenanceType: Joi.string().min(2).required(),
    scheduledDate: Joi.date().required(),
    description: Joi.string().min(5).optional()
  }),
  
  updateStatus: Joi.object({
    status: Joi.string().valid('pending', 'in-progress', 'completed', 'cancelled').required()
  })
};