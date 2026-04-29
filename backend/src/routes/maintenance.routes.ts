import { Router } from 'express';
import { MaintenanceController } from '../controllers/maintenance/MaintenanceController';
import { EquipmentController } from '../controllers/maintenance/EquipmentController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { maintenanceValidation } from '../validations/maintenance.validation';
import Maintenance from '../models/Maintenance.model';
import Equipment from '../models/Equipment.model';

const router = Router();
const maintenanceController = new MaintenanceController();
const equipmentController = new EquipmentController();

// ─── Equipment ────────────────────────────────────────────────────────────────
router.post('/equipment', authMiddleware, validate(maintenanceValidation.addEquipment), equipmentController.addEquipment);
router.get('/equipment', authMiddleware, async (req, res) => {
  try {
    const equipment = await Equipment.find().sort({ createdAt: -1 });
    res.json({ data: equipment });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching equipment', error: error.message });
  }
});
router.get('/equipment/:equipmentId/history', authMiddleware, equipmentController.getMaintenanceHistory);

// ─── Schedule ─────────────────────────────────────────────────────────────────
router.post('/schedule', authMiddleware, validate(maintenanceValidation.scheduleMaintenance), maintenanceController.scheduleMaintenance);
router.get('/schedule', authMiddleware, async (req, res) => {
  try {
    const schedules = await Maintenance.find().sort({ scheduledDate: 1 });
    res.json({ data: schedules });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching schedule', error: error.message });
  }
});

// ─── Maintenance Requests ─────────────────────────────────────────────────────
// Using same Maintenance model — requests are maintenance records with status=pending
router.get('/requests', authMiddleware, async (req, res) => {
  try {
    const requests = await Maintenance.find({ status: { $in: ['scheduled', 'in-progress', 'pending'] } }).sort({ createdAt: -1 });
    res.json({ data: requests });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching maintenance requests', error: error.message });
  }
});
router.post('/requests', authMiddleware, async (req, res) => {
  try {
    // Map frontend request fields to Maintenance model
    const maintenance = new Maintenance({
      equipmentId: req.body.equipmentName ?? req.body.equipmentId ?? 'Unknown',
      maintenanceType: 'corrective',
      scheduledDate: req.body.dateNeeded ?? new Date(),
      assignedTechnicians: [],
      status: 'scheduled',
      tasks: req.body.description ? [{ description: req.body.description, status: 'pending' }] : [],
      ...req.body,
    });
    await maintenance.save();
    res.status(201).json({ message: 'Maintenance request submitted', data: maintenance });
  } catch (error: any) {
    res.status(500).json({ message: 'Error submitting maintenance request', error: error.message });
  }
});

// ─── Status Update ────────────────────────────────────────────────────────────
router.patch('/:maintenanceId/status', authMiddleware, validate(maintenanceValidation.updateStatus), maintenanceController.updateMaintenanceStatus);

// ─── Overview ─────────────────────────────────────────────────────────────────
router.get('/overview', authMiddleware, async (req, res) => {
  try {
    const total = await Maintenance.countDocuments();
    const scheduled = await Maintenance.countDocuments({ status: 'scheduled' });
    const inProgress = await Maintenance.countDocuments({ status: 'in-progress' });
    const completed = await Maintenance.countDocuments({ status: 'completed' });
    res.json({ total, scheduled, inProgress, completed });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching overview', error: error.message });
  }
});

// ─── Export ───────────────────────────────────────────────────────────────────
router.get('/reports/export', authMiddleware, async (req, res) => {
  try {
    const records = await Maintenance.find({}).sort({ createdAt: -1 });
    const headers = ['equipmentId,maintenanceType,scheduledDate,status,estimatedDuration'];
    const rows = records.map(r => `${r.equipmentId},${r.maintenanceType},${r.scheduledDate?.toISOString()},${r.status},${r.estimatedDuration ?? ''}`);
    const csv = [...headers, ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=maintenance.csv');
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ message: 'Error exporting', error: error.message });
  }
});

export default router;