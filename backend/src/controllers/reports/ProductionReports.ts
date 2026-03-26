import { Request, Response } from 'express';
import Production from '../../models/Production.model';
import Quality from '../../models/QualityMongoose.model';
import Equipment from '../../models/Equipment.model';
import { ERPIntegration } from '../../services/erp/ERPIntegration';
import logger from '../../utils/logger';

export class ProductionReportsController {
  private erpService: ERPIntegration;

  constructor() {
    this.erpService = new ERPIntegration();
  }

  public async getProductionEfficiency(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      
      const pipeline = [
        {
          $match: {
            createdAt: {
              $gte: new Date(startDate as string),
              $lte: new Date(endDate as string)
            },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            avgEfficiency: { $avg: '$efficiency' },
            totalProduction: { $sum: '$quantity' },
            totalDowntime: { $sum: '$downtime' },
            completedOrders: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': 1 as const, '_id.month': 1 as const, '_id.day': 1 as const }
        }
      ];

      const efficiencyData = await Production.aggregate(pipeline);

      // Calculate KPIs
      const kpis = this.calculateProductionKPIs(efficiencyData);

      res.json({
        message: 'Production efficiency report generated successfully',
        data: efficiencyData,
        kpis
      });
    } catch (error) {
      logger.error('Error generating production efficiency report:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  private calculateProductionKPIs(data: any[]): object {
    const totalProduction = data.reduce((sum, day) => sum + day.totalProduction, 0);
    const avgEfficiency = data.reduce((sum, day) => sum + day.avgEfficiency, 0) / data.length;
    const totalDowntime = data.reduce((sum, day) => sum + day.totalDowntime, 0);
    
    return {
      totalProduction,
      avgEfficiency,
      totalDowntime,
      productivityIndex: (avgEfficiency * totalProduction) / (totalDowntime + 1),
      completedOrders: data.reduce((sum, day) => sum + day.completedOrders, 0)
    };
  }

  public async getQualityMetrics(req: Request, res: Response): Promise<void> {
    try {
      const pipeline = [
        {
          $lookup: {
            from: 'qualities',
            localField: 'workOrderId',
            foreignField: 'workOrderId',
            as: 'qualityChecks'
          }
        },
        {
          $unwind: '$qualityChecks'
        },
        {
          $group: {
            _id: '$productName',
            totalProduced: { $sum: '$quantity' },
            defectCount: {
              $sum: {
                $size: '$defects'
              }
            },
            failedInspections: {
              $sum: {
                $cond: [{ $eq: ['$qualityChecks.status', 'failed'] }, 1, 0]
              }
            }
          }
        },
        {
          $project: {
            productName: '$_id',
            totalProduced: 1,
            defectRate: {
              $multiply: [
                { $divide: ['$defectCount', '$totalProduced'] },
                100
              ]
            },
            failureRate: {
              $multiply: [
                { $divide: ['$failedInspections', '$totalProduced'] },
                100
              ]
            }
          }
        }
      ];

      const qualityMetrics = await Production.aggregate(pipeline);

      res.json({
        message: 'Quality metrics report generated successfully',
        metrics: qualityMetrics
      });
    } catch (error) {
      logger.error('Error generating quality metrics report:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  public async getEquipmentUtilization(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      const pipeline = [
        {
          $match: {
            createdAt: {
              $gte: new Date(startDate as string),
              $lte: new Date(endDate as string)
            }
          }
        },
        {
          $lookup: {
            from: 'equipment',
            localField: 'equipmentId',
            foreignField: '_id',
            as: 'equipment'
          }
        },
        {
          $unwind: '$equipment'
        },
        {
          $group: {
            _id: '$equipmentId',
            equipmentName: { $first: '$equipment.name' },
            totalRuntime: { $sum: '$runtime' },
            totalDowntime: { $sum: '$downtime' },
            maintenanceCount: { 
              $sum: {
                $cond: [{ $eq: ['$equipment.status', 'maintenance'] }, 1, 0]
              }
            }
          }
        },
        {
          $project: {
            equipmentName: 1,
            totalRuntime: 1,
            totalDowntime: 1,
            maintenanceCount: 1,
            utilizationRate: {
              $multiply: [
                {
                  $divide: [
                    '$totalRuntime',
                    { $add: ['$totalRuntime', '$totalDowntime'] }
                  ]
                },
                100
              ]
            }
          }
        }
      ];

      const utilizationData = await Equipment.aggregate(pipeline);

      // Sync with ERP system if available
      await this.syncEquipmentDataWithERP(utilizationData);

      res.json({
        message: 'Equipment utilization report generated successfully',
        data: utilizationData
      });
    } catch (error) {
      logger.error('Error generating equipment utilization report:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  private async syncEquipmentDataWithERP(utilizationData: any[]): Promise<void> {
    try {
      await this.erpService.syncEquipmentUtilization(utilizationData);
    } catch (error) {
      logger.warn('Failed to sync equipment data with ERP:', error);
      // Continue execution even if ERP sync fails
    }
  }

  public async getOverallProductionSummary(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      // Get efficiency data
      const efficiencyData = await this.getEfficiencyData(startDate as string, endDate as string);
      
      // Get quality metrics
      const qualityData = await this.getQualityData();
      
      // Get equipment stats
      const equipmentData = await this.getEquipmentData(startDate as string, endDate as string);

      const summary = {
        productionMetrics: this.calculateProductionKPIs(efficiencyData),
        qualityMetrics: this.summarizeQualityData(qualityData),
        equipmentMetrics: this.summarizeEquipmentData(equipmentData),
        periodSummary: {
          startDate,
          endDate,
          totalWorkOrders: efficiencyData.length,
          averageProductionRate: this.calculateAverageProductionRate(efficiencyData)
        }
      };

      res.json({
        message: 'Overall production summary generated successfully',
        summary
      });
    } catch (error) {
      logger.error('Error generating overall production summary:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  private async getEfficiencyData(startDate: string, endDate: string): Promise<any[]> {
    return await Production.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          },
          status: 'completed'
        }
      }
    ]);
  }

