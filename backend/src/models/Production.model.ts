// src/models/Production.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IProduction extends Document {
  workOrderId: string;
  productName: string;
  quantity: number;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  assignedEmployees: string[];
  machineId: string;
  qualityChecks: {
    inspectionId: string;
    status: 'passed' | 'failed';
    notes: string;
  }[];
  defects: {
    type: string;
    count: number;
    severity: 'low' | 'medium' | 'high';
  }[];
  efficiency: number;
  downtime: number;
}

const ProductionSchema = new Schema({
  workOrderId: { type: String, required: true, unique: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  status: { 
    type: String, 
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  assignedEmployees: [{ type: Schema.Types.ObjectId, ref: 'Employee' }],
  machineId: { type: Schema.Types.ObjectId, ref: 'Equipment' },
  qualityChecks: [{
    inspectionId: { type: Schema.Types.ObjectId, ref: 'Inspection' },
    status: { type: String, enum: ['passed', 'failed'] },
    notes: String
  }],
  defects: [{
    type: String,
    count: Number,
    severity: { type: String, enum: ['low', 'medium', 'high'] }
  }],
  efficiency: { type: Number, default: 0 },
  downtime: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IProduction>('Production', ProductionSchema);