import { Request, Response } from 'express';
import Quality from '../../models/QualityMongoose.model';
import { logError } from '../../utils/logger';
import Employee from '../../models/EmployeeMongoose.model';

class QualityReportsController {
  async getDefectTrends(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      
      const defects = await Quality.aggregate([
        {
          $match: {
            inspectionDate: {
              $gte: new Date(startDate as string),
              $lte: new Date(endDate as string)
            }
          }
        },
        {
          $group: {
            _id: {
              defectType: '$defectType',
              severity: '$severity'
            },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            defectType: '$_id.defectType',
            severity: '$_id.severity',
            count: 1,
            _id: 0
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);
 
      res.json(defects);
    } catch (error: unknown) {
      logError('Error generating defect trends report', { error });
      res.status(500).json({
        message: 'Error generating defect trends report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getQualityMetrics(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;
 
      // Calculate various quality metrics
      const totalInspections = await Quality.countDocuments({
        inspectionDate: {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string)
        }
      });
 
      const defectsByType = await Quality.aggregate([
        {
          $match: {
            inspectionDate: {
              $gte: new Date(startDate as string),
              $lte: new Date(endDate as string)
            }
          }
        },
        {
          $group: {
            _id: '$defectType',
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            defectType: '$_id',
            count: 1,
            _id: 0
          }
        }
      ]);
 
      const criticalDefects = await Quality.countDocuments({
        inspectionDate: {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string)
        },
        severity: 'critical'
      });
 
      const metrics = {
        totalInspections,
        defectsByType,
        criticalDefects,
        defectRate: totalInspections > 0 ? (criticalDefects / totalInspections) * 100 : 0,
        timeframe: {
          start: startDate,
          end: endDate
        }
      };
 
      res.json(metrics);
    } catch (error: unknown) {
      logError('Error generating quality metrics', { error });
      res.status(500).json({
        message: 'Error generating quality metrics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getQualityByBatch(req: Request, res: Response) {
    try {
      const { batchId } = req.params;
 
      const batchQuality = await Quality.find({ batchId })
        .populate('inspectedBy', 'firstName lastName employeeId')
        .sort({ inspectionDate: -1 })
        .exec();
 
      // Calculate batch statistics
      const totalDefects = batchQuality.length;
      const defectsBySeverity = batchQuality.reduce((acc: Record<string, number>, curr: { severity: string }) => {
        acc[curr.severity] = (acc[curr.severity] || 0) + 1;
        return acc;
      }, {});
 
      const report = {
        batchId,
        totalDefects,
        defectsBySeverity,
        inspectionHistory: batchQuality,
        batchStatus: totalDefects === 0 ? 'PASSED' :
          defectsBySeverity.critical > 0 ? 'FAILED' : 'WARNING'
      };
 
      res.json(report);
    } catch (error: unknown) {
      logError('Error generating batch quality report', { error, batchId: req.params.batchId });
      res.status(500).json({
        message: 'Error generating batch quality report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async generateMonthlyReport(req: Request, res: Response) {
    try {
      const { month, year } = req.query;
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0);
 
      const monthlyData = await Quality.find({
        inspectionDate: {
          $gte: startDate,
          $lte: endDate
        }
      })
      .populate('inspectedBy', 'firstName lastName employeeId')
      .sort({ inspectionDate: 1 })
      .exec();
 
      // Aggregate monthly statistics
      const report = {
        period: `${month}/${year}`,
        summary: {
          totalInspections: monthlyData.length,
          defectsByType: {} as Record<string, number>,
          defectsBySeverity: {} as Record<string, number>,
          inspectorPerformance: {} as Record<string, { name: string; inspections: number; defectsFound: number }>
        },
        details: monthlyData
      };
 
      // Calculate aggregates
      for (const record of monthlyData) {
        // Count defects by type
        report.summary.defectsByType[record.defectType] =
          (report.summary.defectsByType[record.defectType] || 0) + 1;
          
        // Count defects by severity
        report.summary.defectsBySeverity[record.severity] =
          (report.summary.defectsBySeverity[record.severity] || 0) + 1;
          
        // Track inspector performance
        const inspectorId = record.inspectedBy as unknown as string;
        if (!report.summary.inspectorPerformance[inspectorId]) {
          // Get the employee data from the association
          const employee = await Employee.findById(inspectorId);
          report.summary.inspectorPerformance[inspectorId] = {
            name: employee ? `${employee.firstName} ${employee.lastName}` : `Inspector ${inspectorId}`,
            inspections: 0,
            defectsFound: 0
          };
        }
        report.summary.inspectorPerformance[inspectorId].inspections++;
        report.summary.inspectorPerformance[inspectorId].defectsFound++;
      }
 
      res.json(report);
    } catch (error: unknown) {
      logError('Error generating monthly quality report', {
        error,
        month: req.query.month,
        year: req.query.year
      });
      res.status(500).json({
        message: 'Error generating monthly quality report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default new QualityReportsController();