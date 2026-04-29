// src/services/api.ts — Centralized API service
import api from './api/config';

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardService = {
  getKPIs: () => api.get('/api/dashboard/kpis'),
  getOverview: () => api.get('/api/dashboard/overview'),
  getRecentActivity: () => api.get('/api/dashboard/recent-activity'),
  getAlerts: () => api.get('/api/dashboard/alerts'),
  getAnalytics: (range: string) => api.get('/api/dashboard/analytics', { params: { range } }),
};

// ─── Production ───────────────────────────────────────────────────────────────
export const productionService = {
  getOverview: () => api.get('/api/production/overview'),
  getRecent: () => api.get('/api/production/recent'),
  // Batches
  getBatches: () => api.get('/api/production/batches'),
  createBatch: (data: any) => api.post('/api/production/batches', data),
  exportBatches: () => api.get('/api/production/batches/export', { responseType: 'blob' }),
  // Schedule
  getSchedule: () => api.get('/api/production/schedule'),
  createScheduleEvent: (data: any) => api.post('/api/production/schedule', data),
  // Work Orders
  getWorkOrders: () => api.get('/api/production/work-orders'),
  createWorkOrder: (data: any) => api.post('/api/production/work-orders', data),
  updateWorkOrder: (id: string, data: any) => api.put(`/api/production/work-orders/${id}`, data),
  // Lines / status
  getLineStatus: () => api.get('/api/production/lines/status'),
};

// ─── Inventory ────────────────────────────────────────────────────────────────
export const inventoryService = {
  getOverview: () => api.get('/api/inventory/overview'),
  // Stock
  getItems: () => api.get('/api/inventory/items'),
  createItem: (data: any) => api.post('/api/inventory/items', data),
  updateItem: (id: string, data: any) => api.put(`/api/inventory/items/${id}`, data),
  // also support legacy /stock endpoint
  getStock: () => api.get('/api/inventory/stock'),
  // Suppliers
  getSuppliers: () => api.get('/api/inventory/suppliers'),
  createSupplier: (data: any) => api.post('/api/inventory/suppliers', data),
  updateSupplier: (id: string, data: any) => api.put(`/api/inventory/suppliers/${id}`, data),
  // Requests
  getRequests: () => api.get('/api/inventory/requests'),
  createRequest: (data: any) => api.post('/api/inventory/requests', data),
  // Reports
  exportReport: () => api.get('/api/inventory/reports/export', { responseType: 'blob' }),
};

// ─── Quality ──────────────────────────────────────────────────────────────────
export const qualityService = {
  getOverview: () => api.get('/api/quality/overview'),
  // Inspections
  getInspections: () => api.get('/api/quality/inspections'),
  createInspection: (data: any) => api.post('/api/quality/inspections', data),
  updateInspection: (id: string, data: any) => api.put(`/api/quality/inspections/${id}`, data),
  // Defects
  getDefects: () => api.get('/api/quality/defects'),
  createDefect: (data: any) => api.post('/api/quality/defects', data),
  // Reports
  getReports: () => api.get('/api/quality/reports'),
  exportReports: () => api.get('/api/quality/reports/export', { responseType: 'blob' }),
  // Forms
  getForms: () => api.get('/api/quality/forms'),
  createForm: (data: any) => api.post('/api/quality/forms', data),
};

// ─── Maintenance ──────────────────────────────────────────────────────────────
export const maintenanceService = {
  getOverview: () => api.get('/api/maintenance/overview'),
  // Requests
  getRequests: () => api.get('/api/maintenance/requests'),
  createRequest: (data: any) => api.post('/api/maintenance/requests', data),
  updateRequest: (id: string, data: any) => api.patch(`/api/maintenance/${id}/status`, data),
  // Schedule
  getSchedule: () => api.get('/api/maintenance/schedule'),
  createSchedule: (data: any) => api.post('/api/maintenance/schedule', data),
  // Equipment
  getEquipment: () => api.get('/api/maintenance/equipment'),
  createEquipment: (data: any) => api.post('/api/maintenance/equipment', data),
  getEquipmentHistory: (id: string) => api.get(`/api/maintenance/equipment/${id}/history`),
  // Parts
  getParts: () => api.get('/api/maintenance/parts'),
  createPart: (data: any) => api.post('/api/maintenance/parts', data),
  // Export
  exportReport: () => api.get('/api/maintenance/reports/export', { responseType: 'blob' }),
};

// ─── Employees ────────────────────────────────────────────────────────────────
export const employeeService = {
  getAll: () => api.get('/api/employees'),
  getById: (id: string) => api.get(`/api/employees/${id}`),
  create: (data: any) => api.post('/api/employees', data),
  update: (id: string, data: any) => api.put(`/api/employees/${id}`, data),
  // Shifts
  getShifts: () => api.get('/api/employees/shifts'),
  createShift: (data: any) => api.post('/api/employees/shifts', data),
  assignShift: (data: any) => api.post('/api/employees/shifts/assign', data),
  getShiftSchedule: () => api.get('/api/employees/shifts/schedule'),
  // Attendance
  getAttendance: (params?: any) => api.get('/api/employees/attendance', { params }),
  recordAttendance: (data: any) => api.post('/api/employees/attendance', data),
  // Skills
  getSkills: () => api.get('/api/employees/skills'),
  createSkill: (data: any) => api.post('/api/employees/skills', data),
  updateSkillMatrix: (data: any) => api.put('/api/employees/skills/matrix', data),
};

// ─── Utility: Trigger file download from blob response ────────────────────────
export function triggerDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
