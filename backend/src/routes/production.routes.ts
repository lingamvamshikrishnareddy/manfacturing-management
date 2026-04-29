import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import ScheduleController from '../controllers/production/ScheduleController';
import WorkOrderController from '../controllers/production/WorkOrderController';
import Production from '../models/Production.model';
import Equipment from '../models/Equipment.model';

const router = Router();

router.use(authMiddleware);

// ─── Schedule ───────────────────────────────────────────────────────────────
router.post('/schedule', ScheduleController.createSchedule);
router.get('/schedule', ScheduleController.getSchedule);

// ─── Batches ────────────────────────────────────────────────────────────────
router.get('/batches', ScheduleController.getProductionBatches);
router.post('/batches', async (req, res) => {
  try {
    const batch = new Production(req.body);
    await batch.save();
    res.status(201).json({ message: 'Batch created', data: batch });
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating batch', error: error.message });
  }
});
router.get('/batches/export', async (req, res) => {
  try {
    const batches = await Production.find({}).sort({ createdAt: -1 });
    const headers = ['batchNumber,productName,quantity,status,startDate,efficiency'];
    const rows = batches.map(b =>
      `${(b as any).batchNumber ?? ''},${(b as any).productName ?? ''},${(b as any).quantity ?? ''},${(b as any).status ?? ''},${(b as any).startDate ?? ''},${(b as any).efficiency ?? ''}`
    );
    const csv = [...headers, ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=batches.csv');
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ message: 'Error exporting batches', error: error.message });
  }
});

// ─── Work Orders ─────────────────────────────────────────────────────────────
router.post('/work-orders', WorkOrderController.createWorkOrder.bind(WorkOrderController));
router.get('/work-orders', WorkOrderController.getWorkOrders.bind(WorkOrderController));
router.put('/work-orders/:workOrderId', WorkOrderController.updateWorkOrderStatus.bind(WorkOrderController));
router.get('/work-orders/analytics', WorkOrderController.getWorkOrderAnalytics.bind(WorkOrderController));

// ─── Production Line Status ──────────────────────────────────────────────────
router.get('/lines/status', async (req, res) => {
  try {
    // Derive station status from Equipment model
    const equipment = await Equipment.find({}).limit(20);
    const stations = equipment.map((eq: any) => ({
      id: eq._id?.toString(),
      name: eq.name ?? eq.equipmentId,
      status: eq.status === 'operational' ? 'running' :
              eq.status === 'maintenance' ? 'maintenance' :
              eq.status === 'offline' ? 'down' : 'idle',
      efficiency: eq.efficiency ?? 0,
      throughput: eq.throughput ?? 0,
      operator: eq.assignedOperator ?? null,
      currentBatch: null,
    }));
    res.json({ data: stations });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching line status', error: error.message });
  }
});

// ─── Overview / Recent ───────────────────────────────────────────────────────
router.get('/overview', async (req, res) => {
  try {
    const total = await Production.countDocuments();
    const inProgress = await Production.countDocuments({ status: 'in-progress' });
    const completed = await Production.countDocuments({ status: 'completed' });
    res.json({ total, inProgress, completed });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching overview', error: error.message });
  }
});

router.get('/recent', async (req, res) => {
  try {
    const recent = await Production.find({}).sort({ createdAt: -1 }).limit(5);
    res.json({ data: recent });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching recent production', error: error.message });
  }
});

export default router;