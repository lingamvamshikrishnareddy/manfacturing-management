// types/index.ts - Complete type definitions with all missing types
import { ReactNode } from 'react';

export type SortDirection = 'asc' | 'desc';

// Generic Column interface that works with any data type
export interface Column<T = any> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  render?: (value: any, row: T, index: number) => React.ReactNode;
}

// User types - ADDED MISSING TYPE
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'operator' | 'supervisor';
  department: string;
  avatar?: string;
  lastLogin?: string;
  isActive: boolean;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

// Employee types
export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  role: 'admin' | 'supervisor' | 'operator' | 'technician';
  shift: string;
  status: 'active' | 'inactive' | 'on-leave';
  joiningDate: string;
  skills: string[];
  certifications: string[];
  phone?: string;
  address?: string;
  emergencyContact?: object;
  createdAt: string;
  updatedAt: string;
}

// Shift types - ADDED MISSING TYPE
export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  department: string;
  supervisor: string;
  employees: Employee[];
  maxCapacity?: number;
  currentCapacity?: number;
  status: 'active' | 'inactive';
  shiftType: 'morning' | 'afternoon' | 'night' | 'rotating';
  breakDuration?: number;
  location?: string;
}

// Production/Schedule types - ADDED MISSING TYPE
export interface ScheduleEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  type: 'production' | 'maintenance' | 'meeting' | 'training' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled' | 'postponed';
  assignedTo?: string[];
  location?: string;
  resources?: string[];
  notes?: string;
  color?: string;
  recurring?: boolean;
  recurrencePattern?: string;
}

// Inventory types - ADDED MISSING TYPE
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  sku: string;
  quantity: number;
  unit: string;
  minStock: number;
  maxStock: number;
  reorderLevel: number;
  cost: number;
  price: number;
  supplier: string;
  location: string;
  lastUpdated: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'on-order';
  expiryDate?: string;
  batchNumber?: string;
}

export interface StockItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  location: string;
  supplier: string;
  lastUpdated: string;
  cost: number;
}

// Production types - ADDED MISSING TYPES
export interface ProductionBatch {
  id: string;
  batchNumber: string;
  productId: string;
  productName: string;
  quantity: number;
  targetQuantity: number;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled' | 'on-hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: string;
  endDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  assignedShift?: string;
  assignedOperators?: string[];
  qualityStatus?: 'pending' | 'passed' | 'failed';
  notes?: string;
  materials?: MaterialUsage[];
  defects?: number;
  yieldPercentage?: number;
}

export interface MaterialUsage {
  materialId: string;
  materialName: string;
  quantityUsed: number;
  quantityRequired: number;
  unit: string;
  cost: number;
}

export interface ProductionOrder {
  id: string;
  orderNumber: string;
  productName: string;
  quantity: number;
  startDate: string;
  endDate: string;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  assignedShift?: string;
  notes?: string;
}

// Maintenance types
export interface MaintenanceRequest {
  id: string;
  equipmentId: string;
  equipmentName: string;
  requestType: 'breakdown' | 'routine' | 'preventive';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  description: string;
  requestedBy: string;
  requestDate: string;
  assignedTo?: string;
  completionDate?: string;
  notes?: string;
}

export interface MaintenanceSchedule {
  id: string;
  equipmentId: string;
  equipmentName: string;
  maintenanceType: string;
  frequency: string;
  nextDue: string;
  procedures: string[];
  lastPerformed?: string;
  assignedTechnician?: string;
  estimatedDuration: number;
  priority: 'low' | 'medium' | 'high';
}

export interface SparePart {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  minimumStock: number;
  location: string;
  supplier: string;
  lastOrdered: string;
  cost: number;
  description: string;
}

// Quality types
export interface QualityCheck {
  id: string;
  batchNumber: string;
  productName: string;
  checkDate: string;
  status: 'passed' | 'failed' | 'pending';
  defects: number;
  inspector: string;
  notes?: string;
  testResults?: QualityTestResult[];
}

export interface QualityTestResult {
  testName: string;
  result: 'pass' | 'fail';
  value?: string | number;
  specification?: string;
  notes?: string;
}

export interface Defect {
  id: string;
  batchNumber: string;
  defectType: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  discoveredDate: string;
  description: string;
  discoveredBy: string;
  assignedTo: string;
  resolutionNotes?: string;
}

// Equipment types
export interface Equipment {
  id: string;
  name: string;
  type: string;
  model: string;
  manufacturer: string;
  serialNumber: string;
  location: string;
  status: 'operational' | 'maintenance' | 'breakdown' | 'offline';
  installationDate: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  specifications?: { [key: string]: any };
}

// Redux State Types - ADDED MISSING TYPES
export interface UserState {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  permissions: string[];
}

export interface InventoryState {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
  totalItems: number;
  lowStockItems: InventoryItem[];
  categories: string[];
  searchTerm: string;
  filters: {
    category: string;
    status: string;
    location: string;
  };
}

export interface ProductionState {
  batches: ProductionBatch[];
  orders: ProductionOrder[];
  loading: boolean;
  error: string | null;
  totalBatches: number;
  activeBatches: ProductionBatch[];
  completedBatches: ProductionBatch[];
  schedules: ScheduleEvent[];
  currentShift?: Shift;
}

export interface MaintenanceState {
  requests: MaintenanceRequest[];
  schedules: MaintenanceSchedule[];
  spareParts: SparePart[];
  equipment: Equipment[];
  loading: boolean;
  error: string | null;
  upcomingMaintenance: MaintenanceSchedule[];
  overdueMaintenance: MaintenanceSchedule[];
}

export interface QualityState {
  checks: QualityCheck[];
  defects: Defect[];
  loading: boolean;
  error: string | null;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  pendingChecks: number;
}

// Root State Type
export interface RootState {
  user: UserState;
  inventory: InventoryState;
  production: ProductionState;
  maintenance: MaintenanceState;
  quality: QualityState;
}

// Generic Table Props interface - UPDATED TO SUPPORT GENERICS
export interface TableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  onSort?: (key: string, direction: SortDirection) => void;
  sortable?: boolean;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
  pagination?: boolean;
  pageSize?: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message: string;
  success: boolean;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

export interface FormConfig {
  fields: FormField[];
  submitText: string;
  title: string;
  description?: string;
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
}