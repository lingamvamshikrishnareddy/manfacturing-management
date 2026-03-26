// types/employee.ts - Employee-specific type definitions

export interface Shift {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    type: 'morning' | 'evening' | 'night' | string;
    isActive: boolean;
    department?: string;
    maxCapacity?: number;
    currentCapacity?: number;
    breakDuration?: number;
    location?: string;
}

export interface ShiftSchedule {
    id: string;
    employeeId: string;
    shiftId: string;
    date: string;
    status?: 'scheduled' | 'completed' | 'absent';
}

export interface ShiftStats {
    totalShifts: number;
    activeShifts: number;
    totalEmployees: number;
    onLeave: number;
}
