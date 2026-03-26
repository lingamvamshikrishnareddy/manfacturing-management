// src/models/AttendanceRecordMongoose.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendanceRecord extends Document {
  employeeId: string;
  date: Date;
  clockIn?: Date;
  clockOut?: Date;
  breakStart?: Date;
  breakEnd?: Date;
  totalHours?: number;
  overtimeHours?: number;
  status: 'present' | 'absent' | 'late' | 'half-day' | 'on-leave';
  notes?: string;
  location?: string;
  calculateTotalHours(): number;
}

const AttendanceRecordSchema = new Schema({
  employeeId: {
    type: String,
    required: true,
    ref: 'Employee'
  },
  date: {
    type: Date,
    required: true
  },
  clockIn: {
    type: Date,
    required: false
  },
  clockOut: {
    type: Date,
    required: false
  },
  breakStart: {
    type: Date,
    required: false
  },
  breakEnd: {
    type: Date,
    required: false
  },
  totalHours: {
    type: Number,
    required: false
  },
  overtimeHours: {
    type: Number,
    required: false,
    default: 0
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half-day', 'on-leave'],
    required: true,
    default: 'present'
  },
  notes: {
    type: String,
    required: false
  },
  location: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Method to calculate total hours
AttendanceRecordSchema.methods.calculateTotalHours = function(): number {
  if (!this.clockIn || !this.clockOut) return 0;
  
  const clockInTime = new Date(this.clockIn).getTime();
  const clockOutTime = new Date(this.clockOut).getTime();
  let totalMs = clockOutTime - clockInTime;
  
  // Subtract break time if available
  if (this.breakStart && this.breakEnd) {
    const breakStartTime = new Date(this.breakStart).getTime();
    const breakEndTime = new Date(this.breakEnd).getTime();
    const breakMs = breakEndTime - breakStartTime;
    totalMs -= breakMs;
  }
  
  return Math.max(0, totalMs / (1000 * 60 * 60)); // Convert to hours
};

// Pre-save hook to auto-calculate total hours
AttendanceRecordSchema.pre<IAttendanceRecord>('save', function(next) {
  if (this.clockIn && this.clockOut) {
    this.totalHours = this.calculateTotalHours();
  }
  next();
});

// Indexes
AttendanceRecordSchema.index({ employeeId: 1, date: 1 }, { unique: true });
AttendanceRecordSchema.index({ date: 1 });
AttendanceRecordSchema.index({ status: 1 });

export default mongoose.model<IAttendanceRecord>('AttendanceRecord', AttendanceRecordSchema);