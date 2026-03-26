import { Request, Response } from 'express';
import Quality from '../../models/QualityMongoose.model';
import Production from '../../models/Production.model';
import { AlertService } from '../../services/notifications/AlertService';
import logger from '../../utils/logger';

export class InspectionController {
  private alertService: AlertService;

  constructor() {
    this.alertService = new AlertService();
  }

  public async createInspection(req: Request, res: Response): Promise<void> {
    try {
      const {
        workOrderId,
        inspectorId,
        type,
        parameters,
        results
      } = req.body;

      const inspection = await Quality.create({
        batchId: workOrderId,
        inspectedBy: inspectorId,
        defectType: type,
        description: JSON.stringify(parameters),
        status: this.calculateInspectionStatus(results) === 'passed' ? 'resolved' : 'open'
      });

      // Update work order with inspection results
      await Production.findOneAndUpdate(
        { workOrderId },
        {
          $push: {
            qualityChecks: {
              inspectionId: inspection.id,
              status: inspection.status,
              notes: inspection.description
            }
          }
        }
      );

      // Notify relevant personnel if inspection failed
      if (inspection.status === 'open') {
        await this.alertService.notifyQualityIssue(inspection);
      }

      res.status(201).json({
        message: 'Inspection created successfully',
        inspection
      });
    } catch (error: any) {
      logger.error('Error creating inspection:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  private calculateInspectionStatus(results: any[]): 'passed' | 'failed' {
    const failedTests = results.filter(result => !result.passed).length;
    return failedTests === 0 ? 'passed' : 'failed';
  }

  public async getInspectionsByWorkOrder(req: Request, res: Response): Promise<void> {
    try {
      const { workOrderId } = req.params;
      const inspections = await Quality.find({ batchId: workOrderId }).sort({ createdAt: -1 });

      res.json({
        message: 'Inspections retrieved successfully',
        inspections
      });
    } catch (error: any) {
      logger.error('Error retrieving inspections:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }
}