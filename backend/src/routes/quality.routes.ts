import { Router } from 'express';
import { InspectionController } from '../controllers/quality/InspectionController';
import DefectController from '../controllers/quality/DefectController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { qualityValidation } from '../validations/quality.validation';

const router = Router();
const inspectionController = new InspectionController();
const defectController = DefectController;

router.post(
  '/inspections',
  authMiddleware,
  validate(qualityValidation.createInspection),
  inspectionController.createInspection
);

router.get(
  '/inspections/work-order/:workOrderId',
  authMiddleware,
  inspectionController.getInspectionsByWorkOrder
);

router.post(
  '/defects',
  authMiddleware,
  validate(qualityValidation.reportDefect),
  defectController.reportDefect
);

router.get(
  '/defects/analytics',
  authMiddleware,
  defectController.getDefectAnalytics
);

export default router;



