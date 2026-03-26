// src/validations/employee.validation.ts
import Joi from 'joi';

export const employeeValidation = {
  register: Joi.object({
    firstName: Joi.string().min(2).required(),
    lastName: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    department: Joi.string().min(2).required(),
    position: Joi.string().min(2).required(),
    role: Joi.string().valid('admin', 'supervisor', 'operator', 'technician').required(),
    shift: Joi.string().min(1).required()
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),
  
  assignShift: Joi.object({
    employeeId: Joi.string().min(1).required(),
    shiftId: Joi.string().min(1).required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required()
  }),

  update: Joi.object({
    firstName: Joi.string().min(2),
    lastName: Joi.string().min(2),
    email: Joi.string().email(),
    department: Joi.string().min(2),
    position: Joi.string().min(2),
    role: Joi.string().valid('admin', 'supervisor', 'operator', 'technician'),
    shift: Joi.string().min(1),
    status: Joi.string().valid('active', 'inactive', 'on-leave'),
    phone: Joi.string(),
    address: Joi.string(),
    emergencyContact: Joi.object(),
    password: Joi.string().min(6)
  })
};