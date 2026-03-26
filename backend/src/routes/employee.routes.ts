import { Router } from 'express';
import EmployeeController from '../controllers/employees/EmployeeController';
import { ShiftController } from '../controllers/employees/ShiftController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { employeeValidation } from '../validations/employee.validation';

const router = Router();
const shiftController = new ShiftController();

router.post(
  '/register',
  validate(employeeValidation.register),
  EmployeeController.create
);

router.post(
  '/login',
  validate(employeeValidation.login),
  EmployeeController.login
);

router.post(
  '/shifts/assign',
  authMiddleware,
  validate(employeeValidation.assignShift),
  shiftController.assignShift
);

router.get(
  '/shifts/schedule',
  authMiddleware,
  shiftController.getShiftSchedule
);

router.get(
  '/',
  authMiddleware,
  EmployeeController.getAll
);

router.get(
  '/:id',
  authMiddleware,
  EmployeeController.getById
);

router.put(
  '/:id',
  authMiddleware,
  validate(employeeValidation.update),
  EmployeeController.update
);

export default router;