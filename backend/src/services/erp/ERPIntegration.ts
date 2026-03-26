import axios from 'axios';
import logger from '../../utils/logger';

export class ERPIntegration {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.ERP_BASE_URL || '';
    this.apiKey = process.env.ERP_API_KEY || '';
  }

  public async syncProductionData(workOrderData: any): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/production-sync`, workOrderData, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      });
    } catch (error) {
      logger.error('ERP sync error:', error);
      throw error;
    }
  }

  public async getInventoryLevels(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/inventory`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      });
      return response.data;
    } catch (error) {
      logger.error('ERP inventory fetch error:', error);
      throw error;
    }
  }

  public async syncEquipmentUtilization(utilizationData: any): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/equipment-utilization`, utilizationData, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      });
    } catch (error) {
      logger.error('ERP equipment utilization sync error:', error);
      throw error;
    }
  }
}
