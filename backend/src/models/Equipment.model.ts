// src/models/Equipment.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IEquipment extends Document {
  name: string;
  type: string;
  status: 'operational' | 'maintenance' | 'breakdown';
  location: string;
  maintenanceStatus: string;
  lastMaintenanceDate: Date;
  nextMaintenanceDate: Date;
  metrics: {
    temperature: number;
    vibration: number;
    powerConsumption: number;
  };
  specifications: Record<string, any>;
}

const EquipmentSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['operational', 'maintenance', 'breakdown'],
    default: 'operational'
  },
  location: { type: String, required: true },
  maintenanceStatus: String,
  lastMaintenanceDate: Date,
  nextMaintenanceDate: Date,
  metrics: {
    temperature: Number,
    vibration: Number,
    powerConsumption: Number
  },
  specifications: Schema.Types.Mixed
});

export default mongoose.model<IEquipment>('Equipment', EquipmentSchema);