import { EventEmitter } from 'events';
import { MachineMonitor } from './MachineMonitor';
import Equipment from '../../models/Equipment.model';
import { AlertService } from '../notifications/AlertService';
import logger from '../../utils/logger';

export class SensorService extends EventEmitter {
  private monitors: Map<string, MachineMonitor>;
  private alertService: AlertService;

  constructor() {
    super();
    this.monitors = new Map();
    this.alertService = new AlertService();
    this.initializeEventListeners();
  }

  private initializeEventListeners(): void {
    this.on('anomaly-detected', async (data: any) => {
      await this.handleAnomaly(data);
    });

    this.on('maintenance-required', async (equipmentId: string) => {
      await this.scheduleMaintenance(equipmentId);
    });
  }

  public async startMonitoring(equipmentId: string): Promise<void> {
    const monitor = new MachineMonitor();
    this.monitors.set(equipmentId, monitor);
    monitor.startMonitoring(equipmentId);

    monitor.on('metrics', (data) => {
      this.analyzeMetrics(data);
    });
  }

  private async analyzeMetrics(data: any): Promise<void> {
    const equipment = await Equipment.findById(data.machineId);
    if (!equipment) return;

    const anomalies = this.detectAnomalies(data, equipment.specifications);
    if (anomalies.length > 0) {
      this.emit('anomaly-detected', { 
        equipmentId: data.machineId, 
        anomalies 
      });
    }
  }

  private detectAnomalies(metrics: any, specifications: any): string[] {
    const anomalies: string[] = [];
    
    if (metrics.temperature > specifications.maxTemperature) {
      anomalies.push('high-temperature');
    }
    if (metrics.vibration > specifications.maxVibration) {
      anomalies.push('excessive-vibration');
    }
    
    return anomalies;
  }

  private async handleAnomaly(data: any): Promise<void> {
    await this.alertService.sendAlert({
      type: 'EQUIPMENT_ANOMALY',
      machineId: data.equipmentId,
      message: `Anomalies detected: ${data.anomalies.join(', ')}`
    });

    if (data.anomalies.includes('high-temperature')) {
      await Equipment.findByIdAndUpdate(data.equipmentId, {
        status: 'maintenance',
        maintenanceStatus: 'required'
      });
      this.emit('maintenance-required', data.equipmentId);
    }
  }

  private async scheduleMaintenance(equipmentId: string): Promise<void> {
    // Implement maintenance scheduling logic
  }
}