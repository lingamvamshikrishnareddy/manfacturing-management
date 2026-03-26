import { EmailService } from './EmailService';
import Employee from '../../models/EmployeeMongoose.model';
import logger from '../../utils/logger';

interface Alert {
  type: string;
  machineId?: string;
  value?: number;
  threshold?: number;
  message?: string;
}

export class AlertService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  public async sendAlert(alert: Alert): Promise<void> {
    try {
      // Get relevant employees based on alert type
      const recipients = await this.getAlertRecipients(alert.type);
      
      const message = this.formatAlertMessage(alert);
      
      // Send email notifications
      await Promise.all(
        recipients.map(recipient =>
          this.emailService.sendEmail({
            to: recipient.email,
            subject: `Alert: ${alert.type}`,
            body: message
          })
        )
      );

      // Log alert
      logger.info('Alert sent:', {
        type: alert.type,
        recipients: recipients.length,
        message
      });
    } catch (error) {
      logger.error('Error sending alert:', error);
    }
  }

  private async getAlertRecipients(alertType: string): Promise<any[]> {
    let query = {};

    switch (alertType) {
      case 'HIGH_TEMPERATURE':
      case 'HIGH_VIBRATION':
        query = { role: 'maintenance' };
        break;
      case 'QUALITY_ISSUE':
        query = { role: 'quality' };
        break;
      case 'PRODUCTION_DELAY':
        query = { role: 'supervisor' };
        break;
      default:
        query = { role: 'manager' };
    }

    return Employee.find(query).select('email firstName lastName');
  }

  private formatAlertMessage(alert: Alert): string {
    switch (alert.type) {
      case 'HIGH_TEMPERATURE':
      case 'HIGH_VIBRATION':
        return `Machine ${alert.machineId} has reported ${alert.type} of ${alert.value} exceeding threshold ${alert.threshold}`;
      default:
        return alert.message || `Alert: ${alert.type}`;
    }
  }

  public async notifyQualityIssue(inspection: any): Promise<void> {
    const alert = {
      type: 'QUALITY_ISSUE',
      message: `Quality inspection failed for Work Order ${inspection.workOrderId}. Immediate attention required.`
    };
    await this.sendAlert(alert);
  }

  public async notifyTechnicians(maintenance: any): Promise<void> {
    const alert = {
      type: 'MAINTENANCE_SCHEDULED',
      message: `Maintenance scheduled for Equipment ${maintenance.equipmentId} on ${maintenance.scheduledDate}`
    };
    await this.sendAlert(alert);
  }

  public async notifyEmployees(employees: any[], message: any): Promise<void> {
    const alert = {
      type: 'GENERAL_NOTIFICATION',
      message: typeof message === 'string' ? message : `Work Order Assigned: ${message.workOrderId}`
    };
    await this.sendAlert(alert);
  }

  public async notifyStatusChange(workOrder: any): Promise<void> {
    const alert = {
      type: 'WORK_ORDER_STATUS_CHANGE',
      message: `Work Order ${workOrder.id} status changed to ${workOrder.status}`
    };
    await this.sendAlert(alert);
  }
}