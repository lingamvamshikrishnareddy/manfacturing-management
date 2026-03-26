// inventoryAPI.ts
import axios from 'axios';

export interface StockItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  minLevel: number;
  maxLevel: number;
  location: string;
  lastUpdated: string;
}

export interface MaterialRequest {
  id: string;
  itemId: string;
  quantity: number;
  requestedBy: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestDate: string;
  requiredDate: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  rating: number;
  activeStatus: boolean;
}

export const inventoryAPI = {
  // Stock Levels
  async getStockLevels(params?: any) {
    const response = await axios.get('/api/inventory/stock', { params });
    return response.data;
  },

  async updateStockLevel(id: string, updateData: Partial<StockItem>) {
    const response = await axios.put(`/api/inventory/stock/${id}`, updateData);
    return response.data;
  },

  // Material Requests
  async getMaterialRequests(params?: any) {
    const response = await axios.get('/api/inventory/requests', { params });
    return response.data;
  },

  async createMaterialRequest(requestData: Omit<MaterialRequest, 'id'>) {
    const response = await axios.post('/api/inventory/requests', requestData);
    return response.data;
  },

  async updateMaterialRequest(id: string, updateData: Partial<MaterialRequest>) {
    const response = await axios.put(`/api/inventory/requests/${id}`, updateData);
    return response.data;
  },

  // Supplier Management
  async getSuppliers(params?: any) {
    const response = await axios.get('/api/inventory/suppliers', { params });
    return response.data;
  },

  async createSupplier(supplierData: Omit<Supplier, 'id'>) {
    const response = await axios.post('/api/inventory/suppliers', supplierData);
    return response.data;
  },

  async updateSupplier(id: string, updateData: Partial<Supplier>) {
    const response = await axios.put(`/api/inventory/suppliers/${id}`, updateData);
    return response.data;
  },

  // Inventory Reports
  async getInventoryReports(params?: any) {
    const response = await axios.get('/api/inventory/reports', { params });
    return response.data;
  },

  async generateInventoryReport(reportConfig: any) {
    const response = await axios.post('/api/inventory/reports/generate', reportConfig);
    return response.data;
  }
};
