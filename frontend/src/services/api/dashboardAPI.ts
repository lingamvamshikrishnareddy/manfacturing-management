import axios from './config';

export const dashboardAPI = {
  async getKPIs() {
    const response = await axios.get('/api/dashboard/kpis');
    return response.data;
  }
};