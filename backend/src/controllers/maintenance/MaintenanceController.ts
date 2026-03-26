import { Request, Response } from 'express';
import Maintenance from '../../models/Maintenance.model';
import Equipment from '../../models/Equipment.model';
import { AlertService } from '../../services/notifications/AlertService';
import { MachineMonitor } from '../../services/iot/MachineMonitor';
import logger from '../../utils/logger';

export class MaintenanceController {
  private alertService: AlertService;
  private machineMonitor: MachineMonitor;

  constructor() {
    this.alertService = new AlertService();
    this.machineMonitor = new MachineMonitor();
  }

  public async scheduleMaintenance(req: Request, res: Response): Promise<void> {
    try {
      const {
        equipmentId,
        maintenanceType,
        scheduledDate,
        assignedTechnicians,
        estimatedDuration,
        tasks
      } = req.body;

      const maintenance = new Maintenance({
        equipmentId,
        maintenanceType,
        scheduledDate,
        assignedTechnicians,
        estimatedDuration,
        tasks,
        status: 'scheduled'
      });

      await maintenance.save();

      // Update equipment status
      await Equipment.findByIdAndUpdate(equipmentId, {
        nextMaintenanceDate: scheduledDate,
        maintenanceStatus: 'scheduled'
      });

      // Notify assigned technicians
      await this.alertService.notifyTechnicians(maintenance);

      res.status(201).json({
        message: 'Maintenance scheduled successfully',
        maintenance
      });
    } catch (error) {
      logger.error('Error scheduling maintenance:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  public async updateMaintenanceStatus(req: Request, res: Response): Promise<void> {
    try {
      const { maintenanceId } = req.params;
      const { status, completionNotes, partsReplaced } = req.body;

      const maintenance = await Maintenance.findById(maintenanceId);
      if (!maintenance) {
        res.status(404).json({ message: 'Maintenance record not found' });
        return;
      }

      maintenance.status = status;
      maintenance.completionNotes = completionNotes;
      maintenance.partsReplaced = partsReplaced;

      if (status === 'completed') {
        maintenance.completedAt = new Date();
        
        // Update equipment status
        await Equipment.findByIdAndUpdate(maintenance.equipmentId, {
          lastMaintenanceDate: new Date(),
          maintenanceStatus: 'completed',
          status: 'operational'
        });

        // Resume machine monitoring
        this.machineMonitor.startMonitoring(maintenance.equipmentId);
      }

      await maintenance.save();

      res.json({
        message: 'Maintenance status updated successfully',
        maintenance
      });
    } catch (error) {
      logger.error('Error updating maintenance status:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}