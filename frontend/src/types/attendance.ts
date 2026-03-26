// Types for Attendance Management System

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  timeIn: string;
  timeOut: string;
  status: 'present' | 'absent' | 'late' | 'half-day';
  notes?: string;
}

export interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  halfDay: number;
}

export type AttendanceView = 'daily' | 'monthly';

export interface TableColumn {
  key: string;
  title: string;
  width?: string;
  sortable?: boolean;
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  email: string;
  phone?: string;
}

export interface AttendanceFormData {
  employeeId: string;
  date: string;
  timeIn: string;
  timeOut: string;
  status: AttendanceRecord['status'];
  notes?: string;
}