  private async getQualityData(): Promise<any[]> {
    return await Quality.find();
  }

  private async getEquipmentData(startDate: string, endDate: string): Promise<any[]> {
    return await Equipment.find({
      lastUsed: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).lean();
  }

  private summarizeQualityData(data: any[]): object {
    const totalChecks = data.length;
    const passedChecks = data.filter(check => check.status === 'passed').length;
    
    return {
      totalQualityChecks: totalChecks,
      passRate: (passedChecks / totalChecks) * 100,
      averageDefectsPerUnit: this.calculateAverageDefects(data)
    };
  }

  private calculateAverageDefects(data: any[]): number {
    const totalDefects = data.reduce((sum, check) => sum + (check.defects?.length || 0), 0);
    return totalDefects / data.length;
  }

  private summarizeEquipmentData(data: any[]): object {
    return {
      totalEquipment: data.length,
      operationalEquipment: data.filter(eq => eq.status === 'operational').length,
      averageUptime: this.calculateAverageUptime(data),
      maintenanceNeeded: data.filter(eq => eq.maintenanceRequired).length
    };
  }

  private calculateAverageUptime(data: any[]): number {
    const uptimes = data.map(eq => (eq.uptime / (eq.uptime + eq.downtime)) * 100);
    return uptimes.reduce((sum, uptime) => sum + uptime, 0) / data.length;
  }

  private calculateAverageProductionRate(data: any[]): number {
    const totalQuantity = data.reduce((sum, record) => sum + record.quantity, 0);
    const totalHours = data.reduce((sum, record) => sum + record.runtime, 0) / 3600; // Convert seconds to hours
    return totalQuantity / totalHours;
  }
}