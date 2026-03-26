import { Request, Response } from 'express';
import Production from '../../models/Production.model';
import Equipment from '../../models/Equipment.model';
import { MachineMonitor } from '../../services/iot/MachineMonitor';
import { AlertService } from '../../services/notifications/AlertService';
import logger from '../../utils/logger';

interface WorkOrderFilters {
  status?: string;
  startDate?: Date;
  endDate?: Date;
  machineId?: string;
}

export class WorkOrderController {
  private machineMonitor: MachineMonitor;
  private alertService: AlertService;

  constructor() {
    this.machineMonitor = new MachineMonitor();
    this.alertService = new AlertService();
  }

  public async createWorkOrder(req: Request, res: Response): Promise<void> {
    try {
      const {
        productName,
        quantity,
        startDate,
        assignedEmployees,
        machineId
      } = req.body;

      // Check machine availability
      const machine = await Equipment.findById(machineId);
      if (!machine || machine.status !== 'operational') {
        res.status(400).json({ message: 'Selected machine is not available' });
        return;
      }

      // Generate unique work order ID
      const workOrderId = `WO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const workOrder = new Production({
        workOrderId,
        productName,
        quantity,
        startDate,
        assignedEmployees,
        machineId
      });

      await workOrder.save();

      // Start machine monitoring
      this.machineMonitor.startMonitoring(machineId);

      // Notify assigned employees
      await this.alertService.notifyEmployees(assignedEmployees, {
        type: 'WORK_ORDER_ASSIGNED',
        workOrderId,
        productName,
        startDate
      });

      res.status(201).json({
        message: 'Work order created successfully',
        workOrder
      });
    } catch (error) {
      logger.error('Error creating work order:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  public async updateWorkOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { workOrderId } = req.params;
      const { status, efficiency, downtime } = req.body;

      const workOrder = await Production.findOne({ workOrderId });
      if (!workOrder) {
        res.status(404).json({ message: 'Work order not found' });
        return;
      }

      workOrder.status = status;
      if (status === 'completed') {
        workOrder.endDate = new Date();
        workOrder.efficiency = efficiency;
        workOrder.downtime = downtime;

        // Stop machine monitoring
        this.machineMonitor.stopMonitoring(workOrder.machineId);

        // Update machine status
        await Equipment.findByIdAndUpdate(workOrder.machineId, {
          status: 'operational',
          lastMaintenanceDate: new Date()
        });
      }

      await workOrder.save();

      // Notify relevant personnel
      await this.alertService.notifyStatusChange(workOrder);

      res.json({
        message: 'Work order status updated successfully',
        workOrder
      });
    } catch (error) {
      logger.error('Error updating work order status:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  public async getWorkOrders(req: Request, res: Response): Promise<void> {
    try {
      const filters: WorkOrderFilters = {};
      
      if (req.query.status) filters.status = req.query.status as string;
      if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
      if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);
      if (req.query.machineId) filters.machineId = req.query.machineId as string;

      const workOrders = await Production.find(filters)
        .populate('assignedEmployees', 'name email')
        .populate('machineId', 'name status')
        .sort({ createdAt: -1 });

      res.json({
        message: 'Work orders retrieved successfully',
        workOrders
      });
    } catch (error) {
      logger.error('Error retrieving work orders:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  public async getWorkOrderAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const pipeline = [
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgEfficiency: { $avg: '$efficiency' },
            totalDowntime: { $sum: '$downtime' }
          }
        }
      ];

      const analytics = await Production.aggregate(pipeline);

      res.json({
        message: 'Work order analytics retrieved successfully',
        analytics
      });
    } catch (error) {
      logger.error('Error retrieving work order analytics:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default new WorkOrderController();