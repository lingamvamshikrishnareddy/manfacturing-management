// src/models/Maintenance.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IMaintenance extends Document {
  equipmentId: string;
  maintenanceType: 'preventive' | 'corrective' | 'predictive';
  scheduledDate: Date;
  assignedTechnicians: string[];
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  estimatedDuration: number;
  tasks: {
    description: string;
    status: 'pending' | 'completed';
    completedBy?: string;
  }[];
  partsReplaced?: {
    partId: string;
    quantity: number;
    cost: number;
  }[];
  completionNotes?: string;
  completedAt?: Date;
}

const MaintenanceSchema = new Schema({
  equipmentId: { type: Schema.Types.ObjectId, ref: 'Equipment', required: true },
  maintenanceType: { 
    type: String, 
    enum: ['preventive', 'corrective', 'predictive'],
    required: true 
  },
  scheduledDate: { type: Date, required: true },
  assignedTechnicians: [{ type: Schema.Types.ObjectId, ref: 'Employee' }],
  status: { 
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  estimatedDuration: Number,
  tasks: [{
    description: String,
    status: { type: String, enum: ['pending', 'completed'] },
    completedBy: { type: Schema.Types.ObjectId, ref: 'Employee' }
  }],
  partsReplaced: [{
    partId: { type: Schema.Types.ObjectId, ref: 'Inventory' },
    quantity: Number,
    cost: Number
  }],
  completionNotes: String,
  completedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IMaintenance>('Maintenance', MaintenanceSchema);