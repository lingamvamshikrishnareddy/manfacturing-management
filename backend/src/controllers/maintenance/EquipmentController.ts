import { Request, Response } from 'express';
import Equipment from '../../models/Equipment.model';
import Maintenance from '../../models/Maintenance.model';
import { SensorService } from '../../services/iot/SensorService';
import logger from '../../utils/logger';

export class EquipmentController {
  private sensorService: SensorService;

  constructor() {
    this.sensorService = new SensorService();
  }

  public async addEquipment(req: Request, res: Response): Promise<void> {
    try {
      const {
        name,
        type,
        location,
        specifications
      } = req.body;

      const equipment = new Equipment({
        name,
        type,
        location,
        specifications,
        status: 'operational'
      });

      await equipment.save();

      // Start IoT monitoring
      await this.sensorService.startMonitoring(equipment._id);

      res.status(201).json({
        message: 'Equipment added successfully',
        equipment
      });
    } catch (error) {
      logger.error('Error adding equipment:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  public async getMaintenanceHistory(req: Request, res: Response): Promise<void> {
    try {
      const { equipmentId } = req.params;

      const history = await Maintenance.find({ equipmentId })
        .populate('assignedTechnicians', 'name')
        .sort({ createdAt: -1 });

      res.json({
        message: 'Maintenance history retrieved successfully',
        history
      });
    } catch (error) {
      logger.error('Error retrieving maintenance history:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
