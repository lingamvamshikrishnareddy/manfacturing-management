import { Router } from 'express';
import DashboardController from '../controllers/dashboard/DashboardController';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get(
  '/kpis',
  authMiddleware,
  DashboardController.getKPIs
);

export default router;