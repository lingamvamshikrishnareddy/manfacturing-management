import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import ScheduleController from '../controllers/production/ScheduleController';

const router = Router();

router.use(authMiddleware);

router.post('/schedule', ScheduleController.createSchedule);
router.get('/schedule', ScheduleController.getSchedule);
router.get('/batches', ScheduleController.getProductionBatches);

export default router;