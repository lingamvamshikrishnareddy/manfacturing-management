import { EventEmitter } from 'events';
import Equipment from '../../models/Equipment.model';
import { AlertService } from '../notifications/AlertService';
import logger from '../../utils/logger';

export class MachineMonitor extends EventEmitter {
  private monitoredMachines: Map<string, NodeJS.Timeout>;
  private alertService: AlertService;

  constructor() {
    super();
    this.monitoredMachines = new Map();
    this.alertService = new AlertService();
  }

  public startMonitoring(machineId: string): void {
    if (this.monitoredMachines.has(machineId)) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const machine = await Equipment.findById(machineId);
        if (!machine) {
          this.stopMonitoring(machineId);
          return;
        }

        // Simulate IoT sensor data
        const temperature = Math.random() * 100;
        const vibration = Math.random() * 10;
        const powerConsumption = Math.random() * 1000;

        // Check for anomalies
        if (temperature > 80) {
          await this.alertService.sendAlert({
            type: 'HIGH_TEMPERATURE',
            machineId,
            value: temperature,
            threshold: 80
          });
        }

        if (vibration > 8) {
          await this.alertService.sendAlert({
            type: 'HIGH_VIBRATION',
            machineId,
            value: vibration,
            threshold: 8
          });
        }

        // Update machine metrics
        await Equipment.findByIdAndUpdate(machineId, {
          $set: {
            'metrics.temperature': temperature,
            'metrics.vibration': vibration,
            'metrics.powerConsumption': powerConsumption
          }
        });

        this.emit('metrics', {
          machineId,
          temperature,
          vibration,
          powerConsumption
        });
      } catch (error) {
        logger.error('Error monitoring machine:', error);
      }
    }, 5000);

    this.monitoredMachines.set(machineId, interval);
  }

  public stopMonitoring(machineId: string): void {
    const interval = this.monitoredMachines.get(machineId);
    if (interval) {
      clearInterval(interval);
      this.monitoredMachines.delete(machineId);
    }
  }
}