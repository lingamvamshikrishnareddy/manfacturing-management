import { Request, Response } from 'express';
import Quality from '../../models/QualityMongoose.model';

class DefectController {
  async reportDefect(req: Request, res: Response) {
    try {
      const defect = await Quality.create(req.body);
      res.status(201).json(defect);
    } catch (error: any) {
      res.status(500).json({ message: 'Error reporting defect', error: error.message });
    }
  }

  async getDefects(req: Request, res: Response) {
    try {
      const defects = await Quality.find(req.query).sort({ createdAt: -1 });
      res.json(defects);
    } catch (error: any) {
      res.status(500).json({ message: 'Error fetching defects', error: error.message });
    }
  }

  async getDefectAnalytics(req: Request, res: Response) {
    try {
      const { startDate, endDate, severity } = req.query;

      // Build query filter
      const filter: any = {};
      if (startDate && endDate) {
        filter.inspectionDate = {
          $gte: new Date(startDate as string), $lte: new Date(endDate as string)
        };
      }
      if (severity) {
        filter.severity = severity;
      }

      const defects = await Quality.find(filter);

      // Calculate analytics
      const analytics = {
        totalDefects: defects.length,
        bySeverity: {
          low: defects.filter(d => d.severity === 'low').length,
          medium: defects.filter(d => d.severity === 'medium').length,
          high: defects.filter(d => d.severity === 'high').length,
          critical: defects.filter(d => d.severity === 'critical').length
        },
        byType: defects.reduce((acc: Record<string, number>, defect) => {
          acc[defect.defectType] = (acc[defect.defectType] || 0) + 1;
          return acc;
        }, {})
      };

      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ message: 'Error fetching defect analytics', error: error.message });
    }
  }
}

export default new DefectController();