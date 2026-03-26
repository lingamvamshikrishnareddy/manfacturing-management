import axios from './config';

export const employeeAPI = {
  async getEmployees(params?: any) {
    const response = await axios.get(`/api/employees`, { params });
    return response.data;
  },

  async getEmployee(id: string) {
    const response = await axios.get(`/api/employees/${id}`);
    return response.data;
  },

  async createEmployee(employeeData: any) {
    const response = await axios.post(`/api/employees`, employeeData);
    return response.data;
  },

  async updateEmployee(id: string, updateData: any) {
    const response = await axios.put(`/api/employees/${id}`, updateData);
    return response.data;
  },

  async getShifts(params?: any) {
    const response = await axios.get(`/api/employees/shifts`, { params });
    return response.data;
  },

  async getShiftSchedules(params?: any) {
    const response = await axios.get(`/api/employees/shifts/schedules`, { params });
    return response.data;
  },

  async getAttendance(params?: any) {
    const response = await axios.get(`/api/employees/attendance`, { params });
    return response.data;
  },

  async recordAttendance(attendanceData: any) {
    const response = await axios.post(`/api/employees/attendance`, attendanceData);
    return response.data;
  },

  async createShift(shiftData: any) {
    const response = await axios.post(`/api/employees/shifts`, shiftData);
    return response.data;
  },

  async updateShift(id: string, updateData: any) {
    const response = await axios.put(`/api/employees/shifts/${id}`, updateData);
    return response.data;
  },

  async deleteShift(id: string) {
    const response = await axios.delete(`/api/employees/shifts/${id}`);
    return response.data;
  }
};