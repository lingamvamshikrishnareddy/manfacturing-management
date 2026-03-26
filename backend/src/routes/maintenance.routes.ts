import { Router } from 'express';
import { MaintenanceController } from '../controllers/maintenance/MaintenanceController';
import { EquipmentController } from '../controllers/maintenance/EquipmentController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { maintenanceValidation } from '../validations/maintenance.validation';

const router = Router();
const maintenanceController = new MaintenanceController();
const equipmentController = new EquipmentController();

router.post(
  '/equipment',
  authMiddleware,
  validate(maintenanceValidation.addEquipment),
  equipmentController.addEquipment
);

router.get(
  '/equipment/:equipmentId/history',
  authMiddleware,
  equipmentController.getMaintenanceHistory
);

router.post(
  '/schedule',
  authMiddleware,
  validate(maintenanceValidation.scheduleMaintenance),
  maintenanceController.scheduleMaintenance
);

router.patch(
  '/:maintenanceId/status',
  authMiddleware,
  validate(maintenanceValidation.updateStatus),
  maintenanceController.updateMaintenanceStatus
);

export default router;