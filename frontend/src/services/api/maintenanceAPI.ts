// src/services/api/maintenanceAPI.ts

import axios from 'axios';


export const maintenanceAPI = {
    async getMaintenanceRequests(params?: any) {
      const response = await axios.get(`/api/maintenance/requests`, { params });
      return response.data;
    },
  
    async createMaintenanceRequest(requestData: any) {
      const response = await axios.post(`/api/maintenance/requests`, requestData);
      return response.data;
    },
  
    async updateMaintenanceRequest(id: string, updateData: any) {
      const response = await axios.put(`/api/maintenance/requests/${id}`, updateData);
      return response.data;
    },
  
    async getPreventiveMaintenance(params?: any) {
      const response = await axios.get(`/api/maintenance/preventive`, { params });
      return response.data;
    },
  
    async getEquipmentHistory(equipmentId: string) {
      const response = await axios.get(`/api/maintenance/equipment/${equipmentId}/history`);
      return response.data;
    }
  };
  