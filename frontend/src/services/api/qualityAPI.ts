// src/services/api/qualityAPI.ts
import axios from 'axios';

const BASE_URL = '/api/quality';

export const qualityAPI = {
  async getQualityChecks(params?: any) {
    const response = await axios.get(`${BASE_URL}/checks`, { params });
    return response.data;
  },

  async createQualityCheck(checkData: any) {
    const response = await axios.post(`${BASE_URL}/checks`, checkData);
    return response.data;
  },

  async getDefects(params?: any) {
    const response = await axios.get(`${BASE_URL}/defects`, { params });
    return response.data;
  },

  async reportDefect(defectData: any) {
    const response = await axios.post(`${BASE_URL}/defects`, defectData);
    return response.data;
  },

  async getInspectionForms() {
    const response = await axios.get(`${BASE_URL}/forms`);
    return response.data;
  }
};