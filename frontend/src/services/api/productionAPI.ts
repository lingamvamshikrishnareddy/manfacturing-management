// productionAPI.ts
import axios from './config';

export interface ProductionLineStatus {
  id: string;
  lineName: string;
  status: 'running' | 'stopped' | 'maintenance';
  currentBatch: string;
  efficiency: number;
  startTime: string;
  plannedEndTime: string;
}

export interface WorkOrder {
  id: string;
  orderNumber: string;
  product: string;
  quantity: number;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: number;
  startDate: string;
  dueDate: string;
}

export interface Schedule {
  id: string;
  lineId: string;
  workOrderId: string;
  startTime: string;
  endTime: string;
  status: 'planned' | 'in-progress' | 'completed';
}

export interface BatchInfo {
  id: string;
  batchNumber: string;
  workOrderId: string;
  product: string;
  quantity: number;
  startTime: string;
  endTime: string;
  status: 'in-progress' | 'completed' | 'quarantine';
  qualityChecks: any[];
}

export const productionAPI = {
  // Production Line
  async getProductionLineStatus(params?: any) {
    const response = await axios.get('/api/production/lines/status', { params });
    return response.data;
  },

  async updateLineStatus(id: string, updateData: Partial<ProductionLineStatus>) {
    const response = await axios.put(`/api/production/lines/${id}/status`, updateData);
    return response.data;
  },

  // Work Orders
  async getWorkOrders(params?: any) {
    const response = await axios.get('/api/production/work-orders', { params });
    return response.data;
  },

  async createWorkOrder(orderData: Omit<WorkOrder, 'id'>) {
    const response = await axios.post('/api/production/work-orders', orderData);
    return response.data;
  },

  async updateWorkOrder(id: string, updateData: Partial<WorkOrder>) {
    const response = await axios.put(`/api/production/work-orders/${id}`, updateData);
    return response.data;
  },

  // Schedule Planner
  async getProductionSchedule(params?: any) {
    const response = await axios.get('/api/production/schedule', { params });
    return response.data;
  },

  async createScheduleEntry(scheduleData: Omit<Schedule, 'id'>) {
    const response = await axios.post('/api/production/schedule', scheduleData);
    return response.data;
  },

  async updateScheduleEntry(id: string, updateData: Partial<Schedule>) {
    const response = await axios.put(`/api/production/schedule/${id}`, updateData);
    return response.data;
  },

  // Batch Tracking
  async getBatchInfo(params?: any) {
    const response = await axios.get('/api/production/batches', { params });
    return response.data;
  },

  async createBatch(batchData: Omit<BatchInfo, 'id'>) {
    const response = await axios.post('/api/production/batches', batchData);
    return response.data;
  },

  async updateBatch(id: string, updateData: Partial<BatchInfo>) {
    const response = await axios.put(`/api/production/batches/${id}`, updateData);
    return response.data;
  }
};