import { Router } from 'express';
import { InspectionController } from '../controllers/quality/InspectionController';
import DefectController from '../controllers/quality/DefectController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { qualityValidation } from '../validations/quality.validation';
import Quality from '../models/QualityMongoose.model';

const router = Router();
const inspectionController = new InspectionController();
const defectController = DefectController;

// ─── Inspections ──────────────────────────────────────────────────────────────
router.post('/inspections', authMiddleware, validate(qualityValidation.createInspection), inspectionController.createInspection);
router.get('/inspections/work-order/:workOrderId', authMiddleware, inspectionController.getInspectionsByWorkOrder);

// GET all inspections (backed by Quality model which tracks inspections/defects)
router.get('/inspections', authMiddleware, async (req, res) => {
  try {
    const inspections = await Quality.find().sort({ createdAt: -1 });
    res.json({ data: inspections });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching inspections', error: error.message });
  }
});

// PUT update inspection status
router.put('/inspections/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await Quality.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Inspection not found' });
    res.json({ message: 'Inspection updated', data: updated });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating inspection', error: error.message });
  }
});

// ─── Defects ──────────────────────────────────────────────────────────────────
router.post('/defects', authMiddleware, validate(qualityValidation.reportDefect), defectController.reportDefect);
router.get('/defects', authMiddleware, defectController.getDefects);
router.get('/defects/analytics', authMiddleware, defectController.getDefectAnalytics);

// ─── Reports ──────────────────────────────────────────────────────────────────
router.get('/reports', authMiddleware, async (req, res) => {
  try {
    const total = await Quality.countDocuments();
    const passed = await Quality.countDocuments({ status: 'resolved' });
    const failed = await Quality.countDocuments({ status: 'open' });
    const bySeverity = {
      low: await Quality.countDocuments({ severity: 'low' }),
      medium: await Quality.countDocuments({ severity: 'medium' }),
      high: await Quality.countDocuments({ severity: 'high' }),
      critical: await Quality.countDocuments({ severity: 'critical' }),
    };
    res.json({ data: [{ title: 'Quality Summary Report', total, passed, failed, bySeverity, createdAt: new Date() }] });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching quality reports', error: error.message });
  }
});

router.get('/reports/export', authMiddleware, async (req, res) => {
  try {
    const records = await Quality.find({}).sort({ createdAt: -1 });
    const headers = ['batchId,defectType,severity,status,inspectedBy,inspectionDate'];
    const rows = records.map(r => `${r.batchId},${r.defectType},${r.severity},${r.status},${r.inspectedBy},${r.inspectionDate?.toISOString()}`);
    const csv = [...headers, ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=quality-report.csv');
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ message: 'Error exporting', error: error.message });
  }
});

// ─── Overview ────────────────────────────────────────────────────────────────
router.get('/overview', authMiddleware, async (req, res) => {
  try {
    const total = await Quality.countDocuments();
    const open = await Quality.countDocuments({ status: 'open' });
    const resolved = await Quality.countDocuments({ status: 'resolved' });
    const qualityRate = total > 0 ? Math.round((resolved / total) * 100) : 100;
    res.json({ total, open, resolved, qualityRate });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching overview', error: error.message });
  }
});

export default router;
