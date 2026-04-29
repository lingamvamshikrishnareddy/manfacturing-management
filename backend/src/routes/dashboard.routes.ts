import { Router } from 'express';
import DashboardController from '../controllers/dashboard/DashboardController';
import { authMiddleware } from '../middlewares/auth.middleware';
import Employee from '../models/EmployeeMongoose.model';
import Production from '../models/Production.model';
import Quality from '../models/QualityMongoose.model';
import Maintenance from '../models/Maintenance.model';

const router = Router();

// ─── KPIs ─────────────────────────────────────────────────────────────────────
router.get('/kpis', authMiddleware, DashboardController.getKPIs);

// ─── Overview ─────────────────────────────────────────────────────────────────
router.get('/overview', authMiddleware, async (req, res) => {
  try {
    const [employees, productions, qualityChecks, maintenances] = await Promise.all([
      Employee.countDocuments({ status: 'active' }),
      Production.countDocuments(),
      Quality.countDocuments(),
      Maintenance.countDocuments({ status: 'scheduled' }),
    ]);
    res.json({ activeEmployees: employees, totalProduction: productions, qualityChecks, scheduledMaintenance: maintenances });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching overview', error: error.message });
  }
});

// ─── Analytics ────────────────────────────────────────────────────────────────
router.get('/analytics', authMiddleware, async (req, res) => {
  try {
    const range = req.query.range as string ?? '30d';
    const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [totalProduction, qualityChecks, passedChecks] = await Promise.all([
      Production.countDocuments({ createdAt: { $gte: since } }),
      Quality.countDocuments({ createdAt: { $gte: since } }),
      Quality.countDocuments({ status: 'resolved', createdAt: { $gte: since } }),
    ]);

    const qualityRate = qualityChecks > 0 ? Math.round((passedChecks / qualityChecks) * 100) : 100;
    const efficiency = 87.5; // Would need equipment metrics for real value

    res.json({ totalProduction, qualityRate, efficiency, qualityChecks, passedChecks, range });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
});

// ─── Alerts ───────────────────────────────────────────────────────────────────
router.get('/alerts', authMiddleware, async (req, res) => {
  try {
    const [lowQuality, scheduledMaint] = await Promise.all([
      Quality.find({ severity: 'critical', status: 'open' }).limit(5),
      Maintenance.find({ status: 'scheduled' }).sort({ scheduledDate: 1 }).limit(5),
    ]);

    const alerts = [
      ...lowQuality.map(q => ({ type: 'quality', message: `Critical defect in batch ${q.batchId}: ${q.defectType}`, severity: 'critical', createdAt: q.inspectionDate })),
      ...scheduledMaint.map(m => ({ type: 'maintenance', message: `Maintenance scheduled for ${m.equipmentId}`, severity: 'info', createdAt: m.scheduledDate })),
    ];
    res.json({ data: alerts });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching alerts', error: error.message });
  }
});

// ─── Recent Activity ──────────────────────────────────────────────────────────
router.get('/recent-activity', authMiddleware, async (req, res) => {
  try {
    const recentProduction = await Production.find({}).sort({ createdAt: -1 }).limit(5);
    const recentQuality = await Quality.find({}).sort({ createdAt: -1 }).limit(3);

    const activity = [
      ...recentProduction.map(p => ({ type: 'production', description: `Work order ${p.workOrderId} - ${p.status}`, timestamp: (p as any).createdAt })),
      ...recentQuality.map(q => ({ type: 'quality', description: `${q.defectType} reported - ${q.severity}`, timestamp: (q as any).createdAt })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8);

    res.json({ data: activity });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching recent activity', error: error.message });
  }
});

export default router;